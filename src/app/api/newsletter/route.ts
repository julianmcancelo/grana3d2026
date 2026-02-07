import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function requireAdmin(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    const payload = await verifyToken(token)
    if (!payload || payload.rol !== 'ADMIN') return null
    return payload
}

// POST - Suscribir email al newsletter
export async function POST(request: NextRequest) {
    try {
        const { email, nombre } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
        }

        // Verificar si ya existe
        const existente = await prisma.suscriptor.findUnique({
            where: { email }
        })

        if (existente) {
            if (existente.activo) {
                return NextResponse.json({ error: 'Ya estás suscrito' }, { status: 400 })
            } else {
                // Reactivar suscripción
                await prisma.suscriptor.update({
                    where: { email },
                    data: { activo: true }
                })
                return NextResponse.json({ message: 'Suscripción reactivada' })
            }
        }

        await prisma.suscriptor.create({
            data: { email, nombre: nombre || null }
        })

        return NextResponse.json({ message: '¡Gracias por suscribirte!' })
    } catch (error) {
        console.error('Error subscribing:', error)
        return NextResponse.json({ error: 'Error al suscribir' }, { status: 500 })
    }
}

// GET - Listar suscriptores (admin)
export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin(request)
        if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const suscriptores = await prisma.suscriptor.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(suscriptores)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener suscriptores' }, { status: 500 })
    }
}
