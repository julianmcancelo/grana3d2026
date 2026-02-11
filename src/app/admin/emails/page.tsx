'use client'

import { useState } from 'react'
import { sendTestWelcome, sendTestOrder, sendTestStatus } from './actions'
import Swal from 'sweetalert2'

export default function EmailTester() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAction = async (action: () => Promise<any>, name: string) => {
        if (!email) {
            Swal.fire('Error', 'Ingresa un email válido', 'error')
            return
        }
        setLoading(true)
        try {
            const res = await action()
            if (res.success) {
                Swal.fire('Éxito', res.message, 'success')
            } else {
                Swal.fire('Error', res.message, 'error')
            }
        } catch (e) {
            Swal.fire('Error', 'Error inesperado', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-8">Probador de Correos</h1>

            <div className="mb-8">
                <label className="block mb-2 text-gray-400">Email de destino</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full max-w-md p-3 bg-[#111] border border-[#222] rounded-lg text-white"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bienvenida */}
                <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
                    <h3 className="text-xl font-semibold mb-4 text-[#00AE42]">Bienvenida</h3>
                    <p className="text-gray-400 text-sm mb-4">Envía el correo de registro exitoso con cupón.</p>
                    <button
                        onClick={() => handleAction(() => sendTestWelcome(email), 'Bienvenida')}
                        disabled={loading}
                        className="w-full p-2 bg-[#222] hover:bg-[#333] rounded-lg transition-colors border border-[#333]"
                    >
                        Probar Bienvenida
                    </button>
                </div>

                {/* Pedidos */}
                <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">Pedidos (Confirmación)</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleAction(() => sendTestOrder(email, 'MERCADOPAGO'), 'MP')}
                            disabled={loading}
                            className="w-full p-2 bg-[#222] hover:bg-[#333] rounded-lg transition-colors border border-[#333] flex justify-between px-4"
                        >
                            <span>Mercado Pago</span>
                            <span className="text-xs bg-blue-900/50 text-blue-400 px-2 py-1 rounded">Incluye Link</span>
                        </button>
                        <button
                            onClick={() => handleAction(() => sendTestOrder(email, 'TRANSFERENCIA'), 'Transferencia')}
                            disabled={loading}
                            className="w-full p-2 bg-[#222] hover:bg-[#333] rounded-lg transition-colors border border-[#333] flex justify-between px-4"
                        >
                            <span>Transferencia</span>
                            <span className="text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">Datos Banco</span>
                        </button>
                    </div>
                </div>

                {/* Estados */}
                <div className="bg-[#111] p-6 rounded-xl border border-[#222]">
                    <h3 className="text-xl font-semibold mb-4 text-purple-400">Estados de Pedido</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['PAGADO', 'EN_PROCESO', 'ENVIADO', 'ENTREGADO'].map(status => (
                            <button
                                key={status}
                                onClick={() => handleAction(() => sendTestStatus(email, status), status)}
                                disabled={loading}
                                className="p-2 bg-[#222] hover:bg-[#333] rounded-lg text-xs"
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
