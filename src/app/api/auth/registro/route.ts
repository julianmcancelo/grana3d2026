import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { nombre, email, password } = await request.json()

        const existe = await prisma.usuario.findUnique({ where: { email } })
        if (existe) return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })

        // Check if it's the first user
        const userCount = await prisma.usuario.count()
        const rol = userCount === 0 ? 'ADMIN' : 'CLIENTE'

        const hashedPassword = await bcrypt.hash(password, 10)

        const usuario = await prisma.usuario.create({
            data: { nombre, email, password: hashedPassword, rol }
        })

        // Generar token consistente con el login
        const token = await signToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        })

        // Enviar correo de bienvenida
        try {
            const { sendEmail } = await import('@/lib/email')
            const { getWelcomeEmailTemplate } = await import('@/lib/email-templates')

            await sendEmail({
                to: usuario.email,
                subject: '¡Bienvenido a Grana 3D!',
                html: getWelcomeEmailTemplate(usuario.nombre)
            })
        } catch (emailError) {
            console.error('Error enviando correo de bienvenida:', emailError)
            // No fallamos el registro si falla el correo, solo lo logueamos
        }

        const response = NextResponse.json({
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
        })

        // Setear Cookie HttpOnly para seguridad automática
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 7 días
            path: '/',
        })

        return response

    } catch (error) {
        console.error('Registro error:', error)
        return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
    }
}
