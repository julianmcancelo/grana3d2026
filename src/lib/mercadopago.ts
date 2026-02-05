import { MercadoPagoConfig, Preference } from 'mercadopago'

// Cliente de Mercado Pago (usando credenciales de prueba por defecto)
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000'
})

// Función para crear preferencia de pago
export async function crearPreferencia(items: any[], pedidoId: string, email: string) {
    const preference = new Preference(client)

    try {
        const respuesta = await preference.create({
            body: {
                items: items.map(item => ({
                    id: item.productoId,
                    title: item.nombre,
                    quantity: item.cantidad,
                    unit_price: item.precioUnitario,
                    currency_id: 'ARS'
                })),
                payer: { email },
                external_reference: pedidoId, // Referencia única para conciliar
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_API_URL}/../checkout/success/${pedidoId}`,
                    failure: `${process.env.NEXT_PUBLIC_API_URL}/../checkout/failure/${pedidoId}`,
                    pending: `${process.env.NEXT_PUBLIC_API_URL}/../checkout/pending/${pedidoId}`
                },
                auto_return: 'approved'
            }
        })

        return respuesta.init_point // URL para redirigir al usuario al pago
    } catch (error) {
        console.error('Error al crear preferencia de MP:', error)
        throw new Error('No se pudo generar el pago con Mercado Pago')
    }
}
