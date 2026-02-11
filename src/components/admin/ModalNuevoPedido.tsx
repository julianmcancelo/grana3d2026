"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Save, Loader2, ShoppingBag, Globe, Instagram, Store } from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface ModalNuevoPedidoProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ModalNuevoPedido({ isOpen, onClose, onSuccess }: ModalNuevoPedidoProps) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        nombreCliente: '',
        emailCliente: '',
        telefonoCliente: '',
        origen: 'LOCAL',
        metodoPago: 'EFECTIVO',
        metodoEnvio: 'RETIRO_LOCAL',
        estado: 'CONFIRMADO'
    })

    const [items, setItems] = useState<{ nombre: string; precio: number; cantidad: number; variante?: string }[]>([
        { nombre: '', precio: 0, cantidad: 1, variante: '' }
    ])

    const agregarItem = () => {
        setItems([...items, { nombre: '', precio: 0, cantidad: 1, variante: '' }])
    }

    const eliminarItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!form.nombreCliente) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'El nombre del cliente es obligatorio' })
            setLoading(false)
            return
        }

        const itemsValidos = items.filter(i => i.nombre && i.precio > 0)
        if (itemsValidos.length === 0) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Debes agregar al menos un producto válido' })
            setLoading(false)
            return
        }

        try {
            await api.post('/admin/pedidos', {
                ...form,
                items: itemsValidos,
                total
            })

            Swal.fire({
                icon: 'success',
                title: 'Pedido Creado',
                showConfirmButton: false,
                timer: 1500,
                background: '#1f2937', color: '#fff'
            })
            onSuccess()
            onClose()
            // Reset form
            setForm({
                nombreCliente: '',
                emailCliente: '',
                telefonoCliente: '',
                origen: 'LOCAL',
                metodoPago: 'EFECTIVO',
                metodoEnvio: 'RETIRO_LOCAL',
                estado: 'CONFIRMADO'
            })
            setItems([{ nombre: '', precio: 0, cantidad: 1, variante: '' }])

        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el pedido',
                background: '#1f2937', color: '#fff'
            })
        } finally {
            setLoading(false)
        }
    }

    const origenes = [
        { id: 'LOCAL', icon: Store, label: 'Local / Mostrador', color: 'text-blue-400' },
        { id: 'MERCADOLIBRE', icon: ShoppingBag, label: 'Mercado Libre', color: 'text-yellow-400' },
        { id: 'INSTAGRAM', icon: Instagram, label: 'Instagram', color: 'text-pink-400' },
        { id: 'WEB', icon: Globe, label: 'Web Manual', color: 'text-teal-400' },
    ]

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 shadow-2xl"
                    >
                        <form onSubmit={handleSubmit}>
                            <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                                <h2 className="text-xl font-bold text-white">Nuevo Pedido Manual</h2>
                                <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Origen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-3">Origen del Pedido</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {origenes.map((origen) => (
                                            <button
                                                key={origen.id}
                                                type="button"
                                                onClick={() => setForm({ ...form, origen: origen.id })}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${form.origen === origen.id
                                                    ? 'border-teal-500 bg-teal-500/10'
                                                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                                    }`}
                                            >
                                                <origen.icon className={`w-6 h-6 ${form.origen === origen.id ? origen.color : 'text-gray-500'}`} />
                                                <span className={`text-xs font-bold ${form.origen === origen.id ? 'text-white' : 'text-gray-500'}`}>
                                                    {origen.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Cliente *</label>
                                        <input
                                            required
                                            value={form.nombreCliente}
                                            onChange={e => setForm({ ...form, nombreCliente: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 outline-none"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email / Contacto</label>
                                        <input
                                            value={form.emailCliente}
                                            onChange={e => setForm({ ...form, emailCliente: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-teal-500 outline-none"
                                            placeholder="juan@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-medium text-gray-400">Productos</label>
                                        <button
                                            type="button"
                                            onClick={agregarItem}
                                            className="text-xs flex items-center gap-1 text-teal-400 hover:text-teal-300 font-bold"
                                        >
                                            <Plus size={14} /> Agregar Item
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {items.map((item, i) => (
                                            <div key={i} className="flex gap-2 items-start flex-wrap sm:flex-nowrap border-b border-gray-700/50 pb-3 mb-3">
                                                <div className="flex-1 min-w-[150px] space-y-2">
                                                    <input
                                                        placeholder="Producto..."
                                                        value={item.nombre}
                                                        onChange={e => updateItem(i, 'nombre', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 outline-none"
                                                    />
                                                    <input
                                                        placeholder="Variante (ej: Color: Rojo)"
                                                        value={item.variante || ''}
                                                        onChange={e => updateItem(i, 'variante', e.target.value)}
                                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 focus:border-teal-500 outline-none"
                                                    />
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="$"
                                                    value={item.precio || ''}
                                                    onChange={e => updateItem(i, 'precio', parseFloat(e.target.value))}
                                                    className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 outline-none"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Cant"
                                                    value={item.cantidad}
                                                    onChange={e => updateItem(i, 'cantidad', parseInt(e.target.value))}
                                                    className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:border-teal-500 outline-none"
                                                />
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => eliminarItem(i)}
                                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totales y Estado */}
                                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                                    <div>
                                        <div className="text-gray-400 text-sm">Estado Inicial:</div>
                                        <select
                                            value={form.estado}
                                            onChange={e => setForm({ ...form, estado: e.target.value })}
                                            className="bg-transparent text-white font-bold outline-none cursor-pointer hover:text-teal-400"
                                        >
                                            <option value="PENDIENTE" className="bg-gray-900">Pendiente</option>
                                            <option value="CONFIRMADO" className="bg-gray-900">Confirmado</option>
                                            <option value="ENTREGADO" className="bg-gray-900">Entregado</option>
                                        </select>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-400 text-sm">Total</div>
                                        <div className="text-2xl font-black text-teal-400">${total.toLocaleString('es-AR')}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-gray-700 sticky bottom-0 bg-gray-900 z-10">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 border border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Crear Pedido
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
