22222222222import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const now = new Date()
        const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1)
        const inicioSemana = new Date(now)
        inicioSemana.setDate(now.getDate() - now.getDay())
        inicioSemana.setHours(0, 0, 0, 0)
        const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        // ─── All pedidos ───
        const pedidos = await (prisma.pedido as any).findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                numero: true,
                nombreCliente: true,
                total: true,
                estado: true,
                metodoPago: true,
                metodoEnvio: true,
                origen: true,
                items: true,
                createdAt: true,
            }
        })

        const pedidosActivos = pedidos.filter((p: any) => p.estado !== 'CANCELADO')

        // ─── Stats generales ───
        const ventasTotales = pedidosActivos.reduce((acc: number, p: any) => acc + (p.total || 0), 0)
        const pedidosMes = pedidosActivos.filter((p: any) => new Date(p.createdAt) >= inicioMes)
        const ventasMes = pedidosMes.reduce((acc: number, p: any) => acc + (p.total || 0), 0)
        const pedidosSemana = pedidosActivos.filter((p: any) => new Date(p.createdAt) >= inicioSemana)
        const ventasSemana = pedidosSemana.reduce((acc: number, p: any) => acc + (p.total || 0), 0)
        const pedidosHoy = pedidosActivos.filter((p: any) => new Date(p.createdAt) >= hoy)
        const ventasHoy = pedidosHoy.reduce((acc: number, p: any) => acc + (p.total || 0), 0)

        const ticketPromedio = pedidosActivos.length > 0
            ? Math.round(ventasTotales / pedidosActivos.length)
            : 0

        // ─── Conteos ───
        const totalProductos = await prisma.producto.count()
        const productosActivos = await prisma.producto.count({ where: { activo: true } })
        const productosBajoStock = await prisma.producto.count({ where: { stock: { lte: 5 }, activo: true } })
        const totalUsuarios = await prisma.usuario.count()
        const mayoristas = await (prisma.usuario as any).count({ where: { rol: 'MAYORISTA' as any } })
        const pendientes = pedidos.filter((p: any) => p.estado === 'PENDIENTE').length
        const enviados = pedidos.filter((p: any) => p.estado === 'ENVIADO').length

        // ─── Ventas por mes (últimos 12 meses) ───
        const ventasPorMes: { mes: string; ventas: number; pedidos: number }[] = []
        for (let i = 11; i >= 0; i--) {
            const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59)
            const pedidosMesI = pedidosActivos.filter((p: any) => {
                const d = new Date(p.createdAt)
                return d >= fecha && d <= finMes
            })
            ventasPorMes.push({
                mes: fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }),
                ventas: pedidosMesI.reduce((acc: number, p: any) => acc + (p.total || 0), 0),
                pedidos: pedidosMesI.length
            })
        }

        // ─── Top productos vendidos ───
        const productoCount: Record<string, { nombre: string; cantidad: number; ventas: number }> = {}
        for (const p of pedidosActivos) {
            const items = Array.isArray(p.items) ? p.items : []
            for (const item of items as any[]) {
                const key = item.nombre || 'Desconocido'
                if (!productoCount[key]) {
                    productoCount[key] = { nombre: key, cantidad: 0, ventas: 0 }
                }
                productoCount[key].cantidad += item.cantidad || 1
                productoCount[key].ventas += (item.precioUnitario || 0) * (item.cantidad || 1)
            }
        }
        const topProductos = Object.values(productoCount)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 8)

        // ─── Ventas por metodo de pago ───
        const metodosPago: Record<string, { count: number; total: number }> = {}
        for (const p of pedidosActivos) {
            const metodo = p.metodoPago || 'Otro'
            if (!metodosPago[metodo]) metodosPago[metodo] = { count: 0, total: 0 }
            metodosPago[metodo].count++
            metodosPago[metodo].total += p.total || 0
        }

        // ─── Ventas por origen ───
        const origenes: Record<string, { count: number; total: number }> = {}
        for (const p of pedidosActivos) {
            const origen = p.origen || 'WEB'
            if (!origenes[origen]) origenes[origen] = { count: 0, total: 0 }
            origenes[origen].count++
            origenes[origen].total += p.total || 0
        }

        // ─── Ventas por metodo de envio ───
        const metodosEnvio: Record<string, number> = {}
        for (const p of pedidosActivos) {
            const metodo = p.metodoEnvio || 'No especificado'
            if (!metodosEnvio[metodo]) metodosEnvio[metodo] = 0
            metodosEnvio[metodo]++
        }

        // ─── Últimos 8 pedidos ───
        const ultimosPedidos = pedidos.slice(0, 8).map((p: any) => ({
            id: p.id,
            numero: p.numero,
            nombreCliente: p.nombreCliente,
            total: p.total,
            estado: p.estado,
            metodoPago: p.metodoPago,
            origen: p.origen,
            fecha: p.createdAt,
        }))

        // ─── Productos bajo stock ───
        const productosBajoStockLista = await prisma.producto.findMany({
            where: { stock: { lte: 5 }, activo: true },
            select: { id: true, nombre: true, stock: true, imagen: true, categoria: { select: { nombre: true } } },
            orderBy: { stock: 'asc' },
            take: 8
        })

        return NextResponse.json({
            stats: {
                ventasTotales,
                ventasMes,
                ventasSemana,
                ventasHoy,
                ticketPromedio,
                totalPedidos: pedidosActivos.length,
                pedidosMes: pedidosMes.length,
                pedidosHoy: pedidosHoy.length,
                pendientes,
                enviados,
                totalProductos,
                productosActivos,
                productosBajoStock,
                totalUsuarios,
                mayoristas,
            },
            ventasPorMes,
            topProductos,
            metodosPago,
            origenes,
            metodosEnvio,
            ultimosPedidos,
            productosBajoStockLista
        })
    } catch (error) {
        console.error('Error en estadísticas:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
