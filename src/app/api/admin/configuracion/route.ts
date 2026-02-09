import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const dynamic = 'force-dynamic'

// GET - Obtener configuración
export async function GET() {
    try {
        const configuraciones = await prisma.configuracion.findMany()

        // Convertir a objeto
        const config: Record<string, any> = {}
        for (const item of configuraciones) {
            try {
                config[item.clave] = JSON.parse(item.valor)
            } catch {
                config[item.clave] = item.valor
            }
        }

        return NextResponse.json({ config })
    } catch (error) {
        console.error('Error obteniendo configuración:', error)
        return NextResponse.json({ config: {} }, { status: 500 })
    }
}

// POST - Guardar configuración
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Guardar cada clave-valor
        for (const [clave, valor] of Object.entries(body)) {
            const valorStr = typeof valor === 'string' ? valor : JSON.stringify(valor)

            await prisma.configuracion.upsert({
                where: { clave },
                update: { valor: valorStr },
                create: { clave, valor: valorStr }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error guardando configuración:', error)
        return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }
}
