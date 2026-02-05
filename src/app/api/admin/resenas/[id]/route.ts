import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener reseña
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const resena = await prisma.resena.findUnique({ where: { id } })

        if (!resena) {
            return NextResponse.json({ error: 'Reseña no encontrada' }, { status: 404 })
        }

        return NextResponse.json(resena)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener reseña' }, { status: 500 })
    }
}

// PUT - Actualizar reseña
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        const resena = await prisma.resena.update({
            where: { id },
            data: {
                nombre: data.nombre,
                texto: data.texto,
                rating: data.rating,
                imagen: data.imagen,
                activa: data.activa,
                orden: data.orden
            }
        })

        return NextResponse.json(resena)
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar reseña' }, { status: 500 })
    }
}

// DELETE - Eliminar reseña
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.resena.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar reseña' }, { status: 500 })
    }
}
