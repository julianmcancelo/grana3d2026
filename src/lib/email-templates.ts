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

export function getWelcomeEmailTemplate(nombre: string) {
    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="margin:0; color:#fff; letter-spacing: 2px; font-weight: 800;">GRANA 3D</h1>
                <p style="margin:6px 0 0 0; color:#9ca3af; font-size:12px; letter-spacing:2px; text-transform:uppercase;">Impresión 3D • Buenos Aires</p>
            </div>
            <div style="${styles.content}">
                <p style="margin:0 0 8px 0; color:#9ca3af; font-size:12px; letter-spacing:1px; text-transform:uppercase;">Cuenta activada</p>
                <h2 style="color:#fff; margin:0 0 12px 0;">¡Hola ${nombre}! 👋</h2>
                <p>Bienvenido a Grana 3D. Ya tenés tu cuenta lista para explorar modelos, hacer pedidos y seguir el estado de cada impresión.</p>
                <div style="${styles.card}">
                    <p style="margin:0; color:#e5e7eb;">Si te pinta, guardá este mail: es tu punto de partida para todo lo nuevo que vayamos lanzando.</p>
                </div>
                <div style="text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL || '#'}" style="${styles.button}">Ir a la tienda</a>
                </div>
            </div>
            <div style="${styles.footer}">
                <p style="margin:0;">&copy; ${new Date().getFullYear()} Grana 3D. Hecho con filamento y paciencia.</p>
            </div>
        </div>
    `;
}

export function getOrderConfirmationTemplate(pedido: any, items: any[], metodoPago: string) {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="${styles.td}">${item.nombre} <br><span style="font-size:12px; color:#666">x${item.cantidad}</span></td>
            <td style="${styles.td}; text-align:right;">$ ${Intl.NumberFormat('es-AR').format(item.precioUnitario * item.cantidad)}</td>
        </tr>
    `).join('');

    let instruccionesPago = '';

    if (metodoPago === 'TRANSFERENCIA') {
        instruccionesPago = `
            <div style="${styles.card}">
                <h3 style="margin-top:0; color: #00AE42;">Datos para Transferencia</h3>
                <p style="margin:6px 0;">Banco: <span style="color:#fff">Banco Example</span></p>
                <p style="margin:6px 0;">CBU: <span style="color:#fff">0000003100000000000000</span></p>
                <p style="margin:6px 0;">Alias: <span style="color:#fff; font-weight:bold;">GRANA.3D.PAGO</span></p>
                <p style="margin:6px 0;">Titular: <span style="color:#fff">Julian Cancelo</span></p>
                <p style="font-size:12px; color:#9ca3af; margin-top:10px;">Enviá el comprobante por WhatsApp con tu número de pedido.</p>
            </div>
        `;
    } else if (metodoPago === 'EFECTIVO') {
        instruccionesPago = `
            <div style="${styles.card}">
                <h3 style="margin-top:0; color: #00AE42;">Pago en Efectivo</h3>
                <p>Tené listo el monto exacto al momento de la entrega o retiro para agilizar el proceso.</p>
            </div>
        `;
    } else if (metodoPago === 'MERCADOPAGO') {
        instruccionesPago = `
            <div style="${styles.card}">
                <h3 style="margin-top:0; color: #009ee3;">Pago por Mercado Pago</h3>
                <p>Tu pago está siendo procesado. Te avisamos cuando se acredite.</p>
            </div>
        `;
    }

    return `
        <div style="${styles.container}">
            <div style="${styles.header}">
                <h1 style="margin:0; color:#fff; letter-spacing:2px; font-weight:800;">GRANA 3D</h1>
                <p style="margin:6px 0 12px 0; color:#9ca3af; font-size:12px; letter-spacing:2px; text-transform:uppercase;">Confirmación de pedido</p>
                <span style="${styles.badge}">#${pedido.id.slice(-6).toUpperCase()}</span>
            </div>
            <div style="${styles.content}">
                <h2 style="color:#fff; margin:0 0 8px 0;">¡Gracias por tu compra!</h2>
                <p>Recibimos tu pedido y ya lo estamos preparando. Abajo tenés el resumen:</p>
                
                <table style="${styles.table}">
                    <thead>
                        <tr>
                            <th style="${styles.th}">Producto</th>
                            <th style="${styles.th}; text-align:right;">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div style="${styles.total}">
                    Total: $ ${Intl.NumberFormat('es-AR').format(pedido.total)}
                </div>

                ${instruccionesPago}

                <div style="text-align: center;">
                    <a href="${process.env.NEXTAUTH_URL}/pedidos/mis-pedidos" style="${styles.button}">Ver estado del pedido</a>
                </div>
            </div>
            <div style="${styles.footer}">
                <p style="margin:0 0 6px 0;">¿Dudas? Escribinos por WhatsApp.</p>
                <p style="margin:0;">&copy; ${new Date().getFullYear()} Grana 3D.</p>
            </div>
        </div>
    `;
}
