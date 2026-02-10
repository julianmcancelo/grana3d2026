import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
}

async function requireAdmin(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    const payload = await verifyToken(token)
    if (!payload || payload.rol !== 'ADMIN') return null
    return payload
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const destacados = searchParams.get('destacados') === 'true'
        const limite = parseInt(searchParams.get('limit') || searchParams.get('limite') || '20')
        const categoria = searchParams.get('categoria')
        const todos = searchParams.get('all') === 'true' // Solo admin

        if (todos) {
            const admin = await requireAdmin(request)
            if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

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
        const admin = await requireAdmin(request)
        if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const body = await request.json()
        const {
            nombre, descripcion, precio, precioOferta, stock,
            categoriaId, imagen, imagenes, activo, destacado,
            esPreventa, fechaLlegada, tiempoProduccion
        } = body

        if (!nombre || !precio) {
            return NextResponse.json({ error: 'Nombre y precio son requeridos' }, { status: 400 })
        }

        if (!categoriaId) {
            return NextResponse.json({ error: 'La categoría es requerida' }, { status: 400 })
        }

        const slug = slugify(nombre) + '-' + Date.now().toString(36)

        const producto = await prisma.producto.create({
            data: {
                nombre,
                slug,
                descripcion: descripcion || '',
                precio: parseFloat(precio || '0'),
                precioOferta: precioOferta ? parseFloat(precioOferta) : null,
                stock: parseInt(stock) || 0,
                categoriaId: categoriaId || null,
                imagen: imagen || null,
                imagenes: Array.isArray(imagenes) ? imagenes : [],
                activo: activo !== false,
                destacado: destacado === true,
                esPreventa: esPreventa === true,
                fechaLlegada: fechaLlegada ? new Date(fechaLlegada) : null,
                tiempoProduccion: tiempoProduccion || null,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ producto }, { status: 201 })
    } catch (error) {
        console.error('Error creating producto:', error)
        return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
    }
}
