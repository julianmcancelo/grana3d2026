import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas las categorías (para admin, incluye inactivas)
export async function GET() {
    try {
        const categorias = await prisma.categoria.findMany({
            orderBy: { orden: 'asc' },
            include: { _count: { select: { productos: true } } }
        })
        return NextResponse.json(categorias)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener categorías' }, { status: 500 })
    }
}

// POST - Crear categoría
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Verificar que el slug no existe
        if (data.slug) {
            const existente = await prisma.categoria.findUnique({
                where: { slug: data.slug }
            })
            if (existente) {
                return NextResponse.json({ error: 'El slug ya existe' }, { status: 400 })
            }
        }

        // Obtener el orden máximo
        const maxOrden = await prisma.categoria.aggregate({
            _max: { orden: true }
        })

        const categoria = await prisma.categoria.create({
            data: {
                nombre: data.nombre,
                slug: data.slug,
                descripcion: data.descripcion || null,
                imagen: data.imagen || null,
                icono: data.icono || 'box',
                color: data.color || '#14b8a6',
                orden: (maxOrden._max.orden || 0) + 1,
                activo: data.activo ?? true,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(categoria)
    } catch (error) {
        console.error('Error creating category:', error)
        return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 })
    }
}
