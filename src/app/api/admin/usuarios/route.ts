import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar usuarios
export async function GET() {
    try {
        const usuarios = await prisma.usuario.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                estadoMayorista: true,
                unidadesMesActual: true,
                fechaVencimientoMayorista: true,
                createdAt: true,
                _count: {
                    select: { pedidos: true }
                }
            }
        })
        return NextResponse.json({ usuarios })
    } catch (error) {
        console.error('Error listando usuarios:', error)
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
    }
}
