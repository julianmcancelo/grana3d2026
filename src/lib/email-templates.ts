export const styles = {
    container: \`
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background-color: #0a0a0a;
        color: #e0e0e0;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #333;
    \`,
    header: \`
        background-color: #000;
        padding: 24px;
        text-align: center;
        border-bottom: 2px solid #22c55e;
    \`,
    content: \`
        padding: 32px 24px;
        background-color: #111;
    \`,
    footer: \`
        background-color: #000;
        padding: 16px;
        text-align: center;
        font-size: 12px;
        color: #666;
        border-top: 1px solid #333;
    \`,
    button: \`
        display: inline-block;
        padding: 12px 24px;
        background-color: #22c55e;
        color: #000;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin-top: 20px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    \`,
    highlight: \`
        color: #22c55e;
        font-weight: bold;
    \`,
    table: \`
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 14px;
    \`,
    th: \`
        text-align: left;
        padding: 12px;
        border-bottom: 1px solid #333;
        color: #888;
    \`,
    td: \`
        padding: 12px;
        border-bottom: 1px solid #222;
    \`,
    total: \`
        text-align: right;
        font-size: 18px;
        font-weight: bold;
        padding-top: 20px;
        color: #fff;
    \`
};

export function getWelcomeEmailTemplate(nombre: string) {
    return \`
        <div style="\${styles.container}">
            <div style="\${styles.header}">
                <h1 style="margin:0; color:#fff; letter-spacing: 1px;">GRANA 3D</h1>
            </div>
            <div style="\${styles.content}">
                <h2 style="color:#fff;">¡Hola \${nombre}! 👋</h2>
                <p>Bienvenido al futuro de la impresión 3D. Tu cuenta ha sido creada exitosamente.</p>
                <p>Ahora puedes acceder a nuestra colección exclusiva de modelos, gestionar tus pedidos y más.</p>
                <div style="text-align: center;">
                    <a href="\${process.env.NEXTAUTH_URL || '#'}" style="\${styles.button}">Explorar Modelos</a>
                </div>
            </div>
            <div style="\${styles.footer}">
                <p>&copy; \${new Date().getFullYear()} Grana 3D. Todos los derechos reservados.</p>
            </div>
        </div>
    \`;
}

export function getOrderConfirmationTemplate(pedido: any, items: any[], metodoPago: string) {
    const itemsHtml = items.map(item => \`
        <tr>
            <td style="\${styles.td}">\${item.nombre} <br><span style="font-size:12px; color:#666">x\${item.cantidad}</span></td>
            <td style="\${styles.td}; text-align:right;">$ \${Intl.NumberFormat('es-AR').format(item.precioUnitario * item.cantidad)}</td>
        </tr>
    \`).join('');

    let instruccionesPago = '';

    if (metodoPago === 'TRANSFERENCIA') {
        instruccionesPago = \`
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #22c55e;">Datos para Transferencia</h3>
                <p style="margin:5px 0;">Banco: <span style="color:#fff">Banco Example</span></p>
                <p style="margin:5px 0;">CBU: <span style="color:#fff">0000003100000000000000</span></p>
                <p style="margin:5px 0;">Alias: <span style="color:#fff; font-weight:bold;">GRANA.3D.PAGO</span></p>
                <p style="margin:5px 0;">Titular: <span style="color:#fff">Julian Cancelo</span></p>
                <p style="font-size:13px; color:#888; margin-top:10px;">Envia el comprobante por WhatsApp con tu número de pedido.</p>
            </div>
        \`;
    } else if (metodoPago === 'EFECTIVO') {
        instruccionesPago = \`
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #22c55e;">Pago en Efectivo</h3>
                <p>Ten listo el monto exacto al momento de la entrega o retiro para agilizar el proceso.</p>
            </div>
        \`;
    } else if (metodoPago === 'MERCADOPAGO') {
        instruccionesPago = \`
            <div style="background-color: #1a1a1a; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #333;">
                <h3 style="margin-top:0; color: #009ee3;">Pago por Mercado Pago</h3>
                <p>Tu pago está siendo procesado. Te avisaremos cuando se acredite.</p>
            </div>
        \`;
    }

    return \`
        <div style="\${styles.container}">
            <div style="\${styles.header}">
                <h1 style="margin:0; color:#fff;">Confirmación de Pedido</h1>
                <p style="margin:5px 0 0 0; color:#22c55e;">#\${pedido.id.slice(-6).toUpperCase()}</p>
            </div>
            <div style="\${styles.content}">
                <h2 style="color:#fff;">¡Gracias por tu compra!</h2>
                <p>Hemos recibido tu pedido correctamente. A continuación los detalles:</p>
                
                <table style="\${styles.table}">
                    <thead>
                        <tr>
                            <th style="\${styles.th}">Producto</th>
                            <th style="\${styles.th}; text-align:right;">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${itemsHtml}
                    </tbody>
                </table>

                <div style="\${styles.total}">
                    Total: $ \${Intl.NumberFormat('es-AR').format(pedido.total)}
                </div>

                \${instruccionesPago}

                <div style="text-align: center;">
                    <a href="\${process.env.NEXTAUTH_URL}/pedidos/mis-pedidos" style="\${styles.button}">Ver Estado del Pedido</a>
                </div>
            </div>
            <div style="\${styles.footer}">
                <p>Si tienes alguna duda, contáctanos por WhatsApp.</p>
                <p>&copy; \${new Date().getFullYear()} Grana 3D.</p>
            </div>
        </div>
    \`;
}
