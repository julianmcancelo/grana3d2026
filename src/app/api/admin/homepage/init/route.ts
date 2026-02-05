import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Inicializar secciones por defecto
export async function POST() {
    try {
        // Verificar si ya existen secciones
        const seccionesCount = await prisma.seccionHomepage.count()
        const promoBannersCount = await prisma.promoBanner.count()
        let message = ''

        // Crear secciones por defecto si no existen
        if (seccionesCount === 0) {
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
            message += 'Secciones y reseñas inicializadas. '
        } else {
            message += 'Secciones ya existían. '
        }

        // Crear Promo Banners por defecto si no existen
        if (promoBannersCount === 0) {
            const promoBannersDefault = [
                {
                    titulo: 'Kit Gamer Pro',
                    descripcion: 'Soportes de auriculares, gestión de cables y accesorios RGB.',
                    etiqueta: 'OFERTA LIMITADA',
                    link: '/tienda?categoria=gamer',
                    textoBoton: 'Ver Colección',
                    colorFondo: 'from-indigo-900 to-purple-900',
                    orden: 1,
                    activo: true
                },
                {
                    titulo: 'Impresión a Demanda',
                    descripcion: '¿Tenés un archivo STL? Nosotros lo hacemos realidad con calidad industrial.',
                    etiqueta: 'SERVICIO',
                    link: 'https://wa.me/5491112345678?text=Hola!%20Quiero%20cotizar%20una%20impresión%203D%20a%20demanda',
                    textoBoton: 'Cotizar Ahora',
                    colorFondo: 'from-gray-800 to-gray-900',
                    orden: 2,
                    activo: true
                }
            ]

            await prisma.promoBanner.createMany({
                data: promoBannersDefault
            })
            message += 'Promo Banners inicializados. '
        } else {
            message += 'Promo Banners ya existían. '
        }

        // Crear Hero Banners (Banner) por defecto si no existen
        try {
            const bannersCount = await prisma.banner.count()
            if (bannersCount === 0) {
                const heroBannersDefault = [
                    {
                        titulo: 'Tienda Oficial',
                        subtitulo: 'NUEVA COLECCIÓN 2026',
                        descripcion: 'Explorá nuestra selección de productos impresos en 3D con materiales de ingeniería y acabados profesionales.',
                        imagen: 'https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=2074&auto=format&fit=crop', // Stock 3D printing photo
                        textoBoton: 'Ver Catálogo',
                        linkBoton: '/tienda',
                        colorFondo: '#000000',
                        colorTexto: '#ffffff',
                        overlay: true,
                        orden: 1,
                        activo: true,
                        updatedAt: new Date()
                    },
                    {
                        titulo: 'Impresión a Demanda',
                        subtitulo: 'SERVICIOS PERSONALIZADOS',
                        descripcion: 'Traé tu idea o archivo STL y lo imprimimos con la mejor calidad del mercado.',
                        imagen: 'https://images.unsplash.com/photo-1581092921461-eab62e97a786?q=80&w=2070&auto=format&fit=crop',
                        textoBoton: 'Cotizar',
                        linkBoton: '/contacto',
                        textoBoton2: 'Cómo Funciona',
                        linkBoton2: '/faq',
                        colorFondo: '#111827',
                        colorTexto: '#ffffff',
                        overlay: true,
                        orden: 2,
                        activo: true,
                        updatedAt: new Date()
                    }
                ]

                await prisma.banner.createMany({
                    data: heroBannersDefault
                })
                message += 'Hero Banners inicializados. '
            } else {
                message += 'Hero Banners ya existían. '
            }
        } catch (e) {
            console.error('Error with banners:', e)
        }

        return NextResponse.json({
            success: true,
            message: message,
            secciones: seccionesCount === 0 ? 7 : seccionesCount,
            promoBanners: promoBannersCount === 0 ? 2 : promoBannersCount
        })
    } catch (error) {
        console.error('Error initializing:', error)
        return NextResponse.json({ error: 'Error al inicializar' }, { status: 500 })
    }
}
