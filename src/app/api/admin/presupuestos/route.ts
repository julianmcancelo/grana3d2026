
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar presupuestos
export async function GET() {
    try {
        const presupuestos = await prisma.presupuesto.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        })
        return NextResponse.json({ presupuestos })
    } catch (error) {
        console.error('Error obteniendo presupuestos:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// POST - Guardar nuevo presupuesto
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { cliente, items, total, nota } = body

        // Generar items con totales si no vienen, asegurando estructura
        const itemsProcesados = items.map((i: any) => ({
            ...i,
            total: i.total || (i.cantidad * i.precioUnitario)
        }))

        const presupuesto = await prisma.presupuesto.create({
            data: {
                clienteNombre: cliente.nombre || 'Consumidor Final',
                clienteEmail: cliente.email || '',
                clienteTelefono: cliente.telefono || '',
                clienteCuit: cliente.cuit || '',
                items: itemsProcesados,
                total: total || 0,
                nota: nota || '',
                estado: 'BORRADOR'
            }
        })

        return NextResponse.json({ presupuesto })
    } catch (error: any) {
        console.error('Error guardando presupuesto:', error)
        return NextResponse.json({ error: 'Error interno al guardar', details: error.message }, { status: 500 })
    }
}
