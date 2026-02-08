import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmailTemplate, getOrderConfirmationTemplate } from '@/lib/email-templates';
import { getEmailConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');
    const type = searchParams.get('type'); // 'welcome', 'order_transfer', 'order_cash', 'order_mp'

    if (!to) {
        return NextResponse.json({ error: 'Missing "to" query parameter' }, { status: 400 });
    }

    try {
        const emailConfig = await getEmailConfig();
        let subject = 'Prueba de correo';
        let html = '';

        if (type === 'welcome') {
            subject = `¡Bienvenido a ${emailConfig.nombreTienda}! (Prueba)`;
            html = getWelcomeEmailTemplate('Usuario de Prueba', emailConfig);
        } else if (type && type.startsWith('order_')) {
            const dummyItem = { nombre: 'Producto de Prueba', cantidad: 2, precioUnitario: 1500, variante: 'Color Rojo' };
            const dummyOrder = {
                id: 'TEST-123456',
                total: 3000,
                nombreCliente: 'Juan',
                apellidoCliente: 'Perez',
                emailCliente: to,
                direccionEnvio: 'Calle Falsa 123',
                ciudadEnvio: 'CABA',
                provinciaEnvio: 'Buenos Aires',
                codigoPostalEnvio: '1414',
                metodoEnvio: 'CORREO_ARGENTINO'
            };
            let metodo = 'EFECTIVO';

            if (type === 'order_transfer') metodo = 'TRANSFERENCIA';
            if (type === 'order_mp') metodo = 'MERCADOPAGO';

            subject = `Confirmación de Pedido #TEST (Prueba ${metodo})`;
            html = getOrderConfirmationTemplate(dummyOrder, [dummyItem], metodo, emailConfig);
        } else {
            subject = 'Prueba de envío simple';
            html = '<h1>Correo de prueba</h1><p>El sistema de correos funciona correctamente.</p>';
        }

        await sendEmail({ to, subject, html });

        return NextResponse.json({ success: true, message: `Correo de tipo '${type || 'simple'}' enviado a ${to}` });
    } catch (error) {
        return NextResponse.json({ error: 'Error enviando correo', details: error }, { status: 500 });
    }
}
