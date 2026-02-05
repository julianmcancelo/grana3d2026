import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener novedad
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const novedad = await prisma.novedad.findUnique({
            where: { id }
        })

        if (!novedad) {
            return NextResponse.json({ error: 'Novedad no encontrada' }, { status: 404 })
        }

        return NextResponse.json({ novedad })
    } catch (error) {
        console.error('Error obteniendo novedad:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

// PUT - Actualizar novedad
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const novedad = await prisma.novedad.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ novedad })
    } catch (error) {
        console.error('Error actualizando novedad:', error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

// DELETE - Eliminar novedad
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.novedad.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminando novedad:', error)
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
