import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Obtener cupón
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const cupon = await prisma.cupon.findUnique({
            where: { id },
            include: {
                UsoCupon: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                }
            }
        })
        if (!cupon) {
            return NextResponse.json({ error: 'Cupón no encontrado' }, { status: 404 })
        }
        return NextResponse.json(cupon)
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 })
    }
}

// PUT - Actualizar cupón
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const data = await request.json()

        // Si cambia el código, verificar que no exista
        if (data.codigo) {
            const existente = await prisma.cupon.findFirst({
                where: { codigo: data.codigo.toUpperCase(), NOT: { id } }
            })
            if (existente) {
                return NextResponse.json({ error: 'El código ya está en uso' }, { status: 400 })
            }
        }

        const cupon = await prisma.cupon.update({
            where: { id },
            data: {
                ...(data.codigo && { codigo: data.codigo.toUpperCase() }),
                ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
                ...(data.tipo && { tipo: data.tipo }),
                ...(data.valor !== undefined && { valor: parseFloat(data.valor) }),
                ...(data.minimoCompra !== undefined && { minimoCompra: data.minimoCompra ? parseFloat(data.minimoCompra) : null }),
                ...(data.maximoDescuento !== undefined && { maximoDescuento: data.maximoDescuento ? parseFloat(data.maximoDescuento) : null }),
                ...(data.usosMaximos !== undefined && { usosMaximos: data.usosMaximos ? parseInt(data.usosMaximos) : null }),
                ...(data.usosPorUsuario !== undefined && { usosPorUsuario: parseInt(data.usosPorUsuario) }),
                ...(data.fechaInicio && { fechaInicio: new Date(data.fechaInicio) }),
                ...(data.fechaFin !== undefined && { fechaFin: data.fechaFin ? new Date(data.fechaFin) : null }),
                ...(data.activo !== undefined && { activo: data.activo }),
                ...(data.aplicaA && { aplicaA: data.aplicaA }),
                ...(data.categoriaIds && { categoriaIds: data.categoriaIds }),
                ...(data.productoIds && { productoIds: data.productoIds }),
                updatedAt: new Date()
            }
        })

        return NextResponse.json(cupon)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 })
    }
}

// DELETE - Eliminar cupón
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Eliminar usos primero
        await prisma.usoCupon.deleteMany({ where: { cuponId: id } })
        await prisma.cupon.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 })
    }
}
