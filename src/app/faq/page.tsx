export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 py-12 text-white">
            <h1 className="text-3xl font-bold mb-8">Preguntas Frecuentes</h1>
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2">¿Tienen stock de todos los productos?</h3>
                    <p className="text-gray-300">Sí, el stock mostrado en la web es real. Si dice disponible, ¡lo tenemos!</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">¿Hacen envíos internacionales?</h3>
                    <p className="text-gray-300">Por el momento solo realizamos envíos dentro de Argentina.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">¿Qué medios de pago aceptan?</h3>
                    <p className="text-gray-300">Aceptamos Mercado Pago, tarjetas de crédito/débito y transferencia bancaria.</p>
                </div>
            </div>
        </div>
    )
}
