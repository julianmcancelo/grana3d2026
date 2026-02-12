import { prisma } from '@/lib/prisma'
import TiendaClient from './TiendaClient'

// Disable caching for dynamic content (optional, remove if you want static generation with revalidation)
export const dynamic = 'force-dynamic'

async function getData() {
    const [
        categorias,
        productosDestacados,
        todosProductos,
        configRaw
    ] = await Promise.all([
        prisma.categoria.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
        prisma.producto.findMany({ where: { activo: true, destacado: true }, take: 4, include: { categoria: true } }),
        prisma.producto.findMany({ where: { activo: true }, orderBy: { createdAt: 'desc' }, include: { categoria: true } }),
        prisma.configuracion.findMany()
    ])

    const configMap = configRaw.reduce((acc: any, curr: any) => {
        acc[curr.clave] = curr.valor
        return acc
    }, {})

    // Serialize dates to pass to client component
    const serializeProduct = (p: any) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        categoria: {
            ...p.categoria,
            createdAt: p.categoria.createdAt.toISOString(),
            updatedAt: p.categoria.updatedAt.toISOString()
        }
    })

    return {
        categorias,
        productosDestacados: productosDestacados.map(serializeProduct),
        todosProductos: todosProductos.map(serializeProduct),
        config: {
            modoProximamente: configMap['modoProximamente'] === 'true',
            textoProximamente: configMap['textoProximamente'] || '¡Próximamente!'
        }
    }
}

export default async function TiendaPage() {
    const data = await getData()

    return (
        <TiendaClient
            categorias={data.categorias.map((c: any) => ({
                ...c,
                descripcion: c.descripcion || '',
                imagen: c.imagen || undefined,
                createdAt: c.createdAt.toISOString(),
                updatedAt: c.updatedAt.toISOString()
            }))}
            productosDestacados={data.productosDestacados}
            todosProductos={data.todosProductos}
            config={data.config}
        />
    )
}
