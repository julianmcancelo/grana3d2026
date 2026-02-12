"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Truck, Clock, CheckCircle, XCircle, MapPin, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const estadoInfo: Record<string, { label: string; color: string; bg: string; icon: any; step: number }> = {
    PENDIENTE: { label: 'Pendiente', color: 'text-yellow-500', bg: 'bg-yellow-500', icon: Clock, step: 1 },
    CONFIRMADO: { label: 'Confirmado', color: 'text-blue-500', bg: 'bg-blue-500', icon: CheckCircle, step: 1 },
    PAGADO: { label: 'Pago Confirmado', color: 'text-blue-400', bg: 'bg-blue-400', icon: CheckCircle, step: 1 },
    EN_PROCESO: { label: 'En Producción', color: 'text-purple-500', bg: 'bg-purple-500', icon: Package, step: 2 },
    ENVIADO: { label: 'En Camino', color: 'text-teal-400', bg: 'bg-teal-400', icon: Truck, step: 3 },
    ENTREGADO: { label: 'Entregado', color: 'text-green-500', bg: 'bg-green-500', icon: CheckCircle, step: 4 },
    CANCELADO: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-500', icon: XCircle, step: 0 },
}

const pasos = [
    { label: 'Confirmado', icon: CheckCircle },
    { label: 'En Producción', icon: Package },
    { label: 'En Camino', icon: Truck },
    { label: 'Entregado', icon: MapPin },
]

interface PedidoTracking {
    numero: number
    nombreCliente: string
    estado: string
    metodoEnvio?: string
    codigoSeguimiento?: string
    empresaEnvio?: string
    fechaPedido: string
    ultimaActualizacion: string
}

export default function SeguimientoPage() {
    const [query, setQuery] = useState('')
    const [pedido, setPedido] = useState<PedidoTracking | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const buscar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return
        setLoading(true)
        setError('')
        setPedido(null)

        try {
            // Try by tracking code first, then by order number
            const isNumber = /^\d+$/.test(query.trim())
            const param = isNumber ? `numero=${query.trim()}` : `codigo=${query.trim()}`
            const res = await fetch(`/api/seguimiento?${param}`)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Pedido no encontrado')
            } else {
                setPedido(data.pedido)
            }
        } catch {
            setError('Error al buscar. Intentá de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    const info = pedido ? estadoInfo[pedido.estado] || estadoInfo.PENDIENTE : null
    const currentStep = info?.step || 0

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <div className="border-b border-white/10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold">Seguimiento de Envío</h1>
                        <p className="text-xs text-gray-500">Grana3D</p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Search */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-2xl mb-6">
                        <Truck className="w-8 h-8 text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Rastreá tu pedido</h2>
                    <p className="text-gray-500 text-sm">Ingresá tu número de pedido o código de seguimiento</p>
                </div>

                <form onSubmit={buscar} className="flex gap-3 mb-10">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Ej: 1234 o código de seguimiento..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="px-6 py-3.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
                    </button>
                </form>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12 text-gray-500"
                    >
                        <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500/50" />
                        <p className="text-red-400">{error}</p>
                    </motion.div>
                )}

                {/* Result */}
                <AnimatePresence>
                    {pedido && info && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Status Header Card */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${info.bg}/10 ${info.color} mb-4`}>
                                    <info.icon className="w-4 h-4" />
                                    {info.label}
                                </div>
                                <h3 className="text-xl font-bold mb-1">Pedido #{pedido.numero}</h3>
                                <p className="text-gray-500 text-sm">
                                    Hola {pedido.nombreCliente}, este es el estado de tu pedido
                                </p>
                            </div>

                            {/* Progress Steps */}
                            {pedido.estado !== 'CANCELADO' && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                                    <div className="flex items-center justify-between relative">
                                        {/* Progress bar background */}
                                        <div className="absolute top-5 left-8 right-8 h-0.5 bg-white/10" />
                                        {/* Progress bar filled */}
                                        <div
                                            className="absolute top-5 left-8 h-0.5 bg-teal-500 transition-all duration-500"
                                            style={{ width: `${Math.min(((currentStep - 1) / (pasos.length - 1)) * 100, 100)}%`, maxWidth: 'calc(100% - 64px)' }}
                                        />

                                        {pasos.map((paso, i) => {
                                            const StepIcon = paso.icon
                                            const isActive = currentStep > i
                                            const isCurrent = currentStep === i + 1

                                            return (
                                                <div key={i} className="flex flex-col items-center z-10">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                                            : isCurrent
                                                                ? 'bg-teal-500/20 text-teal-400 ring-2 ring-teal-500'
                                                                : 'bg-white/5 text-gray-600'
                                                        }`}>
                                                        <StepIcon className="w-5 h-5" />
                                                    </div>
                                                    <span className={`text-xs mt-2 font-medium ${isActive || isCurrent ? 'text-teal-400' : 'text-gray-600'}`}>
                                                        {paso.label}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Tracking Info */}
                            {pedido.codigoSeguimiento && (
                                <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6">
                                    <h4 className="text-sm font-bold text-teal-400 mb-4 flex items-center gap-2">
                                        <Truck className="w-4 h-4" /> Información de Seguimiento
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Empresa</div>
                                            <div className="font-bold">{pedido.empresaEnvio || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Código</div>
                                            <div className="font-mono font-bold text-teal-400 text-lg">{pedido.codigoSeguimiento}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-xs text-gray-500 mb-1">Método de envío</div>
                                    <div className="font-bold text-sm">{pedido.metodoEnvio || 'No especificado'}</div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <div className="text-xs text-gray-500 mb-1">Fecha del pedido</div>
                                    <div className="font-bold text-sm">
                                        {new Date(pedido.fechaPedido).toLocaleDateString('es-AR', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
                                    <div className="text-xs text-gray-500 mb-1">Última actualización</div>
                                    <div className="font-bold text-sm">
                                        {new Date(pedido.ultimaActualizacion).toLocaleDateString('es-AR', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Help */}
                            <div className="text-center text-sm text-gray-500 pt-4">
                                <p>¿Tenés alguna consulta? <Link href="/" className="text-teal-400 hover:underline">Contactanos</Link></p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
