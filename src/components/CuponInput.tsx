"use client"
import { useState } from 'react'
import { Ticket, Check, X, Loader2 } from 'lucide-react'

interface CuponInputProps {
    total: number
    onAplicar: (descuento: number, codigo: string | null) => void
}

export default function CuponInput({ total, onAplicar }: CuponInputProps) {
    const [codigo, setCodigo] = useState('')
    const [loading, setLoading] = useState(false)
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', text: string } | null>(null)
    const [cuponAplicado, setCuponAplicado] = useState<string | null>(null)

    const validarCupon = async () => {
        if (!codigo.trim()) return
        setLoading(true)
        setMensaje(null)

        try {
            const res = await fetch('/api/cupones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, total })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Cupón inválido')

            setMensaje({ tipo: 'success', text: data.mensaje })
            setCuponAplicado(data.codigo)
            onAplicar(data.descuentoAplicado, data.codigo)

        } catch (err: any) {
            setMensaje({ tipo: 'error', text: err.message })
            onAplicar(0, null)
            setCuponAplicado(null)
        } finally {
            setLoading(false)
        }
    }

    const quitarCupon = () => {
        setCodigo('')
        setCuponAplicado(null)
        setMensaje(null)
        onAplicar(0, null)
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-teal-600" />
                Cupón de Descuento
            </h2>
            
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    placeholder="Ingresá tu código" 
                    disabled={!!cuponAplicado || loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none uppercase placeholder:normal-case disabled:bg-gray-100 disabled:text-gray-500"
                />
                
                {cuponAplicado ? (
                    <button 
                        onClick={quitarCupon}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Quitar cupón"
                    >
                        <X className="w-5 h-5" />
                    </button>
                ) : (
                    <button 
                        onClick={validarCupon}
                        disabled={!codigo || loading}
                        className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Aplicar'}
                    </button>
                )}
            </div>

            {mensaje && (
                <div className={`mt-3 text-sm flex items-center gap-2 ${mensaje.tipo === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {mensaje.tipo === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {mensaje.text}
                </div>
            )}
        </div>
    )
}

function AlertCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
    )
}
