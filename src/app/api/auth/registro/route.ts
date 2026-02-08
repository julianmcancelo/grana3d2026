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

        // Generar cupón de bienvenida (15% OFF)
        const couponCode = `HOLA-${usuario.nombre.toUpperCase().replace(/\s+/g, '').substring(0, 4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        try {
            await prisma.cupon.create({
                data: {
                    id: `cupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    codigo: couponCode,
                    descripcion: 'Regalo de Bienvenida',
                    tipo: 'PORCENTAJE',
                    valor: 15,
                    usosMaximos: 1,
                    usosPorUsuario: 1,
                    // Valido por 30 dias
                    fechaFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date()
                }
            });
        } catch (couponError) {
            console.error('Error generando cupón de bienvenida:', couponError);
            // No fallamos el registro, solo logueamos
        }

        // Enviar correo de bienvenida
        try {
            const { sendEmail } = await import('@/lib/email')
            const { getWelcomeEmailTemplate } = await import('@/lib/email-templates')
            const { getEmailConfig } = await import('@/lib/config')

            const emailConfig = await getEmailConfig()

            await sendEmail({
                to: usuario.email,
                subject: `¡Bienvenido a ${emailConfig.nombreTienda}!`,
                html: getWelcomeEmailTemplate(usuario.nombre, emailConfig, couponCode)
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
