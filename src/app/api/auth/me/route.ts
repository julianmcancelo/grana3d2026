import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        // Intentar leer de header o cookie
        const tokenHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
        const tokenCookie = request.cookies.get('token')?.value
        const token = tokenHeader || tokenCookie

        if (!token) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const decoded = await verifyToken(token) as { id: string } | null

        if (!decoded) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                unidadesMesActual: true,
                fechaVencimientoMayorista: true,
                estadoMayorista: true
            }
        })

        if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        return NextResponse.json({ usuario })
    } catch (error) {
        return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
    }
}
