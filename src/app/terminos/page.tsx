import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Términos y Condiciones',
    description: 'Conocé las políticas de compra, envíos y devoluciones de Grana3D.',
}

export default function TerminosPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] py-20 px-4">
            <div className="max-w-4xl mx-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12 shadow-sm">
                <h1 className="text-3xl md:text-4xl font-black mb-8 text-gray-900 dark:text-white">Términos y Condiciones</h1>
                
                <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Generalidades</h2>
                        <p>
                            Bienvenido a Grana3D. Al realizar una compra en nuestro sitio web, aceptás los siguientes términos y condiciones. Nos reservamos el derecho de modificar estas políticas en cualquier momento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Productos y Precios</h2>
                        <p>
                            Todos los precios están expresados en Pesos Argentinos (ARS) e incluyen IVA salvo que se indique lo contrario. Las imágenes son ilustrativas. Nos esforzamos por mantener el stock actualizado, pero en caso de falta de stock luego de la compra, nos contactaremos para ofrecer un reemplazo o reembolso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Envíos y Entregas</h2>
                        <p>
                            Realizamos envíos a todo el país. Los tiempos de entrega son estimativos y dependen del correo seleccionado. Grana3D no se responsabiliza por demoras ocasionadas por la empresa de logística, aunque ayudaremos en el reclamo.
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>El despacho se realiza dentro de las 48hs hábiles de acreditado el pago.</li>
                            <li>Para productos "A pedido" o "Preventa", los plazos se informan en la publicación.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Política de Devolución y Garantía</h2>
                        <p>
                            Todos nuestros productos cuentan con garantía por defectos de fabricación.
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Cambios:</strong> Tenés 30 días para realizar cambios si el producto no fue utilizado.</li>
                            <li><strong>Fallas:</strong> Si recibiste un producto fallado, contactanos dentro de las 72hs para gestionar el cambio directo sin costo.</li>
                            <li><strong>Impresoras 3D:</strong> La garantía cubre partes mecánicas y electrónicas, no consumibles (boquillas, láminas, etc.) ni daños por mal uso.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Servicios de Impresión</h2>
                        <p>
                            Para trabajos de impresión 3D a pedido:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Se requiere una seña del 50% para comenzar el trabajo.</li>
                            <li>Los tiempos de entrega pueden variar según la complejidad y demanda del taller.</li>
                            <li>No nos hacemos responsables por fallas de diseño en modelos provistos por el cliente (STL ajenos).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Contacto</h2>
                        <p>
                            Ante cualquier duda, escribinos a <strong>contacto@grana3d.com.ar</strong> o por WhatsApp al número indicado en la web.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
