import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    try {
        const { nombre, email, password } = await request.json()

        const existe = await prisma.usuario.findUnique({ where: { email } })
        if (existe) return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 })

        const hashedPassword = await bcrypt.hash(password, 10)

        const usuario = await prisma.usuario.create({
            data: { nombre, email, password: hashedPassword }
        })

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
        console.error('Registro error:', error)
        return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
    }
}
