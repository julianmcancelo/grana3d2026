import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { crearPreferencia } from '@/lib/mercadopago'
import { getGlobalConfig } from '@/lib/config'

// Definición de tipos para los datos que recibimos del cliente
interface ItemEntrada {
    id: string
    cantidad: number
    variante?: any
}

// Datos del cliente necesarios para el envío y facturación
interface DatosCliente {
    nombre: string
    apellido?: string
    email: string
    telefono?: string
    dni?: string
    direccion?: string
    ciudad?: string
    provincia?: string
    codigoPostal?: string
}

export async function POST(request: NextRequest) {
    try {
        const cuerpo = await request.json()
        const { items, cliente, metodoPago, metodoEnvio, cuponCodigo } = cuerpo as {
            items: ItemEntrada[],
            cliente: DatosCliente,
            metodoPago: any,
            metodoEnvio: any,
            cuponCodigo?: string
        }

        // Validaciones básicas
        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
        }
        if (!cliente || !cliente.email || !cliente.nombre) {
            return NextResponse.json({ error: 'Faltan datos obligatorios del cliente' }, { status: 400 })
        }

        // 1. Intentar obtener el usuario autenticado (si existe)
        let usuarioId = null
        let esMayorista = false
        try {
            const authHeader = (await headers()).get('authorization')
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const payload = await verifyToken(token)
                if (payload) {
                    usuarioId = String(payload.id)
                    // Fetch user role immediately for price calculation
                    const usuario = await prisma.usuario.findUnique({
                        where: { id: usuarioId },
                        select: { rol: true }
                    })
                    if (usuario?.rol === 'MAYORISTA') {
                        esMayorista = true
                    }
                }
            }
        } catch (e) {
            // Si falla la verificación del token, asumimos que es un usuario invitado
        }

        // 2. Procesar productos y calcular totales (Autoridad del Servidor)
        let totalCalculado = 0
        const itemsProcesados = []

        for (const item of items) {
            const producto = await prisma.producto.findUnique({
                where: { id: item.id },
                select: { id: true, nombre: true, precio: true, precioOferta: true, precioMayorista: true, stock: true, sumaCupoMayorista: true, variantes: true }
            })

            if (!producto) {
                return NextResponse.json({ error: `Producto no encontrado (ID: ${item.id})` }, { status: 404 })
            }

            if (producto.stock < item.cantidad) {
                return NextResponse.json({ error: `Stock insuficiente para el producto: ${producto.nombre}` }, { status: 409 })
            }

            // --- CÁLCULO DE PRECIO (Backend Authority) ---

            // 1. Determinar el Precio Base (Retail vs Mayorista)
            let basePrice = producto.precioOferta || producto.precio
            if (esMayorista && producto.precioMayorista) {
                basePrice = producto.precioMayorista
            }

            // 2. Calcular Extras por Variantes
            let variantPriceDelta = 0

            // Analizamos la variante seleccionada si existe
            // item.variante suele ser un string (ej: "Color: Rojo, Talle: L") o un objeto
            // Pero para el precio, necesitamos saber QUÉ opción eligió.
            // Asumimos que el cliente manda algo que nos permite identificar la opción.
            // NOTA CRÍTICA: El frontend actual manda un string combinado o un objeto. 
            // Si el carrito guarda las opciones seleccionadas por ID de grupo, deberíamos recibir eso.
            // Revisando CarritoContext: guarda "variante" como string. 
            // Revisando ProductoClient: construye el string de variante visualmente.
            // Para seguridad real, deberíamos recibir los IDs de las opciones seleccionadas.
            // POR AHORA: Con el sistema actual, el backend NO tiene forma fácil de validar el precio de la variante 
            // porque item.variante es solo texto plano (ej. "Talle: XL").
            // SIN EMBARGO, el usuario espera que el total coincida.
            // SOLUCIÓN TEMPORAL ROBUSTA: 
            // Confiamos en el "precio" unitario que manda el frontend PERO lo validamos contra un rango razonable?
            // NO, eso es inseguro.
            // Debemos intentar parsear el string o asumir que el precio base es lo que cobramos 
            // y que los extras están implícitos? No.

            // REVISIÓN ESTRATEGIA: 
            // El `item` que viene del frontend en `POST /api/pedidos` tiene: id, cantidad, variante (string).
            // NO TIENE los IDs de opciones. Esto es una deuda técnica del proyecto original.
            // Para "impactar" el precio mayorista correctamente sin romper todo:
            // Usaremos el precio base correcto (Mayorista vs Retail) que ya calculamos arriba.
            // Si hay variantes, lamentablemente con la arquitectura actual, el backend no puede re-calcular 
            // el extra exacto sin los IDs de las opciones.

            // PROPUESTA DE MEJORA INMEDIATA (FIX):
            // Si el sistema no manda opciones IDs, no podemos validar variantes en backend.
            // Pero SÍ podemos validar el precio base.
            // Si el frontend manda un `item.precio` (que sí lo tiene el item del carrito), podríamos usarlo 
            // PERO validando que no sea menor al precio base que nos corresponde.

            // CAMBIO: Vamos a confiar parcialmente en el frontend para los EXTRAS de variantes por ahora
            // (ya que refactorizar todo el carrito para mandar IDs de opciones es muy riesgoso ahora),
            // PERO vamos a forzar la BASE correcta.

            // MEJOR AÚN: Vamos a calcular el precio final así:
            // Precio = BaseCorrecta (DB)
            // Si el item tiene un precio unitario que viene del front, calculamos la diferencia (extra).
            // PrecioFinal = BaseCorrecta + (PrecioFront - BaseFront)
            // Esto asume que BaseFront era correcta.

            // HAGÁMOSLO SIMPLE Y SEGURO PARA V1.2:
            // Usamos Precio Base Correcto (Mayorista o Oferta).
            // Si hay variantes en el JSON del producto, intentamos matchear por texto.
            // El texto viene tipo "Talle: XL, Color: Rojo".
            // Iteramos las opciones del producto y vemos si el nombre aparece en el string.

            if (item.variante && typeof item.variante === 'string' && producto.variantes) {
                const variantesJson = producto.variantes as any
                if (variantesJson.groups) {
                    variantesJson.groups.forEach((group: any) => {
                        group.opciones.forEach((op: any) => {
                            // Si el string de variante contiene el nombre de la opción (ej "XL")
                            // Es un matcheo 'loose' pero efectivo para este string format
                            // Riesgo: "Azul" matchea "Azul Oscuro". 
                            // Checkeamos con ": Nombre" o al final de string
                            const regex = new RegExp(`(:\\s*|\\s+)${op.nombre}(\\s*,|$)`, 'i')
                            if (regex.test(item.variante)) {
                                // Encontramos opción. Aplicamos lógica de precio
                                if (esMayorista && typeof op.precioMayorista === 'number' && op.precioMayorista > 0) {
                                    // Override completo del precio para esta opción
                                    // La lógica de frontend para wholesale override es:
                                    // Extra = OptionWholesale - BaseWholesale
                                    const extra = op.precioMayorista - basePrice
                                    variantPriceDelta += extra
                                } else {
                                    variantPriceDelta += op.precioExtra
                                }
                            }
                        })
                    })
                }
            }

            const precioFinal = basePrice + variantPriceDelta
            const subtotal = precioFinal * item.cantidad

            totalCalculado += subtotal

            itemsProcesados.push({
                productoId: producto.id,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: precioFinal,
                subtotal: subtotal,
                variante: item.variante || null
            })
        }

        // 2.5 Validar y Aplicar Cupón (Lógica Servidor)
        let descuentoTotal = 0
        let cuponId = null

        if (cuponCodigo) {
            const cupon = await prisma.cupon.findUnique({ where: { codigo: cuponCodigo } })

            if (cupon && cupon.activo && (!cupon.usosMaximos || cupon.usosActuales < cupon.usosMaximos)) {
                const ahora = new Date()
                const validaFecha = (!cupon.fechaInicio || cupon.fechaInicio <= ahora) && (!cupon.fechaFin || cupon.fechaFin >= ahora)
                const validaMonto = !cupon.minimoCompra || totalCalculado >= cupon.minimoCompra

                if (validaFecha && validaMonto) {
                    cuponId = cupon.id
                    if (cupon.tipo === 'PORCENTAJE') {
                        descuentoTotal = totalCalculado * (cupon.valor / 100)
                        if (cupon.maximoDescuento && descuentoTotal > cupon.maximoDescuento) {
                            descuentoTotal = cupon.maximoDescuento
                        }
                    } else if (cupon.tipo === 'FIJO') {
                        descuentoTotal = cupon.valor
                    }

                    await prisma.cupon.update({
                        where: { id: cupon.id },
                        data: { usosActuales: { increment: 1 } }
                    })
                }
            }
        }

        const totalFinal = Math.max(0, totalCalculado - descuentoTotal)

        // 3. Crear el Pedido en la Base de Datos
        const pedido = await prisma.pedido.create({
            data: {
                nombreCliente: cliente.nombre,
                apellidoCliente: cliente.apellido || '',
                emailCliente: cliente.email,
                telefonoCliente: cliente.telefono || '',
                dniCliente: cliente.dni || '',
                direccionEnvio: cliente.direccion || '',
                ciudadEnvio: cliente.ciudad || '',
                provinciaEnvio: cliente.provincia || '',
                codigoPostalEnvio: cliente.codigoPostal || '',
                total: totalFinal,
                estado: 'PENDIENTE',
                metodoPago: metodoPago || 'EFECTIVO',
                metodoEnvio: metodoEnvio || 'RETIRO_LOCAL',
                items: itemsProcesados,
                usuarioId: usuarioId,
                updatedAt: new Date()
            }
        })

        // Variables para la sincronización con Sheets (scope superior)
        let unidadesEligiblesSheet = 0
        let esMayoristaSheet = false

        // --- LÓGICA MAYORISTA ---
        try {
            if (usuarioId) {
                // Obtener configuración global
                const { mayoristaMinimoInicial, mayoristaMinimoMantenimiento } = await getGlobalConfig()

                // 1. Calcular unidades elegibles (sumaCupoMayorista)
                let unidadesEligibles = 0
                // Usamos itemsProcesados que ya tiene la info básica, pero necesitamos el flag sumaCupoMayorista.
                // Lo consultamos de nuevo para asegurar consistencia.
                for (const item of itemsProcesados) {
                    const prod = await prisma.producto.findUnique({
                        where: { id: item.productoId },
                        select: { sumaCupoMayorista: true }
                    })
                    if (prod?.sumaCupoMayorista) {
                        unidadesEligibles += item.cantidad
                    }
                }

                if (unidadesEligibles > 0) {
                    // Actualizar variable para Sheets
                    unidadesEligiblesSheet = unidadesEligibles

                    if (unidadesEligibles > 0) {
                        // Actualizar variable para Sheets
                        unidadesEligiblesSheet = unidadesEligibles

                        // Ya tenemos esMayorista calculado arriba
                        esMayoristaSheet = esMayorista

                        // Fetch completo del usuario solo si necesitamos actualizarlo (para obtener datos viejos)
                        // O usamos update直接 con condiciones? Mejor leer para lógica de negocio compleja
                        const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } })

                        if (usuario) {
                            const now = new Date()
                            // Vencimiento: 10 del mes siguiente
                            const nextMonth10th = new Date(now.getFullYear(), now.getMonth() + 1, 10)

                            if (!esMayorista) {
                                // Convertir a Mayorista si supera MÍNIMO INICIAL
                                if (unidadesEligibles >= mayoristaMinimoInicial) {
                                    await prisma.usuario.update({
                                        where: { id: usuarioId },
                                        data: {
                                            rol: 'MAYORISTA',
                                            estadoMayorista: 'VIGENTE',
                                            fechaVencimientoMayorista: nextMonth10th,
                                            unidadesMesActual: unidadesEligibles // Arrancamos con lo comprado
                                        }
                                    })
                                    // TODO: Email de bienvenida a mayorista
                                }
                            } else {
                                // Ya es mayorista: Sumar al cupo mensual y verificar MANTENIMIENTO
                                const estaVencido = usuario.estadoMayorista === 'VENCIDO' || (usuario.fechaVencimientoMayorista && usuario.fechaVencimientoMayorista < now)

                                let nuevoEstado = usuario.estadoMayorista
                                let nuevaFechaVencimiento = usuario.fechaVencimientoMayorista
                                const nuevasUnidades = (usuario.unidadesMesActual || 0) + unidadesEligibles

                                // Si cumple el cupo de mantenimiento
                                if (nuevasUnidades >= mayoristaMinimoMantenimiento) {
                                    nuevoEstado = 'VIGENTE'
                                    // Si estaba vencido o su vencimiento es anterior al próximo mes, renovamos
                                    if (estaVencido || !usuario.fechaVencimientoMayorista || usuario.fechaVencimientoMayorista < nextMonth10th) {
                                        nuevaFechaVencimiento = nextMonth10th
                                    }
                                }

                                await prisma.usuario.update({
                                    where: { id: usuarioId },
                                    data: {
                                        unidadesMesActual: nuevasUnidades,
                                        estadoMayorista: nuevoEstado,
                                        fechaVencimientoMayorista: nuevaFechaVencimiento
                                    }
                                })
                            }
                        }
                    }
                }
            }
        } catch (errMayorista) {
            console.error('Error procesando lógica mayorista:', errMayorista)
        }
        // -----------------------

        if (cuponId) {
            try {
                await prisma.usoCupon.create({
                    data: {
                        id: `uso_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        cuponId: cuponId,
                        email: cliente.email,
                        pedidoId: pedido.id,
                        monto: descuentoTotal
                    }
                })
            } catch (e) { console.error('Error registrando uso de cupón', e) }
        }

        // 4. Actualizar Stock
        for (const item of itemsProcesados) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: { stock: { decrement: item.cantidad } }
            })
        }

        // 5. Integración con Mercado Pago
        let urlPago = null
        if (metodoPago === 'MERCADOPAGO') {
            try {
                urlPago = await crearPreferencia(itemsProcesados, pedido.id, cliente.email)
            } catch (error) {
                console.error('Error al generar URL de pago:', error)
            }
        }

        // 6. Enviar Correo de Confirmación
        try {
            const { sendEmail } = await import('@/lib/email')
            const { getOrderConfirmationTemplate } = await import('@/lib/email-templates')
            const { getEmailConfig } = await import('@/lib/config')

            const emailConfig = await getEmailConfig()

            await sendEmail({
                to: cliente.email,
                subject: `Confirmación de Pedido #${pedido.id.slice(-6).toUpperCase()} - ${emailConfig.nombreTienda}`,
                html: getOrderConfirmationTemplate(pedido, itemsProcesados, metodoPago, emailConfig, urlPago || undefined)
            })
        } catch (emailError) {
            console.error('Error enviando correo de pedido:', emailError)
        }

        return NextResponse.json({
            exito: true,
            pedido: {
                id: pedido.id,
                numero: pedido.numero,
                total: pedido.total,
                estado: pedido.estado
            },
            urlPago
        }, { status: 201 })

        // Sincronizar con Google Sheets en segundo plano (sin await para no bloquear)
        import('@/lib/googleSheets').then(({ syncOrderToSheet, syncEstadisticas }) => {
            syncOrderToSheet(pedido, {
                esMayorista: esMayoristaSheet,
                unidadesCupo: unidadesEligiblesSheet
            }).then(() => {
                // Actualizar estadísticas después de sincronizar la venta
                syncEstadisticas()
            })
        }).catch(err => console.error('Error background sync sheet:', err))

    } catch (error) {
        console.error('Error crítico al crear pedido:', error)
        return NextResponse.json({ error: 'Error interno del servidor al procesar el pedido' }, { status: 500 })
    }
}
