import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un producto
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const producto = await prisma.producto.findUnique({
            where: { id },
            include: { categoria: true }
        })

        if (!producto) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
        }

        return NextResponse.json({ producto })
    } catch (error) {
        console.error('Error obteniendo producto:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}

// PUT - Actualizar producto
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        // Solo actualiza los campos que se envían
        const dataToUpdate: any = { updatedAt: new Date() }

        if (body.nombre !== undefined) dataToUpdate.nombre = body.nombre
        if (body.descripcion !== undefined) dataToUpdate.descripcion = body.descripcion
        if (body.precio !== undefined) dataToUpdate.precio = parseFloat(body.precio)
        if (body.precioOferta !== undefined) dataToUpdate.precioOferta = body.precioOferta ? parseFloat(body.precioOferta) : null
        if (body.stock !== undefined) dataToUpdate.stock = parseInt(body.stock)
        if (body.categoriaId !== undefined) dataToUpdate.categoriaId = body.categoriaId || null
        if (body.imagen !== undefined) dataToUpdate.imagen = body.imagen
        if (body.activo !== undefined) dataToUpdate.activo = body.activo
        if (body.destacado !== undefined) dataToUpdate.destacado = body.destacado

        const producto = await prisma.producto.update({
            where: { id },
            data: dataToUpdate
        })

        return NextResponse.json({ producto })
    } catch (error) {
        console.error('Error actualizando producto:', error)
        return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
    }
}

// DELETE - Eliminar producto
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.producto.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error eliminando producto:', error)
        return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
    }
}
