import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function requireAdmin(request: NextRequest) {
    const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) return null
    const payload = await verifyToken(token)
    if (!payload || payload.rol !== 'ADMIN') return null
    return payload
}

// GET - Obtener un producto
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const producto = await prisma.producto.findUnique({
            where: { id: id },
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
        const admin = await requireAdmin(request)
        if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const { id } = await params
        const body = await request.json()

        // Solo actualiza los campos que se envían
        const dataToUpdate: any = { updatedAt: new Date() }

        if (body.nombre !== undefined) dataToUpdate.nombre = body.nombre
        if (body.descripcion !== undefined) dataToUpdate.descripcion = body.descripcion

        // Validate numbers
        if (body.precio !== undefined) {
            const p = parseFloat(body.precio)
            if (!isNaN(p)) dataToUpdate.precio = p
        }
        if (body.precioOferta !== undefined) {
            const po = body.precioOferta ? parseFloat(body.precioOferta) : null
            dataToUpdate.precioOferta = (po !== null && !isNaN(po)) ? po : null
        }
        if (body.stock !== undefined) {
            const s = parseInt(body.stock)
            if (!isNaN(s)) dataToUpdate.stock = s
        }

        if (body.categoriaId !== undefined) {
            if (body.categoriaId) {
                dataToUpdate.categoria = { connect: { id: body.categoriaId } }
            } else {
                dataToUpdate.categoria = { disconnect: true }
            }
        }
        if (body.imagen !== undefined) dataToUpdate.imagen = body.imagen
        if (body.imagenes !== undefined) dataToUpdate.imagenes = body.imagenes // Add support for images array
        if (body.activo !== undefined) dataToUpdate.activo = body.activo
        if (body.destacado !== undefined) dataToUpdate.destacado = body.destacado
        if (body.esPreventa !== undefined) dataToUpdate.esPreventa = body.esPreventa
        // Handle Dates safely
        if (body.fechaLlegada !== undefined) {
            dataToUpdate.fechaLlegada = body.fechaLlegada ? new Date(body.fechaLlegada) : null
        }
        if (body.tiempoProduccion !== undefined) dataToUpdate.tiempoProduccion = body.tiempoProduccion

        const producto = await prisma.producto.update({
            where: { id: id },
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
        const admin = await requireAdmin(request)
        if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
