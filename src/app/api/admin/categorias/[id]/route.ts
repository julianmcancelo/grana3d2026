import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener categoría por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const categoria = await prisma.categoria.findUnique({
            where: { id },
            include: { _count: { select: { productos: true } } }
        })

        if (!categoria) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
        }

        return NextResponse.json(categoria)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener categoría' }, { status: 500 })
    }
}

// PUT - Actualizar categoría
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        // Si cambia el slug, verificar que no exista
        if (data.slug) {
            const existente = await prisma.categoria.findFirst({
                where: { slug: data.slug, NOT: { id } }
            })
            if (existente) {
                return NextResponse.json({ error: 'El slug ya está en uso' }, { status: 400 })
            }
        }

        const categoria = await prisma.categoria.update({
            where: { id },
            data: {
                ...(data.nombre !== undefined && { nombre: data.nombre }),
                ...(data.slug !== undefined && { slug: data.slug }),
                ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
                ...(data.imagen !== undefined && { imagen: data.imagen }),
                ...(data.icono !== undefined && { icono: data.icono }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.orden !== undefined && { orden: data.orden }),
                ...(data.activo !== undefined && { activo: data.activo }),
                updatedAt: new Date()
            }
        })

        return NextResponse.json(categoria)
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 })
    }
}

// DELETE - Eliminar categoría
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verificar si tiene productos
        const categoria = await prisma.categoria.findUnique({
            where: { id },
            include: { _count: { select: { productos: true } } }
        })

        if (!categoria) {
            return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 })
        }

        if (categoria._count.productos > 0) {
            return NextResponse.json({
                error: `No se puede eliminar: tiene ${categoria._count.productos} productos asociados`
            }, { status: 400 })
        }

        await prisma.categoria.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 })
    }
}
