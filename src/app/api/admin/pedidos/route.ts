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
