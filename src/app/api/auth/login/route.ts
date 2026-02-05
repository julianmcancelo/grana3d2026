import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        const usuario = await prisma.usuario.findUnique({ where: { email } })
        if (!usuario) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

        const validPassword = await bcrypt.compare(password, usuario.password)
        if (!validPassword) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        )

        return NextResponse.json({
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
    }
}
