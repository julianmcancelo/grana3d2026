import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const authHeader = (await headers()).get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const token = authHeader.replace('Bearer ', '')
        const payload = await verifyToken(token)
        
        if (!payload) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }

        const pedidos = await prisma.pedido.findMany({
            where: { usuarioId: String(payload.id) },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(pedidos)

    } catch (error) {
        console.error('Error obteniendo mis pedidos:', error)
        return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }
}
