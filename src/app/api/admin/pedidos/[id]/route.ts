import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Actualizar estado del pedido
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { estado } = body

        const pedido = await prisma.pedido.update({
            where: { id },
            data: { estado }
        })

        return NextResponse.json({ pedido })
    } catch (error) {
        console.error('Error actualizando pedido:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// GET - Obtener un pedido específico
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                usuario: {
                    select: { nombre: true, email: true }
                }
            }
        })

        if (!pedido) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ pedido })
    } catch (error) {
        console.error('Error obteniendo pedido:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
