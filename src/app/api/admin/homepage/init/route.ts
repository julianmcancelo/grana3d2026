import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Inicializar secciones por defecto
export async function POST() {
    try {
        // Verificar si ya existen secciones
        const existentes = await prisma.seccionHomepage.count()

        if (existentes > 0) {
            return NextResponse.json({
                message: 'Ya existen secciones configuradas',
                count: existentes
            })
        }

        // Crear secciones por defecto
        const seccionesPorDefecto = [
            { tipo: 'HERO_CAROUSEL', titulo: null, subtitulo: null, orden: 0, activa: true },
            { tipo: 'CATEGORIAS_RAPIDAS', titulo: 'Categorías', subtitulo: null, orden: 1, activa: true },
            { tipo: 'PRODUCTOS_DESTACADOS', titulo: 'Productos Destacados', subtitulo: 'Lo mejor de nuestra tienda', orden: 2, activa: true },
            { tipo: 'BANNER_PROMO', titulo: '¡Ofertas Especiales!', subtitulo: 'Por tiempo limitado', orden: 3, activa: true },
            { tipo: 'PRODUCTOS_OFERTA', titulo: 'Ofertas Imperdibles', subtitulo: 'Aprovechá los descuentos', orden: 4, activa: true },
            { tipo: 'RESENAS', titulo: 'Lo que dicen nuestros clientes', subtitulo: 'Opiniones reales', orden: 5, activa: true },
            { tipo: 'NEWSLETTER', titulo: '¡No te pierdas nada!', subtitulo: 'Suscribite para recibir ofertas exclusivas', orden: 6, activa: true },
        ]

        await prisma.seccionHomepage.createMany({
            data: seccionesPorDefecto as any
        })

        // Crear algunas reseñas de ejemplo
        const resenasEjemplo = [
            { nombre: 'Juan García', texto: 'Excelente calidad de impresión. Las piezas llegaron perfectas y el tiempo de entrega fue muy rápido.', rating: 5 },
            { nombre: 'María López', texto: 'Muy buen servicio al cliente. Me ayudaron con el diseño de mi pieza personalizada.', rating: 5 },
            { nombre: 'Carlos Rodríguez', texto: 'Los materiales son de primera calidad. Mis prototipos quedaron increíbles.', rating: 4 },
        ]

        await prisma.resena.createMany({
            data: resenasEjemplo.map((r, i) => ({ ...r, orden: i, activa: true }))
        })

        return NextResponse.json({
            success: true,
            message: 'Secciones y reseñas inicializadas',
            secciones: seccionesPorDefecto.length,
            resenas: resenasEjemplo.length
        })
    } catch (error) {
        console.error('Error initializing:', error)
        return NextResponse.json({ error: 'Error al inicializar' }, { status: 500 })
    }
}
