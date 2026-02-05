import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar banners
export async function GET() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json({ banners })
    } catch (error) {
        console.error('Error listando banners:', error)
        return NextResponse.json({ error: 'Error al obtener banners' }, { status: 500 })
    }
}

// POST - Crear banner
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Obtener el orden máximo actual
        const maxOrden = await prisma.banner.aggregate({
            _max: { orden: true }
        })

        const banner = await prisma.banner.create({
            data: {
                titulo: body.titulo,
                subtitulo: body.subtitulo || null,
                descripcion: body.descripcion || null,
                imagen: body.imagen,
                textoBoton: body.textoBoton || null,
                linkBoton: body.linkBoton || null,
                orden: (maxOrden._max.orden || 0) + 1,
                activo: body.activo ?? true,
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ banner })
    } catch (error) {
        console.error('Error creando banner:', error)
        return NextResponse.json({ error: 'Error al crear banner' }, { status: 500 })
    }
}
