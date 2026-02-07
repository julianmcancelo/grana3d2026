export default function ContactoPage() {
    return (
        <div className="container mx-auto px-4 py-12 text-white">
            <h1 className="text-3xl font-bold mb-8">Contacto</h1>
            <div className="grid md:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-2xl font-bold mb-4">¡Hablemos!</h2>
                    <p className="text-gray-300 mb-6">
                        Si tenés alguna duda sobre tu pedido o nuestros productos, no dudes en escribirnos.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-2">
                            <span className="font-bold">Email:</span> contacto@grana3d.com.ar
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold">Instagram:</span> @grana.3d
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="font-bold">WhatsApp:</span> +54 9 11 7163-1886
                        </li>
                    </ul>
                </div>
                <div className="bg-gray-900 p-6 rounded-2xl border border-white/10">
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre</label>
                            <input type="text" className="w-full px-4 py-2 bg-black rounded-lg border border-white/10 focus:border-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="w-full px-4 py-2 bg-black rounded-lg border border-white/10 focus:border-teal-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Mensaje</label>
                            <textarea rows={4} className="w-full px-4 py-2 bg-black rounded-lg border border-white/10 focus:border-teal-500 outline-none"></textarea>
                        </div>
                        <button className="w-full py-3 bg-teal-500 text-black font-bold rounded-lg hover:bg-teal-400 transition-colors">
                            Enviar Mensaje
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
