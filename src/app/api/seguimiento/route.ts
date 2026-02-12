import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const codigo = searchParams.get('codigo')
        const numero = searchParams.get('numero')

        if (!codigo && !numero) {
            return NextResponse.json({ error: 'Se requiere un código de seguimiento o número de pedido' }, { status: 400 })
        }

        let pedido

        if (codigo) {
            pedido = await prisma.pedido.findFirst({
                where: { codigoSeguimiento: codigo },
                select: {
                    id: true,
                    numero: true,
                    nombreCliente: true,
                    estado: true,
                    metodoEnvio: true,
                    codigoSeguimiento: true,
                    empresaEnvio: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })
        } else if (numero) {
            pedido = await prisma.pedido.findFirst({
                where: { numero: parseInt(numero) },
                select: {
                    id: true,
                    numero: true,
                    nombreCliente: true,
                    estado: true,
                    metodoEnvio: true,
                    codigoSeguimiento: true,
                    empresaEnvio: true,
                    createdAt: true,
                    updatedAt: true,
                }
            })
        }

        if (!pedido) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
        }

        // Only return safe public data (no email, items, totals)
        return NextResponse.json({
            pedido: {
                numero: pedido.numero,
                nombreCliente: pedido.nombreCliente?.split(' ')[0] || 'Cliente', // only first name
                estado: pedido.estado,
                metodoEnvio: pedido.metodoEnvio,
                codigoSeguimiento: pedido.codigoSeguimiento,
                empresaEnvio: pedido.empresaEnvio,
                fechaPedido: pedido.createdAt,
                ultimaActualizacion: pedido.updatedAt,
            }
        })
    } catch (error) {
        console.error('Error en tracking:', error)
        return NextResponse.json({ error: 'Error interno' }, { status: 500 })
    }
}
