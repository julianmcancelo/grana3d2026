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
        prisma.producto.findMany({ where: { activo: true }, take: 8, include: { categoria: true } }),
        prisma.configuracion.findMany()
    ])

    const configMap = configRaw.reduce((acc: any, curr) => {
        acc[curr.clave] = curr.valor
        return acc
    }, {})

    return {
        categorias,
        productosDestacados,
        todosProductos,
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
            categorias={data.categorias.map(c => ({ ...c, descripcion: c.descripcion || '', imagen: c.imagen || undefined }))}
            productosDestacados={data.productosDestacados}
            todosProductos={data.todosProductos}
            config={data.config}
        />
    )
}
