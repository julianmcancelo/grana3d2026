import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET: Obtener direcciones del usuario
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const payload = await verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const direcciones = await prisma.direccion.findMany({
            where: { usuarioId: String(payload.id) }
        })

        return NextResponse.json(direcciones)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener direcciones' }, { status: 500 })
    }
}

// POST: Crear nueva dirección
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const payload = await verifyToken(token)
        if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

        const data = await request.json()

        const direccion = await prisma.direccion.create({
            data: {
                ...data,
                usuarioId: String(payload.id)
            }
        })

        return NextResponse.json(direccion)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Error al crear dirección' }, { status: 500 })
    }
}
