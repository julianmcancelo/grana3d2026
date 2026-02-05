import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    try {
        const banner = await prisma.promoBanner.findUnique({
            where: { id }
        })
        return NextResponse.json(banner)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener banner' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    try {
        const body = await request.json()
        const banner = await prisma.promoBanner.update({
            where: { id },
            data: {
                titulo: body.titulo,
                descripcion: body.descripcion,
                etiqueta: body.etiqueta,
                link: body.link,
                textoBoton: body.textoBoton,
                colorFondo: body.colorFondo,
                activo: body.activo,
                orden: body.orden,
                updatedAt: new Date()
            }
        })
        return NextResponse.json(banner)
    } catch (error) {
        return NextResponse.json({ error: 'Error al actualizar banner' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params
    try {
        await prisma.promoBanner.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar banner' }, { status: 500 })
    }
}
