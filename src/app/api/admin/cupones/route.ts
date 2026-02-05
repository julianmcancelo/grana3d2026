import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Listar cupones
export async function GET() {
    try {
        const cupones = await prisma.cupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { UsoCupon: true } }
            }
        })
        return NextResponse.json(cupones)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al obtener cupones' }, { status: 500 })
    }
}

// POST - Crear cupón
export async function POST(request: NextRequest) {
    try {
        const data = await request.json()

        // Verificar código único
        const existente = await prisma.cupon.findUnique({
            where: { codigo: data.codigo.toUpperCase() }
        })
        if (existente) {
            return NextResponse.json({ error: 'El código ya existe' }, { status: 400 })
        }

        const cupon = await prisma.cupon.create({
            data: {
                id: crypto.randomUUID(),
                codigo: data.codigo.toUpperCase(),
                descripcion: data.descripcion || null,
                tipo: data.tipo || 'PORCENTAJE',
                valor: parseFloat(data.valor),
                minimoCompra: data.minimoCompra ? parseFloat(data.minimoCompra) : null,
                maximoDescuento: data.maximoDescuento ? parseFloat(data.maximoDescuento) : null,
                usosMaximos: data.usosMaximos ? parseInt(data.usosMaximos) : null,
                usosPorUsuario: data.usosPorUsuario ? parseInt(data.usosPorUsuario) : 1,
                fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : new Date(),
                fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
                activo: data.activo ?? true,
                aplicaA: data.aplicaA || 'TODO',
                categoriaIds: data.categoriaIds || [],
                productoIds: data.productoIds || [],
                updatedAt: new Date()
            }
        })

        return NextResponse.json(cupon)
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Error al crear cupón' }, { status: 500 })
    }
}
