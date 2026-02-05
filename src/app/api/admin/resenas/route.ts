import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar reseñas
export async function GET() {
    try {
        const resenas = await prisma.resena.findMany({
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json(resenas)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener reseñas' }, { status: 500 })
    }
}

// POST - Crear reseña
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        const maxOrden = await prisma.resena.aggregate({
            _max: { orden: true }
        })

        const resena = await prisma.resena.create({
            data: {
                nombre: data.nombre,
                texto: data.texto,
                rating: data.rating || 5,
                imagen: data.imagen || null,
                activa: data.activa ?? true,
                orden: (maxOrden._max.orden || 0) + 1
            }
        })

        return NextResponse.json(resena)
    } catch (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Error al crear reseña' }, { status: 500 })
    }
}
