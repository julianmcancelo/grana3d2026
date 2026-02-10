import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        const usuario = await prisma.usuario.findUnique({ where: { email } })
        if (!usuario) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

        const validPassword = await bcrypt.compare(password, usuario.password)
        if (!validPassword) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })

        // Generar token con Jose
        const token = await signToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        })

        // Crear respuesta
        const response = NextResponse.json({
            token, // Lo mantenemos por si el front lo usa en headers
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        })

        // Setear Cookie HttpOnly
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_API_URL?.startsWith('https'),
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Error al iniciar sesión' }, { status: 500 })
    }
}
