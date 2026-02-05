import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los pedidos (admin)
export async function GET(request: NextRequest) {
    try {
        const pedidos = await prisma.pedido.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                usuario: {
                    select: { nombre: true, email: true }
                }
            }
        })

        return NextResponse.json({ pedidos })
    } catch (error) {
        console.error('Error obteniendo pedidos:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Crear pedido manual (Admin)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            nombreCliente, emailCliente, telefonoCliente,
            items, total, origen, metodoPago, metodoEnvio, estado
        } = body

        if (!nombreCliente || !items || !total || !origen) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
        }

        const nuevoPedido = await prisma.pedido.create({
            data: {
                nombreCliente,
                emailCliente,
                telefonoCliente,
                items,
                total,
                origen,
                metodoPago: metodoPago || 'EFECTIVO',
                metodoEnvio: metodoEnvio || 'RETIRO_LOCAL',
                estado: estado || 'CONFIRMADO', // Pedidos manuales suelen estar ya confirmados
                // Numero se autoincrementa
            }
        })

        return NextResponse.json({ pedido: nuevoPedido })

    } catch (error) {
        console.error('Error creando pedido manual:', error)
        return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
    }
}
