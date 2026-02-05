import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
    try {
        const { codigo, items, total } = await request.json()

        if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

        const cupon = await prisma.cupon.findUnique({
            where: { codigo },
            include: { ProgramaIncentivo: true } // Para ver si es parte de un programa
        })

        if (!cupon) return NextResponse.json({ error: 'Cupón no válido' }, { status: 404 })

        // 1. Validar si está activo
        if (!cupon.activo) return NextResponse.json({ error: 'Este cupón ya no está activo' }, { status: 400 })

        // 2. Validar fechas
        const ahora = new Date()
        if (cupon.fechaInicio > ahora) return NextResponse.json({ error: 'El cupón aún no está vigente' }, { status: 400 })
        if (cupon.fechaFin && cupon.fechaFin < ahora) return NextResponse.json({ error: 'El cupón ha vencido' }, { status: 400 })

        // 3. Validar montos mínimos
        if (cupon.minimoCompra && total < cupon.minimoCompra) {
            return NextResponse.json({ error: `Necesitás comprar al menos $${cupon.minimoCompra} para usar este cupón` }, { status: 400 })
        }

        // 4. Validar límite de usos globales
        if (cupon.usosMaximos && cupon.usosActuales >= cupon.usosMaximos) {
            return NextResponse.json({ error: 'Este cupón agotó sus usos disponibles' }, { status: 400 })
        }

        // 5. Calcular descuento
        let descuento = 0
        let tipo = cupon.tipo // PORCENTAJE, FIJO, ENVIO_GRATIS

        if (tipo === 'PORCENTAJE') {
            descuento = total * (cupon.valor / 100)
            if (cupon.maximoDescuento && descuento > cupon.maximoDescuento) {
                descuento = cupon.maximoDescuento
            }
        } else if (tipo === 'FIJO') {
            descuento = cupon.valor
        } else if (tipo === 'ENVIO_GRATIS') {
            // La lógica de envío gratis se maneja en el frontend o sumando el costo de envío antes
            // Acá indicamos que el descuento es 0 en producto, pero marcamos el flag
            descuento = 0 
        }

        // Evitar descuentos negativos o mayores al total
        if (descuento > total) descuento = total

        return NextResponse.json({
            valido: true,
            codigo: cupon.codigo,
            tipo: cupon.tipo,
            valor: cupon.valor,
            descuentoAplicado: descuento,
            mensaje: tipo === 'ENVIO_GRATIS' ? '¡Envío Gratis aplicado!' : `Descuento de $${descuento}`,
            cuponId: cupon.id
        })

    } catch (error) {
        console.error('Error validando cupón:', error)
        return NextResponse.json({ error: 'Error al validar cupón' }, { status: 500 })
    }
}
