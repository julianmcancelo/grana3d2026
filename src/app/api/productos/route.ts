import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const destacados = searchParams.get('destacados') === 'true'
        const limite = parseInt(searchParams.get('limit') || searchParams.get('limite') || '20')
        const categoria = searchParams.get('categoria')
        const todos = searchParams.get('all') === 'true' // Para admin

        const where: any = todos ? {} : { activo: true }
        if (destacados) where.destacado = true
        if (categoria) where.categoria = { slug: categoria }

        const productos = await prisma.producto.findMany({
            where,
            take: limite,
            orderBy: { createdAt: 'desc' },
            include: { categoria: { select: { id: true, nombre: true, slug: true } } }
        })
        return NextResponse.json({ productos })
    } catch (error) {
        console.error('Error fetching productos:', error)
        return NextResponse.json({ productos: [] }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { nombre, descripcion, precio, precioOferta, stock, categoriaId, imagen, activo, destacado } = body

        if (!nombre || !precio) {
            return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
        }

        const slug = slugify(nombre) + '-' + Date.now().toString(36)

        const producto = await prisma.producto.create({
            data: {
                nombre,
                slug,
                descripcion: descripcion || '',
                precio: parseFloat(precio),
                precioOferta: precioOferta ? parseFloat(precioOferta) : null,
                stock: parseInt(stock) || 0,
                categoriaId: categoriaId || null,
                imagen: imagen || null,
                activo: activo !== false,
                destacado: destacado === true,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ producto }, { status: 201 })
    } catch (error) {
        console.error('Error creating producto:', error)
        return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
    }
}
