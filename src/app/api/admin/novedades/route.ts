import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar novedades
export async function GET() {
    try {
        const novedades = await prisma.novedad.findMany({
            orderBy: { fechaPublicacion: 'desc' }
        })
        return NextResponse.json({ novedades })
    } catch (error) {
        console.error('Error listando novedades:', error)
        return NextResponse.json({ error: 'Error al obtener novedades' }, { status: 500 })
    }
}

// POST - Crear novedad
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const novedad = await prisma.novedad.create({
            data: {
                titulo: body.titulo,
                contenido: body.contenido,
                imagen: body.imagen || null,
                activa: body.activa ?? true,
                fechaPublicacion: new Date()
            }
        })

        return NextResponse.json({ novedad })
    } catch (error) {
        console.error('Error creando novedad:', error)
        return NextResponse.json({ error: 'Error al crear novedad' }, { status: 500 })
    }
}
