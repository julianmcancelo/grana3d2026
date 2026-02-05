import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener banner
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const banner = await prisma.banner.findUnique({
            where: { id }
        })

        if (!banner) {
            return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ banner })
    } catch (error) {
        console.error('Error obteniendo banner:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

// PUT - Actualizar banner
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        const banner = await prisma.banner.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ banner })
    } catch (error) {
        console.error('Error actualizando banner:', error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

// DELETE - Eliminar banner
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.banner.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminando banner:', error)
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
