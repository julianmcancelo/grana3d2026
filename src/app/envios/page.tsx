export default function EnviosPage() {
    return (
        <div className="container mx-auto px-4 py-12 text-white">
            <h1 className="text-3xl font-bold mb-8">Información de Envíos</h1>
            <div className="prose prose-invert max-w-none">
                <p>Realizamos envíos a todo el país.</p>
                <h3>Métodos de Envío</h3>
                <ul>
                    <li>Correo Argentino</li>
                    <li>Andreani</li>
                    <li>Retiro en Local (CABA)</li>
                </ul>
                <h3>Tiempos de Entrega</h3>
                <p>Los tiempos de entrega varían según tu ubicación, generalmente entre 3 y 7 días hábiles.</p>
            </div>
        </div>
    )
}
