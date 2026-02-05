"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingBag, Search, Eye, Clock, Truck,
    CheckCircle, XCircle, Package, ChevronDown, X, Loader2
} from 'lucide-react'
import api from '@/lib/api'

interface Pedido {
    id: string
    numero: number
    nombreCliente: string
    emailCliente?: string
    telefonoCliente?: string
    total: number
    estado: string
    metodoPago: string
    metodoEnvio?: string
    items: any[]
    createdAt: string
}

const estadoColores: Record<string, { bg: string, text: string, icon: any }> = {
    PENDIENTE: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock },
    CONFIRMADO: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: CheckCircle },
    ENVIADO: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Truck },
    ENTREGADO: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
    CANCELADO: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
}

const estados = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState<string>('')
    const [search, setSearch] = useState('')
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
    const [actualizando, setActualizando] = useState<string | null>(null)

    useEffect(() => {
        cargarPedidos()
    }, [])

    const cargarPedidos = async () => {
        try {
            const { data } = await api.get('/admin/pedidos')
            setPedidos(data.pedidos || data)
        } catch (error) {
            console.error('Error cargando pedidos:', error)
        } finally {
            setLoading(false)
        }
    }

    const cambiarEstado = async (pedidoId: string, nuevoEstado: string) => {
        setActualizando(pedidoId)
        try {
            await api.put(`/admin/pedidos/${pedidoId}`, { estado: nuevoEstado })
            await cargarPedidos()
        } catch (error) {
            console.error('Error actualizando estado:', error)
        } finally {
            setActualizando(null)
        }
    }

    const pedidosFiltrados = pedidos.filter(p => {
        const matchEstado = !filtroEstado || p.estado === filtroEstado
        const matchSearch = !search ||
            p.nombreCliente.toLowerCase().includes(search.toLowerCase()) ||
            p.numero.toString().includes(search)
        return matchEstado && matchSearch
    })

    const totales = {
        ventas: pedidos.filter(p => p.estado !== 'CANCELADO').reduce((acc, p) => acc + p.total, 0),
        pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
        enviados: pedidos.filter(p => p.estado === 'ENVIADO').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Pedidos</h1>
                    <p className="text-gray-400">{pedidos.length} pedidos en total</p>
                </div>
            </div>

            {/* Stats rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-1">Ventas totales</div>
                    <div className="text-2xl font-bold text-teal-500">${totales.ventas.toLocaleString('es-AR')}</div>
                </div>
                <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-1">Pendientes</div>
                    <div className="text-2xl font-bold text-yellow-500">{totales.pendientes}</div>
                </div>
                <div className="bg-gray-900 border border-white/10 p-6 rounded-2xl">
                    <div className="text-gray-400 text-sm mb-1">En camino</div>
                    <div className="text-2xl font-bold text-purple-500">{totales.enviados}</div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o número..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                    <option value="">Todos los estados</option>
                    {estados.map(e => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
            </div>

            {/* Lista de pedidos */}
            <div className="space-y-4">
                {pedidosFiltrados.map((pedido) => {
                    const estadoInfo = estadoColores[pedido.estado] || estadoColores.PENDIENTE
                    const EstadoIcon = estadoInfo.icon

                    return (
                        <motion.div
                            key={pedido.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center font-bold text-gray-500">
                                        #{pedido.numero}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg">{pedido.nombreCliente}</div>
                                        <div className="text-sm text-gray-400">
                                            {pedido.emailCliente} {pedido.telefonoCliente && `• ${pedido.telefonoCliente}`}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {new Date(pedido.createdAt).toLocaleDateString('es-AR', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-teal-400">${pedido.total.toLocaleString('es-AR')}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {Array.isArray(pedido.items) ? pedido.items.length : 0} producto(s) • {pedido.metodoPago}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${estadoInfo.bg} ${estadoInfo.text}`}>
                                    <EstadoIcon className="w-3 h-3" />
                                    {pedido.estado}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Selector de estado */}
                                    <select
                                        value={pedido.estado}
                                        onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                                        disabled={actualizando === pedido.id}
                                        className="px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
                                    >
                                        {estados.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => setPedidoSeleccionado(pedido)}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                                    >
                                        <Eye className="w-4 h-4" /> Ver detalle
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {pedidosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-900 border border-white/10 rounded-2xl">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay pedidos</p>
                    </div>
                )}
            </div>

            {/* Modal Detalle */}
            <AnimatePresence>
                {pedidoSeleccionado && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPedidoSeleccionado(null)}
                            className="fixed inset-0 bg-black/80 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-900 border-l border-white/10 z-50 overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <h2 className="text-xl font-bold">Pedido #{pedidoSeleccionado.numero}</h2>
                                <button onClick={() => setPedidoSeleccionado(null)} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Cliente */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 mb-3">CLIENTE</h3>
                                    <div className="bg-black/30 p-4 rounded-xl space-y-2">
                                        <div><span className="text-gray-400">Nombre:</span> {pedidoSeleccionado.nombreCliente}</div>
                                        {pedidoSeleccionado.emailCliente && (
                                            <div><span className="text-gray-400">Email:</span> {pedidoSeleccionado.emailCliente}</div>
                                        )}
                                        {pedidoSeleccionado.telefonoCliente && (
                                            <div><span className="text-gray-400">Teléfono:</span> {pedidoSeleccionado.telefonoCliente}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 mb-3">PRODUCTOS</h3>
                                    <div className="space-y-3">
                                        {Array.isArray(pedidoSeleccionado.items) && pedidoSeleccionado.items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 bg-black/30 p-4 rounded-xl">
                                                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">{item.nombre}</div>
                                                    <div className="text-sm text-gray-400">x{item.cantidad}</div>
                                                </div>
                                                <div className="font-bold">${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="bg-teal-500/10 p-4 rounded-xl flex items-center justify-between">
                                    <span className="font-bold text-teal-400">Total</span>
                                    <span className="text-2xl font-bold text-teal-400">${pedidoSeleccionado.total.toLocaleString('es-AR')}</span>
                                </div>

                                {/* Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-black/30 p-4 rounded-xl">
                                        <div className="text-gray-400 mb-1">Método de pago</div>
                                        <div className="font-bold">{pedidoSeleccionado.metodoPago}</div>
                                    </div>
                                    <div className="bg-black/30 p-4 rounded-xl">
                                        <div className="text-gray-400 mb-1">Método de envío</div>
                                        <div className="font-bold">{pedidoSeleccionado.metodoEnvio || 'No especificado'}</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
