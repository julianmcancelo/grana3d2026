import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email'; // Ajusta la ruta si es necesario

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get('to');

    if (!to) {
        return NextResponse.json({ error: 'Missing "to" query parameter' }, { status: 400 });
    }

    try {
        await sendEmail({
            to,
            subject: 'Prueba de envío de correo - Grana 3D',
            html: '<h1>¡Correo de prueba exitoso!</h1><p>Si estás viendo esto, la integración con Gmail funciona correctamente.</p>',
        });

        return NextResponse.json({ success: true, message: `Correo enviado a ${to}` });
    } catch (error) {
        return NextResponse.json({ error: 'Error enviando correo', details: error }, { status: 500 });
    }
}
