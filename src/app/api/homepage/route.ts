import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener secciones activas ordenadas para el homepage
export async function GET() {
    try {
        const secciones = await prisma.seccionHomepage.findMany({
            where: { activa: true },
            orderBy: { orden: 'asc' }
        })

        // Para cada sección, obtener datos adicionales según su tipo
        const seccionesConDatos = await Promise.all(secciones.map(async (seccion) => {
            let datos = null

            switch (seccion.tipo) {
                case 'HERO_CAROUSEL':
                    datos = await prisma.banner.findMany({
                        where: { activo: true },
                        orderBy: { orden: 'asc' }
                    })
                    break

                case 'PRODUCTOS_DESTACADOS':
                    datos = await prisma.producto.findMany({
                        where: { activo: true, destacado: true },
                        include: { categoria: { select: { nombre: true, slug: true } } },
                        orderBy: { orden: 'asc' },
                        take: 12
                    })
                    break

                case 'PRODUCTOS_OFERTA':
                    datos = await prisma.producto.findMany({
                        where: { activo: true, precioOferta: { not: null } },
                        include: { categoria: { select: { nombre: true, slug: true } } },
                        orderBy: { orden: 'asc' },
                        take: 12
                    })
                    break

                case 'CATEGORIAS_RAPIDAS':
                    datos = await prisma.categoria.findMany({
                        where: { activo: true },
                        orderBy: { orden: 'asc' }
                    })
                    break

                case 'RESENAS':
                    datos = await prisma.resena.findMany({
                        where: { activa: true },
                        orderBy: { orden: 'asc' }
                    })
                    break

                default:
                    break
            }

            return { ...seccion, datos }
        }))

        return NextResponse.json(seccionesConDatos)
    } catch (error) {
        console.error('Error fetching homepage:', error)
        return NextResponse.json({ error: 'Error al obtener homepage' }, { status: 500 })
    }
}
