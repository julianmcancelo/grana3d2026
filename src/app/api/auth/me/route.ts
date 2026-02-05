import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const token = authHeader.substring(7)
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string }

        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: { id: true, nombre: true, email: true, rol: true }
        })

        if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

        return NextResponse.json({ usuario })
    } catch (error) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }
}
