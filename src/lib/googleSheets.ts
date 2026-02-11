import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { prisma } from '@/lib/prisma'

// Configuración de credenciales
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
]

const jwt = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: SCOPES,
})

export const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', jwt)

function checkCredentials() {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        throw new Error('Faltan credenciales de Google Sheets en .env')
    }
}

// ============================
// 1. PRODUCTOS (Enhanced)
// ============================
export async function syncProducts(productos: any[]) {
    checkCredentials()
    await doc.loadInfo()

    let sheet = doc.sheetsByTitle['Productos']
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'Productos' })
    }

    await sheet.clear()

    await sheet.setHeaderRow([
        'ID', 'Nombre', 'Precio', 'Precio Oferta', 'Precio Mayorista',
        'Stock', 'Categoría', 'Slug', 'Activo',
        'Es Preventa', 'Tiempo Producción', 'Suma Cupo Mayorista',
        'Imagen', 'Imagen URL', 'Descripción', 'Última Actualización'
    ])

    const rows = productos.map(p => ({
        ID: p.id,
        Nombre: p.nombre,
        Precio: p.precio,
        'Precio Oferta': p.precioOferta || '-',
        'Precio Mayorista': p.precioMayorista || '-',
        Stock: p.stock,
        Categoría: p.categoria?.nombre || 'Sin Categoría',
        Slug: p.slug,
        Activo: p.activo ? 'SI' : 'NO',
        'Es Preventa': p.esPreventa ? 'SI' : 'NO',
        'Tiempo Producción': p.tiempoProduccion || '-',
        'Suma Cupo Mayorista': p.sumaCupoMayorista ? 'SI' : 'NO',
        Imagen: p.imagen ? `=IMAGE("https://grana3d.com.ar${p.imagen}")` : '',
        'Imagen URL': p.imagen ? `https://grana3d.com.ar${p.imagen}` : '',
        Descripción: p.descripcion || '',
        'Última Actualización': new Date().toLocaleString('es-AR')
    }))

    await sheet.addRows(rows)
    return rows.length
}

// ============================
// 2. VENTAS (Enhanced)
// ============================
export async function syncOrderToSheet(pedido: any, extraData?: { esMayorista?: boolean, unidadesCupo?: number }) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.warn('Google Sheets credentials missing. Skipping sync.')
        return
    }

    try {
        await doc.loadInfo()
        let sheet = doc.sheetsByTitle['Ventas']
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Ventas' })
            await sheet.setHeaderRow([
                'Nro Pedido', 'ID Pedido', 'Fecha', 'Cliente', 'Email',
                'Teléfono', 'DNI', 'Dirección', 'Ciudad', 'Provincia', 'CP',
                'Total', 'Método Pago', 'Método Envío', 'Estado', 'Origen',
                'Items', 'Cupón', 'Es Mayorista', 'Unidades Cupo'
            ])
        }

        const items = Array.isArray(pedido.items) ? pedido.items : []

        const itemsSummary = items.map((i: any) => {
            const variantStr = i.variante ? ` [${i.variante}]` : ''
            const priceStr = i.precioUnitario ? ` $${i.precioUnitario}` : ''
            return `${i.cantidad}x ${i.nombre}${variantStr}${priceStr}`
        }).join(' | ')

        await sheet.addRow({
            'Nro Pedido': pedido.numero || '',
            'ID Pedido': pedido.id,
            'Fecha': new Date().toLocaleString('es-AR'),
            'Cliente': `${pedido.nombreCliente} ${pedido.apellidoCliente || ''}`.trim(),
            'Email': pedido.emailCliente || '',
            'Teléfono': pedido.telefonoCliente || '',
            'DNI': pedido.dniCliente || '',
            'Dirección': pedido.direccionEnvio || '',
            'Ciudad': pedido.ciudadEnvio || '',
            'Provincia': pedido.provinciaEnvio || '',
            'CP': pedido.codigoPostalEnvio || '',
            'Total': pedido.total,
            'Método Pago': pedido.metodoPago,
            'Método Envío': pedido.metodoEnvio || '',
            'Estado': pedido.estado,
            'Origen': pedido.origen || 'WEB',
            'Items': itemsSummary || 'Sin items',
            'Cupón': pedido.cuponId || '-',
            'Es Mayorista': extraData?.esMayorista ? 'SI' : 'NO',
            'Unidades Cupo': extraData?.unidadesCupo || 0
        })
    } catch (e) {
        console.error('Error syncing order to sheet:', e)
    }
}

// ============================
// 3. CLIENTES (New)
// ============================
export async function syncClientes() {
    checkCredentials()
    await doc.loadInfo()

    let sheet = doc.sheetsByTitle['Clientes']
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'Clientes' })
    }

    await sheet.clear()

    await sheet.setHeaderRow([
        'ID', 'Nombre', 'Email', 'Rol', 'Estado Mayorista',
        'Unidades Mes', 'Vencimiento Mayorista',
        'Total Pedidos', 'Monto Total Gastado', 'Fecha Registro'
    ])

    const usuarios: any[] = await prisma.usuario.findMany({
        include: {
            pedidos: {
                select: { total: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    const rows = usuarios.map((u: any) => ({
        ID: u.id,
        Nombre: u.nombre,
        Email: u.email,
        Rol: u.rol,
        'Estado Mayorista': u.estadoMayorista || '-',
        'Unidades Mes': u.unidadesMesActual || 0,
        'Vencimiento Mayorista': u.fechaVencimientoMayorista
            ? new Date(u.fechaVencimientoMayorista).toLocaleDateString('es-AR')
            : '-',
        'Total Pedidos': u.pedidos?.length || 0,
        'Monto Total Gastado': u.pedidos?.reduce((sum: number, p: any) => sum + (p.total || 0), 0) || 0,
        'Fecha Registro': new Date(u.createdAt).toLocaleDateString('es-AR')
    }))

    await sheet.addRows(rows)
    return rows.length
}

// Append single client on registration
export async function appendClienteToSheet(usuario: any) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.warn('Google Sheets credentials missing. Skipping client sync.')
        return
    }

    try {
        await doc.loadInfo()
        let sheet = doc.sheetsByTitle['Clientes']
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Clientes' })
            await sheet.setHeaderRow([
                'ID', 'Nombre', 'Email', 'Rol', 'Estado Mayorista',
                'Unidades Mes', 'Vencimiento Mayorista',
                'Total Pedidos', 'Monto Total Gastado', 'Fecha Registro'
            ])
        }

        await sheet.addRow({
            ID: usuario.id,
            Nombre: usuario.nombre,
            Email: usuario.email,
            Rol: usuario.rol,
            'Estado Mayorista': '-',
            'Unidades Mes': 0,
            'Vencimiento Mayorista': '-',
            'Total Pedidos': 0,
            'Monto Total Gastado': 0,
            'Fecha Registro': new Date().toLocaleDateString('es-AR')
        })
    } catch (e) {
        console.error('Error appending client to sheet:', e)
    }
}

// ============================
// 4. COTIZACIONES (New)
// ============================
export async function syncCotizaciones() {
    checkCredentials()
    await doc.loadInfo()

    let sheet = doc.sheetsByTitle['Cotizaciones']
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'Cotizaciones' })
    }

    await sheet.clear()

    await sheet.setHeaderRow([
        'ID', 'Cliente', 'Email', 'Teléfono', 'CUIT',
        'Items', 'Total', 'Estado', 'Nota', 'Fecha'
    ])

    const presupuestos = await prisma.presupuesto.findMany({
        orderBy: { createdAt: 'desc' }
    })

    const rows = presupuestos.map(p => {
        const items = Array.isArray(p.items) ? p.items : []
        const itemsSummary = items.map((i: any) =>
            `${i.cantidad || 1}x ${i.nombre || i.descripcion || 'Item'}`
        ).join(' | ')

        return {
            ID: p.id,
            Cliente: p.clienteNombre,
            Email: p.clienteEmail || '-',
            Teléfono: p.clienteTelefono || '-',
            CUIT: p.clienteCuit || '-',
            Items: itemsSummary || '-',
            Total: p.total,
            Estado: p.estado,
            Nota: p.nota || '-',
            Fecha: new Date(p.createdAt).toLocaleDateString('es-AR')
        }
    })

    await sheet.addRows(rows)
    return rows.length
}

export async function appendCotizacionToSheet(presupuesto: any) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.warn('Google Sheets credentials missing. Skipping quote sync.')
        return
    }

    try {
        await doc.loadInfo()
        let sheet = doc.sheetsByTitle['Cotizaciones']
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Cotizaciones' })
            await sheet.setHeaderRow([
                'ID', 'Cliente', 'Email', 'Teléfono', 'CUIT',
                'Items', 'Total', 'Estado', 'Nota', 'Fecha'
            ])
        }

        const items = Array.isArray(presupuesto.items) ? presupuesto.items : []
        const itemsSummary = items.map((i: any) =>
            `${i.cantidad || 1}x ${i.nombre || i.descripcion || 'Item'}`
        ).join(' | ')

        await sheet.addRow({
            ID: presupuesto.id,
            Cliente: presupuesto.clienteNombre || '-',
            Email: presupuesto.clienteEmail || '-',
            Teléfono: presupuesto.clienteTelefono || '-',
            CUIT: presupuesto.clienteCuit || '-',
            Items: itemsSummary || '-',
            Total: presupuesto.total || 0,
            Estado: presupuesto.estado || 'BORRADOR',
            Nota: presupuesto.nota || '-',
            Fecha: new Date().toLocaleDateString('es-AR')
        })
    } catch (e) {
        console.error('Error appending quote to sheet:', e)
    }
}

// ============================
// 5. ESTADÍSTICAS (New)
// ============================
export async function syncEstadisticas() {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        console.warn('Google Sheets credentials missing. Skipping stats sync.')
        return
    }

    try {
        await doc.loadInfo()
        let sheet = doc.sheetsByTitle['Estadísticas']
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Estadísticas' })
        }

        await sheet.clear()

        await sheet.setHeaderRow(['Métrica', 'Valor', 'Última Actualización'])

        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        // Queries
        const [
            pedidosTotales,
            pedidosMes,
            totalVentasResult,
            ventasMesResult,
            clientesCount,
            mayoristasCount,
            productosActivos,
            stockTotal,
            topProducto
        ] = await Promise.all([
            prisma.pedido.count(),
            prisma.pedido.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.pedido.aggregate({ _sum: { total: true } }),
            prisma.pedido.aggregate({
                _sum: { total: true },
                where: { createdAt: { gte: startOfMonth } }
            }),
            prisma.usuario.count(),
            prisma.usuario.count({ where: { rol: 'MAYORISTA' as any } }),
            prisma.producto.count({ where: { activo: true } }),
            prisma.producto.aggregate({ _sum: { stock: true } }),
            // Top producto: obtener todos los pedidos y contar items
            prisma.pedido.findMany({ select: { items: true } })
        ])

        const totalVentas = totalVentasResult._sum.total || 0
        const ventasMes = ventasMesResult._sum.total || 0
        const ticketPromedio = pedidosTotales > 0 ? Math.round(totalVentas / pedidosTotales) : 0
        const ticketPromedioMes = pedidosMes > 0 ? Math.round(ventasMes / pedidosMes) : 0

        // Calculate top product
        const productCount: Record<string, { nombre: string, cantidad: number }> = {}
        topProducto.forEach(pedido => {
            const items = Array.isArray(pedido.items) ? pedido.items : []
            items.forEach((item: any) => {
                const key = item.productoId || item.nombre || 'Desconocido'
                if (!productCount[key]) {
                    productCount[key] = { nombre: item.nombre || key, cantidad: 0 }
                }
                productCount[key].cantidad += item.cantidad || 1
            })
        })

        const topProductEntry = Object.values(productCount).sort((a, b) => b.cantidad - a.cantidad)[0]
        const topProductName = topProductEntry ? `${topProductEntry.nombre} (${topProductEntry.cantidad} uds)` : '-'

        // Calculate monthly breakdown
        const monthlyStats: Record<string, { ventas: number, pedidos: number }> = {}
        const allPedidos = await prisma.pedido.findMany({
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 500
        })

        allPedidos.forEach(p => {
            const key = `${p.createdAt.getFullYear()}-${String(p.createdAt.getMonth() + 1).padStart(2, '0')}`
            if (!monthlyStats[key]) monthlyStats[key] = { ventas: 0, pedidos: 0 }
            monthlyStats[key].ventas += p.total
            monthlyStats[key].pedidos += 1
        })

        const timestamp = now.toLocaleString('es-AR')

        const statsRows = [
            { Métrica: '📊 RESUMEN GENERAL', Valor: '═══════════', 'Última Actualización': timestamp },
            { Métrica: 'Total Ventas (Acumulado)', Valor: `$${totalVentas.toLocaleString('es-AR')}`, 'Última Actualización': timestamp },
            { Métrica: 'Total Ventas (Mes Actual)', Valor: `$${ventasMes.toLocaleString('es-AR')}`, 'Última Actualización': timestamp },
            { Métrica: 'Cantidad Pedidos (Total)', Valor: pedidosTotales.toString(), 'Última Actualización': timestamp },
            { Métrica: 'Cantidad Pedidos (Mes Actual)', Valor: pedidosMes.toString(), 'Última Actualización': timestamp },
            { Métrica: 'Ticket Promedio (General)', Valor: `$${ticketPromedio.toLocaleString('es-AR')}`, 'Última Actualización': timestamp },
            { Métrica: 'Ticket Promedio (Mes Actual)', Valor: `$${ticketPromedioMes.toLocaleString('es-AR')}`, 'Última Actualización': timestamp },
            { Métrica: 'Producto Más Vendido', Valor: topProductName, 'Última Actualización': timestamp },
            { Métrica: '', Valor: '', 'Última Actualización': '' },
            { Métrica: '👥 CLIENTES', Valor: '═══════════', 'Última Actualización': timestamp },
            { Métrica: 'Clientes Totales', Valor: clientesCount.toString(), 'Última Actualización': timestamp },
            { Métrica: 'Clientes Mayoristas', Valor: mayoristasCount.toString(), 'Última Actualización': timestamp },
            { Métrica: '', Valor: '', 'Última Actualización': '' },
            { Métrica: '📦 INVENTARIO', Valor: '═══════════', 'Última Actualización': timestamp },
            { Métrica: 'Productos Activos', Valor: productosActivos.toString(), 'Última Actualización': timestamp },
            { Métrica: 'Stock Total', Valor: (stockTotal._sum.stock || 0).toString(), 'Última Actualización': timestamp },
            { Métrica: '', Valor: '', 'Última Actualización': '' },
            { Métrica: '📅 VENTAS POR MES', Valor: '═══════════', 'Última Actualización': timestamp },
        ]

        // Add monthly rows
        Object.entries(monthlyStats)
            .sort(([a], [b]) => b.localeCompare(a))
            .slice(0, 12) // Last 12 months
            .forEach(([month, data]) => {
                statsRows.push({
                    Métrica: month,
                    Valor: `$${data.ventas.toLocaleString('es-AR')} (${data.pedidos} pedidos)`,
                    'Última Actualización': timestamp
                })
            })

        await sheet.addRows(statsRows)
    } catch (e) {
        console.error('Error syncing stats to sheet:', e)
    }
}

// ============================
// 6. MASTER SYNC (All at once)
// ============================
export async function syncAllToSheets() {
    checkCredentials()

    // Fetch products for syncProducts
    const productos = await prisma.producto.findMany({
        include: { categoria: true },
        orderBy: { orden: 'asc' }
    })

    const results = {
        productos: 0,
        clientes: 0,
        cotizaciones: 0,
        estadisticas: false
    }

    try { results.productos = await syncProducts(productos) } catch (e) { console.error('Sync productos error:', e) }
    try { results.clientes = await syncClientes() } catch (e) { console.error('Sync clientes error:', e) }
    try { results.cotizaciones = await syncCotizaciones() } catch (e) { console.error('Sync cotizaciones error:', e) }
    try { await syncEstadisticas(); results.estadisticas = true } catch (e) { console.error('Sync stats error:', e) }

    return results
}

// ============================
// LEGACY: Read Product Updates
// ============================
export async function readProductUpdates() {
    checkCredentials()

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle['Productos']
    if (!sheet) throw new Error('No se encontró la hoja "Productos"')

    const rows = await sheet.getRows()
    const updates = []

    for (const row of rows) {
        const id = row.get('ID')
        const precioStr = row.get('Precio')
        const stockStr = row.get('Stock')
        const activoStr = row.get('Activo')

        if (id) {
            updates.push({
                id,
                precio: parseFloat(precioStr?.replace(/[^0-9.-]+/g, "")) || 0,
                stock: parseInt(stockStr) || 0,
                activo: activoStr === 'SI'
            })
        }
    }
    return updates
}
