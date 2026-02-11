import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

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

export async function syncProducts(productos: any[]) {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        throw new Error('Faltan credenciales de Google Sheets en .env')
    }

    await doc.loadInfo()

    let sheet = doc.sheetsByTitle['Productos']
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'Productos' })
    }

    await sheet.clear()

    // Encabezados
    await sheet.setHeaderRow([
        'ID', 'Nombre', 'Precio', 'Stock', 'Categoría', 'Slug', 'Activo', 'Imagen', 'Imagen URL', 'Descripción', 'Última Actualización'
    ])

    // Filas
    const rows = productos.map(p => ({
        ID: p.id,
        Nombre: p.nombre,
        Precio: p.precio,
        Stock: p.stock,
        Categoría: p.categoria?.nombre || 'Sin Categoría',
        Slug: p.slug,
        Activo: p.activo ? 'SI' : 'NO',
        Imagen: p.imagen ? `=IMAGE("https://grana3d.com.ar${p.imagen}")` : '',
        'Imagen URL': p.imagen ? `https://grana3d.com.ar${p.imagen}` : '',
        Descripción: p.descripcion || '',
        'Última Actualización': new Date().toLocaleString()
    }))

    await sheet.addRows(rows)
    return rows.length
}

export async function syncOrderToSheet(pedido: any) {
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
                'ID Pedido', 'Fecha', 'Cliente', 'Email', 'Total', 'Método Pago', 'Estado', 'Items', 'Cupón', 'Envío'
            ])
        }

        // Ensure items is an array
        const items = Array.isArray(pedido.items) ? pedido.items : []

        const itemsSummary = items.map((i: any) => {
            const variantStr = i.variante ? ` [${i.variante}]` : ''
            return `${i.cantidad}x ${i.nombre}${variantStr}`
        }).join(', ')

        console.log(`Syncing Order #${pedido.id} to Sheets. Items: ${itemsSummary}`)

        await sheet.addRow({
            'ID Pedido': pedido.id,
            'Fecha': new Date().toLocaleString('es-AR'),
            'Cliente': `${pedido.nombreCliente} ${pedido.apellidoCliente || ''}`.trim(),
            'Email': pedido.emailCliente,
            'Total': pedido.total,
            'Método Pago': pedido.metodoPago,
            'Estado': pedido.estado,
            'Items': itemsSummary || 'Sin items',
            'Cupón': pedido.cuponId || '-',
            'Envío': pedido.metodoEnvio
        })
    } catch (e) {
        console.error('Error syncing order to sheet:', e)
    }
}

export async function readProductUpdates() {
    if (!process.env.GOOGLE_SHEET_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
        throw new Error('Faltan credenciales')
    }

    await doc.loadInfo()
    const sheet = doc.sheetsByTitle['Productos']
    if (!sheet) throw new Error('No se encontró la hoja "Productos"')

    const rows = await sheet.getRows()
    const updates = []

    for (const row of rows) {
        // Asumimos que ID está en la columna "ID"
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
