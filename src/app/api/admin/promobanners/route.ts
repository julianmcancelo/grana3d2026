import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar promo banners
export async function GET() {
    try {
        const banners = await prisma.promoBanner.findMany({
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json(banners)
    } catch (error) {
        console.error('Error listando promo banners:', error)
        return NextResponse.json({ error: 'Error al obtener banners' }, { status: 500 })
    }
}

// POST - Crear promo banner
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const maxOrden = await prisma.promoBanner.aggregate({
            _max: { orden: true }
        })

        const banner = await prisma.promoBanner.create({
            data: {
                titulo: body.titulo,
                descripcion: body.descripcion || null,
                etiqueta: body.etiqueta || null,
                link: body.link || null,
                textoBoton: body.textoBoton || null,
                colorFondo: body.colorFondo || 'from-gray-800 to-gray-900',
                orden: (maxOrden._max.orden || 0) + 1,
                activo: body.activo ?? true,
                updatedAt: new Date()
            }
        })

        return NextResponse.json(banner)
    } catch (error) {
        console.error('Error creando promo banner:', error)
        return NextResponse.json({ error: 'Error al crear banner' }, { status: 500 })
    }
}
