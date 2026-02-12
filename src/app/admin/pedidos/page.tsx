"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingBag, Search, Eye, Clock, Truck,
    CheckCircle, XCircle, Package, ChevronDown, X, Loader2, Gift,
    Plus, Globe, Store, Instagram // Icons for Origins
} from 'lucide-react'
import api from '@/lib/api'
import ModalQR from '@/components/admin/ModalQR'
import ModalNuevoPedido from '@/components/admin/ModalNuevoPedido'
import Swal from 'sweetalert2'

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
    origen?: 'WEB' | 'MERCADOLIBRE' | 'INSTAGRAM' | 'LOCAL'
    items: any[]
    createdAt: string
    codigoSeguimiento?: string
    empresaEnvio?: string
}

const estadoColores: Record<string, { bg: string, text: string, icon: any }> = {
    PENDIENTE: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', icon: Clock },
    CONFIRMADO: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: CheckCircle },
    ENVIADO: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Truck },
    ENTREGADO: { bg: 'bg-green-500/10', text: 'text-green-500', icon: CheckCircle },
    CANCELADO: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle },
}

const estados = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

const formatoEstado = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
}

export default function PedidosAdmin() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroEstado, setFiltroEstado] = useState<string>('')
    const [search, setSearch] = useState('')
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null)
    const [actualizando, setActualizando] = useState<string | null>(null)
    const [qrModal, setQrModal] = useState<{ abierto: boolean; codigo: string; mensaje?: string }>({ abierto: false, codigo: '' })
    const [modalNuevoPedido, setModalNuevoPedido] = useState(false)
    const [trackingForm, setTrackingForm] = useState<{ codigoSeguimiento: string; empresaEnvio: string }>({ codigoSeguimiento: '', empresaEnvio: '' })
    const [guardandoTracking, setGuardandoTracking] = useState(false)

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

    const guardarTracking = async (pedidoId: string) => {
        setGuardandoTracking(true)
        try {
            await api.put(`/admin/pedidos/${pedidoId}`, {
                estado: 'ENVIADO',
                codigoSeguimiento: trackingForm.codigoSeguimiento,
                empresaEnvio: trackingForm.empresaEnvio
            })
            await cargarPedidos()
            // Update the modal selection too
            if (pedidoSeleccionado?.id === pedidoId) {
                setPedidoSeleccionado(prev => prev ? {
                    ...prev,
                    estado: 'ENVIADO',
                    codigoSeguimiento: trackingForm.codigoSeguimiento,
                    empresaEnvio: trackingForm.empresaEnvio
                } : null)
            }
            Swal.fire({ icon: 'success', title: 'Tracking guardado', text: 'Se envió un email al cliente con el código de seguimiento.', timer: 3000 })
        } catch (error) {
            console.error('Error guardando tracking:', error)
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el tracking' })
        } finally {
            setGuardandoTracking(false)
        }
    }

    const generarCuponRegalo = async (pedido: Pedido) => {
        try {
            const codigo = `REGALO-${pedido.numero}`
            // Verificar si ya existe o crearlo.
            try {
                await api.post('/admin/cupones', {
                    codigo,
                    descripcion: `Regalo por compra #${pedido.numero}`,
                    tipo: 'PORCENTAJE',
                    valor: 10,
                    minimoCompra: 0,
                    maximoDescuento: 0,
                    usosMaximos: 1,
                    usosPorUsuario: 1,
                    fechaInicio: new Date().toISOString().split('T')[0],
                    activo: true
                })
                Swal.fire({
                    icon: 'success',
                    title: '¡Cupón Creado!',
                    text: `Se generó el cupón ${codigo} (10% OFF)`,
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1f2937', color: '#fff'
                })
            } catch (e: any) {
                console.log('El cupón quizás ya existe', e)
            }

            setQrModal({
                abierto: true,
                codigo,
                mensaje: `Cupón de regalo para ${pedido.nombreCliente}`
            })

        } catch (error) {
            console.error(error)
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el cupón' })
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
                <button
                    onClick={() => setModalNuevoPedido(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Pedido
                </button>
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
                                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex flex-col items-center justify-center font-bold text-gray-500 relative overflow-hidden">
                                        <span className="z-10">#{pedido.numero}</span>
                                        {/* Origin Indicator */}
                                        {pedido.origen && pedido.origen !== 'WEB' && (
                                            <div className="absolute inset-0 opacity-20 z-0 flex items-center justify-center">
                                                {pedido.origen === 'MERCADOLIBRE' && <ShoppingBag className="w-8 h-8 text-yellow-500" />}
                                                {pedido.origen === 'INSTAGRAM' && <Instagram className="w-8 h-8 text-pink-500" />}
                                                {pedido.origen === 'LOCAL' && <Store className="w-8 h-8 text-blue-500" />}
                                            </div>
                                        )}
                                        {pedido.origen === 'MERCADOLIBRE' && <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-bl-lg" title="Mercado Libre" />}
                                        {pedido.origen === 'INSTAGRAM' && <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500 rounded-bl-lg" title="Instagram" />}
                                        {pedido.origen === 'LOCAL' && <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-bl-lg" title="Local" />}
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
                                    {pedido.codigoSeguimiento && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-teal-400 font-mono">
                                            <Truck className="w-3 h-3" />
                                            {pedido.empresaEnvio && <span className="text-gray-500">{pedido.empresaEnvio}:</span>}
                                            {pedido.codigoSeguimiento}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${estadoInfo.bg} ${estadoInfo.text}`}>
                                    <EstadoIcon className="w-3 h-3" />
                                    {formatoEstado(pedido.estado)}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Selector de estado */}
                                    <select
                                        value={pedido.estado}
                                        onChange={(e) => cambiarEstado(pedido.id, e.target.value)}
                                        disabled={actualizando === pedido.id}
                                        className="px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 disabled:opacity-50 cursor-pointer"
                                    >
                                        {estados.map(e => (
                                            <option key={e} value={e}>{formatoEstado(e)}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={() => generarCuponRegalo(pedido)}
                                        className="flex items-center gap-2 px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 rounded-lg text-sm font-bold transition-colors ml-2"
                                        title="Generar regalo"
                                    >
                                        <Gift className="w-4 h-4" />
                                    </button>

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
                                                    <div className="text-sm text-gray-400">
                                                        x{item.cantidad}
                                                        {item.variante && <span className="text-[#00AE42] ml-2 font-bold">• {item.variante}</span>}
                                                    </div>
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

                                {/* Tracking */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                                        <Truck className="w-4 h-4" /> SEGUIMIENTO DE ENVÍO
                                    </h3>
                                    {pedidoSeleccionado.codigoSeguimiento ? (
                                        <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Empresa</span>
                                                <span className="font-bold text-white">{pedidoSeleccionado.empresaEnvio || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-400 text-sm">Código</span>
                                                <span className="font-mono font-bold text-teal-400">{pedidoSeleccionado.codigoSeguimiento}</span>
                                            </div>
                                            <div className="pt-2 border-t border-white/5">
                                                <a
                                                    href={`/seguimiento?codigo=${pedidoSeleccionado.codigoSeguimiento}`}
                                                    target="_blank"
                                                    className="text-xs text-teal-400 hover:underline"
                                                >
                                                    🔗 Ver página pública de seguimiento
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-black/30 p-4 rounded-xl space-y-3">
                                            <select
                                                value={trackingForm.empresaEnvio}
                                                onChange={(e) => setTrackingForm(prev => ({ ...prev, empresaEnvio: e.target.value }))}
                                                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
                                            >
                                                <option value="">Seleccionar empresa...</option>
                                                <option value="Correo Argentino">Correo Argentino</option>
                                                <option value="Andreani">Andreani</option>
                                                <option value="OCA">OCA</option>
                                                <option value="Via Cargo">Vía Cargo</option>
                                                <option value="Cruz del Sur">Cruz del Sur</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                            <input
                                                type="text"
                                                placeholder="Código de seguimiento..."
                                                value={trackingForm.codigoSeguimiento}
                                                onChange={(e) => setTrackingForm(prev => ({ ...prev, codigoSeguimiento: e.target.value }))}
                                                className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 font-mono"
                                            />
                                            <button
                                                onClick={() => guardarTracking(pedidoSeleccionado.id)}
                                                disabled={!trackingForm.codigoSeguimiento || guardandoTracking}
                                                className="w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                                            >
                                                {guardandoTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                                                {guardandoTracking ? 'Guardando...' : 'Guardar y Notificar Cliente'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Modal QR */}
            <ModalQR
                isOpen={qrModal.abierto}
                onClose={() => setQrModal({ ...qrModal, abierto: false })}
                codigo={qrModal.codigo}
                titulo="¡Premio para Cliente!"
                mensaje={qrModal.mensaje}
            />

            <ModalNuevoPedido
                isOpen={modalNuevoPedido}
                onClose={() => setModalNuevoPedido(false)}
                onSuccess={() => {
                    cargarPedidos()
                    setModalNuevoPedido(false)
                }}
            />
        </div>
    )
}
