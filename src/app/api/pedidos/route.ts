import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { crearPreferencia } from '@/lib/mercadopago'

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
        try {
            const authHeader = (await headers()).get('authorization')
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const payload = await verifyToken(token)
                if (payload) {
                    usuarioId = String(payload.id)
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
                select: { id: true, nombre: true, precio: true, precioOferta: true, stock: true }
            })

            if (!producto) {
                return NextResponse.json({ error: `Producto no encontrado (ID: ${item.id})` }, { status: 404 })
            }

            if (producto.stock < item.cantidad) {
                return NextResponse.json({ error: `Stock insuficiente para el producto: ${producto.nombre}` }, { status: 409 })
            }

            const precioFinal = producto.precioOferta || producto.precio
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
                html: getOrderConfirmationTemplate(pedido, itemsProcesados, metodoPago, emailConfig)
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

    } catch (error) {
        console.error('Error crítico al crear pedido:', error)
        return NextResponse.json({ error: 'Error interno del servidor al procesar el pedido' }, { status: 500 })
    }
}
