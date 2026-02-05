import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar todas las secciones (para admin)
export async function GET() {
    try {
        const secciones = await prisma.seccionHomepage.findMany({
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json(secciones)
    } catch (error) {
        return NextResponse.json({ error: 'Error al obtener secciones' }, { status: 500 })
    }
}

// POST - Crear nueva sección
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Obtener el orden máximo actual
        const maxOrden = await prisma.seccionHomepage.aggregate({
            _max: { orden: true }
        })

        const seccion = await prisma.seccionHomepage.create({
            data: {
                tipo: data.tipo,
                titulo: data.titulo || null,
                subtitulo: data.subtitulo || null,
                orden: (maxOrden._max.orden || 0) + 1,
                activa: data.activa ?? true,
                config: data.config || null
            }
        })

        return NextResponse.json(seccion)
    } catch (error) {
        console.error('Error creating section:', error)
        return NextResponse.json({ error: 'Error al crear sección' }, { status: 500 })
    }
}

// PUT - Actualizar orden de todas las secciones (bulk update)
export async function PUT(request: NextRequest) {
    try {
        const { secciones } = await request.json()

        // Actualizar orden de cada sección
        await Promise.all(secciones.map((s: { id: string, orden: number }) =>
            prisma.seccionHomepage.update({
                where: { id: s.id },
                data: { orden: s.orden }
            })
        ))

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al reordenar secciones' }, { status: 500 })
    }
}
