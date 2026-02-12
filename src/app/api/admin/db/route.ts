import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Map of available models
const modelMap: Record<string, any> = {
    usuario: prisma.usuario,
    producto: prisma.producto,
    categoria: prisma.categoria,
    pedido: prisma.pedido,
    cupon: prisma.cupon,
    resena: (prisma as any).resena,
    novedad: (prisma as any).novedad,
    banner: (prisma as any).banner,
    configuracion: prisma.configuracion,
    direccion: (prisma as any).direccion,
}

// GET - List models or fetch data from a model
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const model = searchParams.get('model')
        const id = searchParams.get('id')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const search = searchParams.get('search') || ''

        // List available models
        if (!model) {
            const counts: Record<string, number> = {}
            for (const [name, m] of Object.entries(modelMap)) {
                try {
                    counts[name] = await m.count()
                } catch {
                    counts[name] = -1
                }
            }
            return NextResponse.json({ models: counts })
        }

        const prismaModel = modelMap[model.toLowerCase()]
        if (!prismaModel) {
            return NextResponse.json({ error: `Modelo "${model}" no encontrado` }, { status: 404 })
        }

        // Get single record
        if (id) {
            const record = await prismaModel.findUnique({ where: { id } })
            if (!record) return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
            return NextResponse.json({ record })
        }

        // List records with pagination
        const total = await prismaModel.count()
        const records = await prismaModel.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'desc' } as any,
        })

        return NextResponse.json({
            records,
            total,
            page,
            pages: Math.ceil(total / limit),
        })
    } catch (error: any) {
        console.error('DB Explorer error:', error)
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
    }
}

// PUT - Update a record
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { model, id, data } = body

        if (!model || !id || !data) {
            return NextResponse.json({ error: 'Se requiere model, id y data' }, { status: 400 })
        }

        const prismaModel = modelMap[model.toLowerCase()]
        if (!prismaModel) {
            return NextResponse.json({ error: `Modelo "${model}" no encontrado` }, { status: 404 })
        }

        // Clean up data - remove fields that shouldn't be updated
        const cleanData = { ...data }
        delete cleanData.id
        delete cleanData.createdAt
        delete cleanData.updatedAt
        delete cleanData.pedidos
        delete cleanData.productos
        delete cleanData.usuario
        delete cleanData.categoria
        delete cleanData.direcciones

        // Convert numeric strings to numbers where needed
        for (const [key, value] of Object.entries(cleanData)) {
            if (typeof value === 'string' && !isNaN(Number(value)) && value !== '' && !key.toLowerCase().includes('id') && !key.toLowerCase().includes('email') && !key.toLowerCase().includes('nombre') && !key.toLowerCase().includes('slug') && !key.toLowerCase().includes('imagen') && !key.toLowerCase().includes('password') && !key.toLowerCase().includes('descripcion') && !key.toLowerCase().includes('clave') && !key.toLowerCase().includes('valor') && !key.toLowerCase().includes('telefono') && !key.toLowerCase().includes('codigo') && !key.toLowerCase().includes('direccion') && !key.toLowerCase().includes('dni')) {
                cleanData[key] = Number(value)
            }
        }

        const updated = await prismaModel.update({
            where: { id },
            data: cleanData,
        })

        return NextResponse.json({ record: updated })
    } catch (error: any) {
        console.error('DB Explorer update error:', error)
        return NextResponse.json({ error: error.message || 'Error al actualizar' }, { status: 500 })
    }
}

// DELETE - Delete a record
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const model = searchParams.get('model')
        const id = searchParams.get('id')

        if (!model || !id) {
            return NextResponse.json({ error: 'Se requiere model e id' }, { status: 400 })
        }

        const prismaModel = modelMap[model.toLowerCase()]
        if (!prismaModel) {
            return NextResponse.json({ error: `Modelo "${model}" no encontrado` }, { status: 404 })
        }

        await prismaModel.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (error: any) {
        console.error('DB Explorer delete error:', error)
        return NextResponse.json({ error: error.message || 'Error al eliminar' }, { status: 500 })
    }
}
