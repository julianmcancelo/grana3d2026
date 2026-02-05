import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener usuario
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                createdAt: true,
                pedidos: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!usuario) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ usuario })
    } catch (error) {
        console.error('Error obteniendo usuario:', error)
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

// PUT - Actualizar usuario (cambiar rol)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Solo permitir cambiar el rol
        const usuario = await prisma.usuario.update({
            where: { id },
            data: { rol: body.rol }
        })

        return NextResponse.json({ usuario })
    } catch (error) {
        console.error('Error actualizando usuario:', error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

// DELETE - Eliminar usuario
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Verificar que no sea el único admin
        const admins = await prisma.usuario.count({
            where: { rol: 'ADMIN' }
        })

        const usuario = await prisma.usuario.findUnique({
            where: { id }
        })

        if (usuario?.rol === 'ADMIN' && admins <= 1) {
            return NextResponse.json({
                error: 'No se puede eliminar el único administrador'
            }, { status: 400 })
        }

        await prisma.usuario.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminando usuario:', error)
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
