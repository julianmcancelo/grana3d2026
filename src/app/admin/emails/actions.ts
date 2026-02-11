'use server'

import { sendEmail } from '@/lib/email'
import { getWelcomeEmailTemplate, getOrderConfirmationTemplate, getOrderStatusUpdateTemplate } from '@/lib/email-templates'
import { getEmailConfig } from '@/lib/config'

export async function sendTestWelcome(email: string) {
    try {
        const config = await getEmailConfig()
        const html = getWelcomeEmailTemplate('Usuario de Prueba', config, 'HOLA-PRUEBA-1234')
        await sendEmail({
            to: email,
            subject: `[TEST] Bienvenida - ${config.nombreTienda}`,
            html
        })
        return { success: true, message: 'Correo de bienvenida enviado' }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function sendTestOrder(email: string, metodoPago: 'MERCADOPAGO' | 'TRANSFERENCIA' | 'EFECTIVO') {
    try {
        const config = await getEmailConfig()

        // Mock Pedido
        const pedido = {
            id: 'ord_123456789',
            total: 45000,
            metodoEnvio: 'RETIRO_LOCAL',
            direccionEnvio: 'Calle Falsa 123',
            ciudadEnvio: 'Buenos Aires',
            provinciaEnvio: 'CABA'
        }

        const items = [
            { nombre: 'Impresión 3D Prototipo', cantidad: 1, precioUnitario: 25000, variante: 'PLA Gris' },
            { nombre: 'Modelado 3D', cantidad: 2, precioUnitario: 10000 }
        ]

        // Mock Payment URL for MP
        const paymentUrl = metodoPago === 'MERCADOPAGO' ? 'https://mercadopago.com.ar/checkout/v1/redirect?pref_id=...' : undefined

        const html = getOrderConfirmationTemplate(pedido, items, metodoPago, config, paymentUrl)

        await sendEmail({
            to: email,
            subject: `[TEST] Confirmación Pedido (${metodoPago})`,
            html
        })
        return { success: true, message: `Correo de pedido (${metodoPago}) enviado` }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}

export async function sendTestStatus(email: string, estado: string) {
    try {
        const config = await getEmailConfig()

        const pedido = {
            id: 'ord_987654321',
            estado,
            empresaEnvio: 'Correo Argentino',
            codigoSeguimiento: 'AB123456789AR'
        }

        const html = getOrderStatusUpdateTemplate(pedido, config)

        await sendEmail({
            to: email,
            subject: `[TEST] Estado: ${estado}`,
            html
        })
        return { success: true, message: `Correo de estado (${estado}) enviado` }
    } catch (error: any) {
        return { success: false, message: error.message }
    }
}
