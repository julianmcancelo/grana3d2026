export const styles = {
    container: `
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background-color: #000000;
        color: #f3f4f6;
        border-radius: 24px;
        overflow: hidden;
        border: 1px solid #1f1f1f;
    `,
    header: `
        background-color: #000000;
        padding: 40px 32px;
        text-align: center;
        border-bottom: 1px solid #1f1f1f;
    `,
    content: `
        padding: 40px 32px;
        background-color: #0a0a0a;
    `,
    footer: `
        background-color: #000000;
        padding: 32px;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        border-top: 1px solid #1f1f1f;
    `,
    button: `
        display: inline-block;
        padding: 14px 32px;
        background-color: #00AE42;
        color: #ffffff;
        text-decoration: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 14px;
        margin-top: 24px;
        transition: all 0.2s;
    `,
    highlight: `
        color: #00AE42;
        font-weight: 600;
    `,
    badge: `
        display: inline-block;
        padding: 4px 12px;
        border-radius: 9999px;
        background-color: rgba(0, 174, 66, 0.1);
        color: #00AE42;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid rgba(0, 174, 66, 0.2);
    `,
    card: `
        background-color: #111111;
        padding: 24px;
        border-radius: 16px;
        border: 1px solid #222;
        margin-top: 24px;
    `,
    table: `
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
    `,
    th: `
        text-align: left;
        padding: 12px 0;
        color: #9ca3af;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 600;
        border-bottom: 1px solid #222;
    `,
    td: `
        padding: 16px 0;
        border-bottom: 1px solid #1a1a1a;
        color: #e5e5e5;
        font-size: 14px;
    `
};

export type EmailBrandConfig = {
    nombreTienda?: string
    logoUrl?: string
    direccion?: string
    whatsapp?: string
    whatsappLink?: string
    instagram?: string
    instagramLink?: string
    email?: string
    bancoNombre?: string
    bancoCbu?: string
    bancoAlias?: string
    bancoTitular?: string
}

const getBaseUrl = () => process.env.NEXTAUTH_URL || 'https://grana3d.com.ar';

const getHeaderHtml = (config: EmailBrandConfig) => {
    const brandName = config.nombreTienda || 'Grana 3D'
    const logoUrl = config.logoUrl || ''

    return logoUrl
        ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:40px; display:block; margin:0 auto;" />`
        : `<h1 style="margin:0; color:#fff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">${brandName}</h1>`
}

const getFooterHtml = (config: EmailBrandConfig) => {
    const brandName = config.nombreTienda || 'Grana 3D'
    const whatsappLink = config.whatsappLink || ''
    const instagramLink = config.instagramLink || ''
    const email = config.email || ''

    const links = [
        whatsappLink ? `<a href="${whatsappLink}" style="color:#6b7280; text-decoration:none; margin:0 8px;">WhatsApp</a>` : '',
        instagramLink ? `<a href="${instagramLink}" style="color:#6b7280; text-decoration:none; margin:0 8px;">Instagram</a>` : '',
        email ? `<a href="mailto:${email}" style="color:#6b7280; text-decoration:none; margin:0 8px;">Email</a>` : ''
    ].filter(Boolean).join('•');

    return `
        <div style="${styles.footer}">
            <div style="margin-bottom: 24px;">${links}</div>
            <p style="margin:0;">&copy; ${new Date().getFullYear()} ${brandName}. Designed to Engineer.</p>
        </div>
    `
}

export function getWelcomeEmailTemplate(nombre: string, config: EmailBrandConfig = {}, couponCode?: string) {
    const brandName = config.nombreTienda || 'Grana 3D'
    const baseUrl = getBaseUrl();

    const couponHtml = couponCode ? `
        <div style="${styles.card}; text-align: center; border: 1px solid #00AE42;">
            <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Regalo de Bienvenida</p>
            <h3 style="margin: 0 0 16px 0; color: #fff; font-size: 28px; letter-spacing: -0.02em;">15% OFF</h3>
            <div style="background-color: #000; color: #00AE42; font-family: monospace; font-size: 20px; font-weight: 700; padding: 16px; border-radius: 8px; display: inline-block; letter-spacing: 0.1em; border: 1px dashed #333;">
                ${couponCode}
            </div>
            <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 12px;">Válido para tu primera compra.</p>
        </div>
    ` : '';

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                ${getHeaderHtml(config)}
            </div>
            <div style="${styles.content}">
                <h2 style="color:#fff; margin:0 0 16px 0; font-size: 20px;">Bienvenido, ${nombre}</h2>
                <p style="color:#9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
                    Gracias por unirte a ${brandName}. Tu cuenta ha sido creada exitosamente.
                    Ahora tenés acceso a nuestra plataforma de gestión de impresiones y seguimiento.
                </p>
                
                ${couponHtml}

                <div style="text-align: center;">
                    <a href="${baseUrl}" style="${styles.button}">Ir a la Tienda</a>
                </div>
            </div>
            ${getFooterHtml(config)}
        </div>
    `;
}

export function getOrderConfirmationTemplate(pedido: any, items: any[], metodoPago: string, config: EmailBrandConfig = {}, paymentUrl?: string) {
    const baseUrl = getBaseUrl();

    // Items Logic
    const itemsHtml = items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: 500; color: #fff;">${item.nombre}</div>
                ${item.variante ? `<div style="font-size: 12px; color: #6b7280; margin-top: 4px;">${item.variante}</div>` : ''}
            </td>
            <td style="${styles.td}; text-align: right; vertical-align: top;">
                <div style="color: #9ca3af; font-size: 12px;">x${item.cantidad}</div>
            </td>
            <td style="${styles.td}; text-align: right; vertical-align: top; font-weight: 500;">
                $${Intl.NumberFormat('es-AR').format(item.precioUnitario * item.cantidad)}
            </td>
        </tr>
    `).join('');

    // Payment Logic
    let paymentInfo = '';

    if (metodoPago === 'MERCADOPAGO') {
        const paymentButtonHtml = (config as any).paymentUrl ? `
            <div style="text-align: center; margin: 24px 0;">
                <a href="${(config as any).paymentUrl}" style="${styles.button}; background-color: #009ee3;">
                    Pagar Ahora con Mercado Pago
                </a>
                <p style="margin-top: 12px; font-size: 13px; color: #9ca3af;">
                    Si no pudiste completar el pago, usá este botón para finalizar tu compra.
                </p>
            </div>
        ` : '';

        paymentInfo = `
            <div style="${styles.card}">
                <h3 style="margin:0 0 16px 0; color: #fff; font-size: 15px;">Información de Pago</h3>
                <p style="color: #9ca3af; font-size: 14px; margin-bottom: 16px;">
                    Has seleccionado Mercado Pago.
                    ${(config as any).paymentUrl ? 'Para confirmar tu pedido, es necesario completar el pago.' : 'El pago se procesará a través de la plataforma.'}
                </p>
                ${paymentButtonHtml}
            </div>
        `;
    } else if (metodoPago === 'TRANSFERENCIA') {
        const bancoNombre = config.bancoNombre || '';
        const bancoAlias = config.bancoAlias || '';
        const bancoCbu = config.bancoCbu || '';

        paymentInfo = `
            <div style="${styles.card}">
                <h3 style="margin:0 0 16px 0; color: #fff; font-size: 15px;">Datos de Transferencia</h3>
                <div style="font-family: monospace; color: #9ca3af; font-size: 13px; line-height: 1.8;">
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding-bottom:8px; margin-bottom:8px;">
                        <span>Banco</span> <span style="color:#fff">${bancoNombre}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #222; padding-bottom:8px; margin-bottom:8px;">
                        <span>Alias</span> <span style="color:#00AE42; font-weight:bold;">${bancoAlias}</span>
                    </div>
                    <div>
                        <span>CBU</span> <span style="color:#fff">${bancoCbu}</span>
                    </div>
                </div>
                <div style="margin-top: 16px; padding: 12px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; color: #60a5fa; font-size: 12px;">
                    Por favor envianos el comprobante respondiendo a este correo o por WhatsApp.
                </div>
            </div>
        `;
    } else if (metodoPago === 'EFECTIVO') {
        paymentInfo = `
            <div style="${styles.card}">
                <h3 style="margin:0 0 16px 0; color: #fff; font-size: 15px;">Pago en Efectivo</h3>
                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                    Podés abonar al retirar tu pedido por nuestro local.
                    <br><br>
                    <strong style="color: #fff;">Dirección:</strong><br>
                    ${config.direccion || 'Consultar dirección por WhatsApp'}
                </p>
            </div>
        `;
    }

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                ${getHeaderHtml(config)}
                <div style="margin-top: 16px;">
                    <span style="${styles.badge}">Pedido #${pedido.id.slice(-6).toUpperCase()}</span>
                </div>
            </div>
            <div style="${styles.content}">
                <h2 style="color:#fff; margin:0 0 8px 0; font-size: 24px; text-align: center;">Confirmación de Pedido</h2>
                <p style="color:#9ca3af; text-align: center; margin: 0 0 32px 0;">Gracias por confiar en nosotros.</p>

                <div style="background-color: #111; border-radius: 16px; border: 1px solid #222; overflow: hidden;">
                    <table style="${styles.table}; padding: 0 24px;">
                        <thead>
                            <tr>
                                <th style="${styles.th}">Producto</th>
                                <th style="${styles.th}; text-align: right;">Cant.</th>
                                <th style="${styles.th}; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding-top: 16px; color: #9ca3af; font-size: 13px;">Envío</td>
                                <td style="padding-top: 16px; text-align: right; color: #fff;">
                                    ${pedido.metodoEnvio === 'RETIRO_LOCAL' ? 'Gratis' : 'A convenir'}
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 12px 0 24px 0; color: #fff; font-weight: 600; font-size: 16px;">Total</td>
                                <td style="padding: 12px 0 24px 0; text-align: right; color: #00AE42; font-weight: 700; font-size: 18px;">
                                    $${Intl.NumberFormat('es-AR').format(pedido.total)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                ${paymentInfo}

                <div style="margin-top: 32px; border-top: 1px solid #1f1f1f; padding-top: 24px;">
                    <h3 style="color: #fff; font-size: 15px; margin-bottom: 12px;">Información de Envío</h3>
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        ${pedido.direccionEnvio || 'Retiro en Local'}<br>
                        ${pedido.ciudadEnvio ? `${pedido.ciudadEnvio}, ${pedido.provinciaEnvio}` : ''}
                    </p>
                </div>

                <div style="text-align: center;">
                    <a href="${baseUrl}/pedidos/mis-pedidos" style="${styles.button}">Ver Estado del Pedido</a>
                </div>
            </div>
            ${getFooterHtml(config)}
        </div>
    `;
}

export function getOrderStatusUpdateTemplate(pedido: any, config: EmailBrandConfig = {}) {
    const baseUrl = getBaseUrl();
    const estadoLabels: Record<string, string> = {
        'PENDIENTE': 'Pendiente',
        'PAGADO': 'Pago Confirmado',
        'EN_PROCESO': 'En Producción',
        'ENVIADO': 'En Camino',
        'ENTREGADO': 'Entregado',
        'CANCELADO': 'Cancelado'
    };

    const estadoColor = pedido.estado === 'ENVIADO' ? '#00AE42' : '#fff';
    const estadoTexto = estadoLabels[pedido.estado] || pedido.estado;

    let trackingHtml = '';
    if (pedido.estado === 'ENVIADO' && pedido.codigoSeguimiento) {
        trackingHtml = `
            <div style="${styles.card}; border: 1px solid #00AE42; background: rgba(0, 174, 66, 0.05);">
                <h3 style="margin:0 0 12px 0; color: #00AE42; font-size: 15px;">Información de Seguimiento</h3>
                <p style="margin: 0 0 8px 0; color: #e5e5e5; font-size: 14px;">
                    Empresa: <strong style="color: #fff;">${pedido.empresaEnvio || 'Correo'}</strong>
                </p>
                <div style="background: #000; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 16px; color: #fff; letter-spacing: 1px; border: 1px dashed #333;">
                    ${pedido.codigoSeguimiento}
                </div>
                <p style="margin: 12px 0 0 0; color: #9ca3af; font-size: 12px;">Podés usar este código para seguir tu paquete.</p>
            </div>
        `;
    }

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                ${getHeaderHtml(config)}
            </div>
            <div style="${styles.content}">
                <div style="text-align: center; margin-bottom: 32px;">
                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Actualización de Estado</p>
                    <h2 style="color: ${estadoColor}; margin: 0; font-size: 28px; letter-spacing: -0.02em;">${estadoTexto}</h2>
                </div>

                <p style="color: #d1d5db; line-height: 1.6; text-align: center; margin-bottom: 32px;">
                    El estado de tu pedido <strong>#${pedido.id.slice(-6).toUpperCase()}</strong> ha sido actualizado.
                    ${pedido.estado === 'EN_PROCESO' ? 'Estamos preparando tus productos con la máxima calidad.' : ''}
                    ${pedido.estado === 'ENVIADO' ? 'Tu paquete ya salió de nuestro taller y está en camino.' : ''}
                </p>

                ${trackingHtml}

                <div style="text-align: center;">
                    <a href="${baseUrl}/pedidos/mis-pedidos" style="${styles.button}">Rastrear Pedido</a>
                </div>
            </div>
            ${getFooterHtml(config)}
        </div>
    `;
}
