import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'
import { crearPreferencia } from '@/lib/mercadopago' // Importar Mercado Pago

// Definición de tipos para los datos que recibimos del cliente
interface ItemEntrada {
    id: string
    cantidad: number
    variante?: any // Opcional, por si el producto tiene variantes como color o tamaño
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

/**
 * API Route: POST /api/pedidos
 * Maneja la creación de nuevos pedidos en la base de datos.
 * 
 * Lógica de negocio:
 * 1. Valida que el carrito no esté vacío.
 * 2. Recalcula los precios en el servidor (para evitar manipulaciones desde el frontend).
 * 3. Verifica el stock disponible.
 * 4. Crea el registro del pedido en la base de datos.
 * 5. Descuenta el stock de los productos vendidos.
 * 6. Genera URL de Mercado Pago si aplica.
 */
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
        try {
            const authHeader = (await headers()).get('authorization')
            if (authHeader) {
                const token = authHeader.split(' ')[1]
                const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
                usuarioId = decodificado.id
            }
        } catch (e) {
            // Si falla la verificación del token, asumimos que es un usuario invitado (Guest)
            // No bloqueamos la compra por esto.
        }

        // 2. Procesar productos y calcular totales (Autoridad del Servidor)
        let totalCalculado = 0
        const itemsProcesados = []

        for (const item of items) {
            // Buscamos el producto en la DB para obtener el precio real
            const producto = await prisma.producto.findUnique({
                where: { id: item.id },
                select: { id: true, nombre: true, precio: true, precioOferta: true, stock: true }
            })

            if (!producto) {
                return NextResponse.json({ error: `Producto no encontrado (ID: ${item.id})` }, { status: 404 })
            }

            // Verificación de Stock
            if (producto.stock < item.cantidad) {
                return NextResponse.json({ error: `Stock insuficiente para el producto: ${producto.nombre}` }, { status: 409 })
            }

            // Determinar el precio final (si hay oferta, se usa)
            const precioFinal = producto.precioOferta || producto.precio
            const subtotal = precioFinal * item.cantidad

            totalCalculado += subtotal

            // Guardamos los datos "congelados" del item en el momento de la compra
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
                // Verificar fechas y montos
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
                    // Actualizar usos del cupón
                    await prisma.cupon.update({
                        where: { id: cupon.id },
                        data: { usosActuales: { increment: 1 } }
                    })
                }
            }
        }

        const totalFinal = Math.max(0, totalCalculado - descuentoTotal)

        // 3. Crear el Pedido en la Base de Datos
        // Nota: Usamos el modelo 'Pedido' de Prisma
        const pedido = await prisma.pedido.create({
            data: {
                // Información del Cliente
                nombreCliente: cliente.nombre,
                apellidoCliente: cliente.apellido || '',
                emailCliente: cliente.email,
                telefonoCliente: cliente.telefono || '',
                dniCliente: cliente.dni || '',

                // Información de Envío
                direccionEnvio: cliente.direccion || '',
                ciudadEnvio: cliente.ciudad || '',
                provinciaEnvio: cliente.provincia || '',
                codigoPostalEnvio: cliente.codigoPostal || '',

                // Totales y Estado del Pedido
                total: totalFinal,
                estado: 'PENDIENTE', // Estado inicial
                metodoPago: metodoPago || 'EFECTIVO',
                metodoEnvio: metodoEnvio || 'RETIRO_LOCAL',

                // Relaciones y Datos
                items: itemsProcesados, // Guardamos los items como JSON (compatible con estructura legacy)
                usuarioId: usuarioId,

                // Timestamps
                updatedAt: new Date()
            }
        })

        // Guardar registro explícito de Uso de Cupón si existe la tabla relacionada
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
        // Descontamos la cantidad comprada del stock disponible
        for (const item of itemsProcesados) {
            await prisma.producto.update({
                where: { id: item.productoId },
                data: { stock: { decrement: item.cantidad } }
            })
        }

        // 5. Integración con Mercado Pago
        // Si el método de pago es Mercado Pago, generamos la preferencia
        let urlPago = null
        if (metodoPago === 'MERCADOPAGO') {
            try {
                // Pasamos los items procesados, el ID del pedido y el email del cliente
                urlPago = await crearPreferencia(itemsProcesados, pedido.id, cliente.email)
            } catch (error) {
                console.error('Error al generar URL de pago:', error)
                // Opcional: Podríamos revertir el pedido, pero por ahora lo dejamos PENDIENTE
                // y que el usuario lo intente pagar luego.
            }
        }

        // Respuesta exitosa
        return NextResponse.json({
            exito: true,
            pedido: {
                id: pedido.id,
                numero: pedido.numero,
                total: pedido.total,
                estado: pedido.estado
            },
            urlPago // Devolvemos la URL si existe
        }, { status: 201 })

    } catch (error) {
        console.error('Error crítico al crear pedido:', error)
        return NextResponse.json({ error: 'Error interno del servidor al procesar el pedido' }, { status: 500 })
    }
}
