export const styles = {
    container: `
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 620px;
        margin: 0 auto;
        background-color: #050505;
        color: #e5e7eb;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #1f2937;
        box-shadow: 0 10px 30px rgba(0,0,0,0.35);
    `,
    header: `
        background: linear-gradient(180deg, #0b0b0b 0%, #050505 100%);
        padding: 28px 24px;
        text-align: center;
        border-bottom: 2px solid #00AE42;
        background-image: linear-gradient(#0b0b0b 1px, transparent 1px), linear-gradient(90deg, #0b0b0b 1px, transparent 1px);
        background-size: 36px 36px;
    `,
    content: `
        padding: 32px 24px;
        background-color: #0b0b0b;
    `,
    footer: `
        background-color: #050505;
        padding: 18px;
        text-align: center;
        font-size: 12px;
        color: #9ca3af;
        border-top: 1px solid #1f2937;
    `,
    button: `
        display: inline-block;
        padding: 12px 22px;
        background-color: #ffffff;
        color: #0b0b0b;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 800;
        margin-top: 18px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
    `,
    highlight: `
        color: #00AE42;
        font-weight: 700;
    `,
    badge: `
        display: inline-block;
        padding: 6px 10px;
        border-radius: 999px;
        background-color: #00AE42;
        color: #0b0b0b;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.6px;
    `,
    card: `
        background-color: #111;
        padding: 18px;
        border-radius: 12px;
        border: 1px solid #1f2937;
        margin-top: 18px;
    `,
    table: `
        width: 100%;
        border-collapse: collapse;
        margin: 18px 0 10px 0;
        font-size: 14px;
    `,
    th: `
        text-align: left;
        padding: 12px;
        border-bottom: 1px solid #1f2937;
        color: #9ca3af;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-size: 11px;
    `,
    td: `
        padding: 12px;
        border-bottom: 1px solid #111827;
    `,
    total: `
        text-align: right;
        font-size: 18px;
        font-weight: 800;
        padding-top: 10px;
        color: #fff;
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

export function getWelcomeEmailTemplate(nombre: string, config: EmailBrandConfig = {}) {
    const brandName = config.nombreTienda || 'Grana 3D'
    const logoUrl = config.logoUrl || ''
    const direccion = config.direccion || ''
    const whatsappLink = config.whatsappLink || ''
    const instagramLink = config.instagramLink || ''
    const email = config.email || ''

    const headerBrandHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:48px; display:block; margin:0 auto 8px auto;" />
           <div style="color:#fff; letter-spacing:2px; font-weight:800; font-size:20px;">${brandName}</div>`
        : `<h1 style="margin:0; color:#fff; letter-spacing: 2px; font-weight: 800;">${brandName}</h1>`

    const contactLinks = [
        whatsappLink ? `<a href="${whatsappLink}" style="color:#00AE42; text-decoration:none;">WhatsApp</a>` : '',
        instagramLink ? `<a href="${instagramLink}" style="color:#00AE42; text-decoration:none;">Instagram</a>` : '',
        email ? `<a href="mailto:${email}" style="color:#00AE42; text-decoration:none;">${email}</a>` : ''
    ].filter(Boolean).join(' • ')

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                ${headerBrandHtml}
                ${direccion ? `<p style="margin:6px 0 0 0; color:#9ca3af; font-size:12px; letter-spacing:2px; text-transform:uppercase;">${direccion}</p>` : ''}
            </div>
            <div style="${styles.content}">
                <p style="margin:0 0 8px 0; color:#9ca3af; font-size:12px; letter-spacing:1px; text-transform:uppercase;">Cuenta activada</p>
                <h2 style="color:#fff; margin:0 0 12px 0;">¡Hola ${nombre}! 👋</h2>
                <p>Bienvenido a ${brandName}. Ya tenés tu cuenta lista para explorar modelos, hacer pedidos y seguir el estado de cada impresión.</p>
                <div style="${styles.card}">
                    <p style="margin:0; color:#e5e7eb;">Si te pinta, guardá este mail: es tu punto de partida para todo lo nuevo que vayamos lanzando.</p>
                </div>
                <div style="text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL || '#'}" style="${styles.button}">Ir a la tienda</a>
                </div>
            </div>
            <div style="${styles.footer}">
                ${contactLinks ? `<p style="margin:0 0 6px 0;">${contactLinks}</p>` : ''}
                <p style="margin:0;">&copy; ${new Date().getFullYear()} ${brandName}. Hecho con filamento y paciencia.</p>
            </div>
        </div>
    `;
}

export function getOrderConfirmationTemplate(pedido: any, items: any[], metodoPago: string, config: EmailBrandConfig = {}) {
    const brandName = config.nombreTienda || 'Grana 3D'
    const logoUrl = config.logoUrl || ''
    const direccion = config.direccion || ''
    const whatsappLink = config.whatsappLink || ''
    const instagramLink = config.instagramLink || ''
    const email = config.email || ''

    const headerBrandHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${brandName}" style="max-height:42px; display:block; margin:0 auto 8px auto;" />
           <div style="color:#fff; letter-spacing:2px; font-weight:800; font-size:18px;">${brandName}</div>`
        : `<div style="color:#fff; letter-spacing:2px; font-weight:800; font-size:20px;">${brandName}</div>`

    const contactLinks = [
        whatsappLink ? `<a href="${whatsappLink}" style="color:#00AE42; text-decoration:none;">WhatsApp</a>` : '',
        instagramLink ? `<a href="${instagramLink}" style="color:#00AE42; text-decoration:none;">Instagram</a>` : '',
        email ? `<a href="mailto:${email}" style="color:#00AE42; text-decoration:none;">${email}</a>` : ''
    ].filter(Boolean).join(' • ')

    const itemsHtml = items.map(item => `
        <tr>
            <td style="${styles.td}">
                <div style="font-weight: bold; color: #fff;">${item.nombre}</div>
                ${item.variante ? `<div style="font-size: 12px; color: #888;">${item.variante}</div>` : ''}
                <div style="font-size: 12px; color: #666;">Cant: ${item.cantidad}</div>
            </td>
            <td style="${styles.td}; text-align:right; vertical-align: top;">
                $ ${Intl.NumberFormat('es-AR').format(item.precioUnitario * item.cantidad)}
            </td>
        </tr>
    `).join('');

    let instruccionesPago = '';
    const bancoNombre = config.bancoNombre || ''
    const bancoCbu = config.bancoCbu || ''
    const bancoAlias = config.bancoAlias || ''
    const bancoTitular = config.bancoTitular || ''

    const bancoRows = [
        bancoNombre ? `<div style="border-bottom: 1px solid #262626; padding-bottom: 8px;">
                <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Banco</span>
                <span style="font-size: 16px; color: #fff; font-weight: 500;">${bancoNombre}</span>
            </div>` : '',
        bancoCbu ? `<div style="border-bottom: 1px solid #262626; padding-bottom: 8px;">
                <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">CBU / CVU</span>
                <span style="font-size: 16px; color: #fff; font-family: monospace; letter-spacing: 1px;">${bancoCbu}</span>
            </div>` : '',
        bancoAlias ? `<div style="border-bottom: 1px solid #262626; padding-bottom: 8px;">
                <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Alias</span>
                <span style="font-size: 18px; color: #22c55e; font-weight: bold;">${bancoAlias}</span>
            </div>` : '',
        bancoTitular ? `<div>
                <span style="display: block; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Titular</span>
                <span style="font-size: 16px; color: #fff;">${bancoTitular}</span>
            </div>` : ''
    ].filter(Boolean).join('')

    if (metodoPago === 'TRANSFERENCIA') {
        instruccionesPago = `
            <div style="background-color: #161616; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #22c55e; font-size: 18px; margin-bottom: 16px;">Datos para Transferencia</h3>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${bancoRows || '<p style="color:#aaa; margin:0;">Te vamos a enviar los datos por WhatsApp.</p>'}
                </div>
                <div style="margin-top: 20px; font-size: 13px; color: #888; background-color: rgba(34, 197, 94, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.2);">
                    ⚠️ <strong>Importante:</strong> Enviá el comprobante por WhatsApp indicando tu número de pedido <strong>#${pedido.id.slice(-6).toUpperCase()}</strong> para agilizar el despacho.
                </div>
            </div>
        `;
    } else if (metodoPago === 'EFECTIVO') {
        instruccionesPago = `
            <div style="background-color: #161616; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #f59e0b;">Pago en Efectivo</h3>
                <p style="color: #ccc;">Tené listo el monto exacto al momento de la entrega o retiro para agilizar el proceso.</p>
            </div>
        `;
    } else if (metodoPago === 'MERCADOPAGO') {
        instruccionesPago = `
            <div style="background-color: #161616; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #009ee3;">Pago por Mercado Pago</h3>
                <p style="color: #ccc;">Tu pago está siendo procesado por Mercado Pago. Te avisamos apenas se acredite.</p>
            </div>
        `;
    }

    const direccionEnvioHtml = pedido.metodoEnvio !== 'RETIRO_LOCAL' ? `
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
            <h3 style="color: #fff; font-size: 16px; margin: 0 0 12px 0;">📍 Datos de Envío</h3>
            <p style="margin: 0; color: #aaa; line-height: 1.5;">
                ${pedido.direccionEnvio}<br>
                ${pedido.ciudadEnvio}, ${pedido.provinciaEnvio}<br>
                CP: ${pedido.codigoPostalEnvio}
            </p>
        </div>
    ` : `
         <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
            <h3 style="color: #fff; font-size: 16px; margin: 0 0 12px 0;">🏪 Retiro en Local</h3>
            <p style="margin: 0; color: #aaa; line-height: 1.5;">
                Te esperamos en nuestro local para retirar tu pedido.<br>
                Coordiná el horario por WhatsApp.
            </p>
        </div>
    `;

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                ${headerBrandHtml}
                ${direccion ? `<p style="margin:6px 0 10px 0; color:#9ca3af; font-size:12px; letter-spacing:2px; text-transform:uppercase;">${direccion}</p>` : ''}
                <span style="${styles.badge}">#${pedido.id.slice(-6).toUpperCase()}</span>
            </div>
            <div style="${styles.content}">
                <p style="color:#fff; font-size: 16px; margin-top: 0;">¡Hola <strong>${pedido.nombreCliente}</strong>!</p>
                <p style="color:#aaa;">Recibimos tu pedido correctamente. A continuación los detalles:</p>
                
                ${instruccionesPago}

                <div style="background-color: #161616; border-radius: 8px; overflow: hidden; border: 1px solid #222; margin-top: 24px;">
                    <table style="${styles.table}; margin: 0;">
                        <thead>
                            <tr style="background-color: #111;">
                                <th style="${styles.th}; border-bottom: 1px solid #333; color: #666; font-size: 11px; text-transform: uppercase;">Producto</th>
                                <th style="${styles.th}; border-bottom: 1px solid #333; color: #666; font-size: 11px; text-transform: uppercase; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div style="padding: 16px; background-color: #111; border-top: 1px solid #222;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #888; font-size: 14px;">
                            <span>Envío</span>
                            <span>${pedido.metodoEnvio === 'RETIRO_LOCAL' ? 'Gratis' : 'A convenir'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; color: #fff; font-size: 18px; font-weight: bold; padding-top: 12px; border-top: 1px dashed #333;">
                            <span>Total</span>
                            <span style="color: #22c55e;">$ ${Intl.NumberFormat('es-AR').format(pedido.total)}</span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    ${direccionEnvioHtml}
                    
                    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #222;">
                        <h3 style="color: #fff; font-size: 16px; margin: 0 0 12px 0;">👤 Cliente</h3>
                         <p style="margin: 0; color: #aaa; line-height: 1.5;">
                            ${pedido.nombreCliente} ${pedido.apellidoCliente || ''}<br>
                            ${pedido.emailCliente}<br>
                            ${pedido.telefonoCliente || ''}
                        </p>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 32px;">
                    <a href="${process.env.NEXTAUTH_URL}/pedidos/mis-pedidos" style="${styles.button}">Ver estado del pedido</a>
                </div>
            </div>
            <div style="${styles.footer}">
                ${contactLinks ? `<p style="margin: 0 0 8px 0;">${contactLinks}</p>` : ''}
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} ${brandName}.</p>
            </div>
        </div>
    `;
}
