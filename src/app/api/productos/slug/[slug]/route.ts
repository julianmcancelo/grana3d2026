import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params
        const producto = await prisma.producto.findUnique({
            where: { slug },
            include: { categoria: { select: { nombre: true, slug: true } } }
        })
        if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
        return NextResponse.json(producto)
    } catch (error) {
        console.error('Error fetching producto:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
