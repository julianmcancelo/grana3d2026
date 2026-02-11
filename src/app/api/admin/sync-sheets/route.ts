import { NextResponse } from 'next/server'
import { syncAllToSheets } from '@/lib/googleSheets'

export async function POST() {
    try {
        const results = await syncAllToSheets()
        return NextResponse.json({
            exito: true,
            mensaje: 'Sincronización completa exitosa',
            detalles: {
                productos: `${results.productos} productos sincronizados`,
                clientes: `${results.clientes} clientes sincronizados`,
                cotizaciones: `${results.cotizaciones} cotizaciones sincronizadas`,
                estadisticas: results.estadisticas ? 'Actualizadas' : 'Error'
            }
        })
    } catch (error: any) {
        console.error('Error en sync completo:', error)
        return NextResponse.json({ error: error.message || 'Error en sincronización' }, { status: 500 })
    }
}
