import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener sección por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const seccion = await prisma.seccionHomepage.findUnique({
            where: { id }
        })

        if (!seccion) {
            return NextResponse.json({ error: 'Sección no encontrada' }, { status: 404 })
        }

        return NextResponse.json(seccion)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener sección' }, { status: 500 })
    }
}

// PUT - Actualizar sección
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        const seccion = await prisma.seccionHomepage.update({
            where: { id },
            data: {
                titulo: data.titulo,
                subtitulo: data.subtitulo,
                activa: data.activa,
                config: data.config
            }
        })

        return NextResponse.json(seccion)
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar sección' }, { status: 500 })
    }
}

// DELETE - Eliminar sección
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.seccionHomepage.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar sección' }, { status: 500 })
    }
}
