import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const authHeader = (await headers()).get('authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const token = authHeader.split(' ')[1]
        let usuarioId = null
        try {
            const decodificado = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any
            usuarioId = decodificado.id
        } catch (e) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }

        const pedidos = await prisma.pedido.findMany({
            where: { usuarioId },
            orderBy: { createdAt: 'desc' },
            include: {
                // Si quisieras detalles adicionales, acá los agregás
                // Por ahora el Pedido ya tiene items en JSON, que es suficiente
            }
        })

        return NextResponse.json(pedidos)

    } catch (error) {
        console.error('Error obteniendo mis pedidos:', error)
        return NextResponse.json({ error: 'Error al obtener pedidos' }, { status: 500 })
    }
}
