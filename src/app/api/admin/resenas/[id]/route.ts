import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - Actualizar reseña
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const data = await request.json()
        const { id } = await params

        const resena = await prisma.resena.update({
            where: { id },
            data: {
                nombre: data.nombre,
                texto: data.texto,
                rating: data.rating,
                imagen: data.imagen,
                activa: data.activa
            }
        })

        return NextResponse.json(resena)
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar reseña' }, { status: 500 })
    }
}

// DELETE - Eliminar reseña
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        await prisma.resena.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar reseña' }, { status: 500 })
    }
}
