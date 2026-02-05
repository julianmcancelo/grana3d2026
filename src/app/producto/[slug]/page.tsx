import { prisma } from '@/lib/prisma'
import ProductoClient from './ProductoClient'
import { Metadata } from 'next'
import { getGlobalConfig } from '@/lib/config'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'

// Disable caching for dynamic content
export const dynamic = 'force-dynamic'

interface Props {
    params: { slug: string }
}

async function getProducto(slug: string) {
    const producto = await prisma.producto.findUnique({
        where: { slug },
        include: {
            categoria: true
        }
    })
    return producto
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const producto = await getProducto(params.slug)
    if (!producto) return { title: 'Producto no encontrado' }

    return {
        title: `${producto.nombre} | Grana3D`,
        description: producto.descripcion?.substring(0, 160),
        openGraph: {
            images: producto.imagenes[0] ? [producto.imagenes[0]] : []
        }
    }
}

export default async function ProductoPage({ params }: Props) {
    const config = await getGlobalConfig()

    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    const producto = await getProducto(params.slug)

    if (!producto) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Producto no encontrado</h1>
                    <p className="text-gray-500">El producto que buscas no existe o fue eliminado.</p>
                </div>
            </div>
        )
    }

    // Adaptar tipos de Prisma a los del cliente si es necesario
    const productoCliente = {
        ...producto,
        precioOferta: producto.precioOferta ?? null,
        variantes: producto.variantes as any, // Si variantes es JSON
        colores: (producto.variantes as any)?.colores || [],
        tamanos: (producto.variantes as any)?.tamanos || [],
        descripcionCorta: (producto.variantes as any)?.descripcionCorta || '',
    }

    return <ProductoClient producto={productoCliente} />
}
