"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Edit2, Trash2, Eye, EyeOff, X, Loader2, Save,
    Ticket, Percent, DollarSign, Truck, Calendar, Users,
    Copy, Check, Search, Filter, Tag, BarChart3, QrCode as QrIcon
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'
import ModalQR from '@/components/admin/ModalQR'

interface Cupon {
    id: string
    codigo: string
    descripcion?: string
    tipo: 'PORCENTAJE' | 'FIJO' | 'ENVIO_GRATIS'
    valor: number
    minimoCompra?: number
    maximoDescuento?: number
    usosMaximos?: number
    usosPorUsuario: number
    usosActuales: number
    fechaInicio: string
    fechaFin?: string
    activo: boolean
    aplicaA: 'TODO' | 'CATEGORIAS' | 'PRODUCTOS'
    _count?: { UsoCupon: number }
}

const tiposCupon = [
    { id: 'PORCENTAJE', label: 'Porcentaje', icon: Percent, desc: 'Ej: 20% OFF' },
    { id: 'FIJO', label: 'Monto Fijo', icon: DollarSign, desc: 'Ej: $500 OFF' },
    { id: 'ENVIO_GRATIS', label: 'Envío Gratis', icon: Truck, desc: 'Sin costo de envío' },
]

export default function CuponesAdmin() {
    const [cupones, setCupones] = useState<Cupon[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Cupon | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [copiado, setCopiado] = useState<string | null>(null)

    const [qrModal, setQrModal] = useState<{ abierto: boolean; codigo: string }>({ abierto: false, codigo: '' })

    const [form, setForm] = useState({
        codigo: '',
        descripcion: '',
        tipo: 'PORCENTAJE' as 'PORCENTAJE' | 'FIJO' | 'ENVIO_GRATIS',
        valor: '',
        minimoCompra: '',
        maximoDescuento: '',
        usosMaximos: '100',
        usosPorUsuario: '1',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        activo: true
    })

    useEffect(() => {
        cargarCupones()
    }, [])

    const cargarCupones = async () => {
        try {
            const { data } = await api.get('/admin/cupones')
            setCupones(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const generarCodigo = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let codigo = ''
        for (let i = 0; i < 8; i++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setForm(prev => ({ ...prev, codigo }))
    }

    const abrirModal = (cupon?: Cupon) => {
        if (cupon) {
            setEditando(cupon)
            setForm({
                codigo: cupon.codigo,
                descripcion: cupon.descripcion || '',
                tipo: cupon.tipo,
                valor: cupon.valor.toString(),
                minimoCompra: cupon.minimoCompra?.toString() || '',
                maximoDescuento: cupon.maximoDescuento?.toString() || '',
                usosMaximos: cupon.usosMaximos?.toString() || '',
                usosPorUsuario: cupon.usosPorUsuario.toString(),
                fechaInicio: cupon.fechaInicio.split('T')[0],
                fechaFin: cupon.fechaFin?.split('T')[0] || '',
                activo: cupon.activo
            })
        } else {
            setEditando(null)
            setForm({
                codigo: '',
                descripcion: '',
                tipo: 'PORCENTAJE',
                valor: '',
                minimoCompra: '',
                maximoDescuento: '',
                usosMaximos: '',
                usosPorUsuario: '1',
                fechaInicio: new Date().toISOString().split('T')[0],
                fechaFin: '',
                activo: true
            })
        }
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setEditando(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const payload = {
                ...form,
                valor: parseFloat(form.valor) || 0,
                minimoCompra: parseFloat(form.minimoCompra) || 0,
                maximoDescuento: parseFloat(form.maximoDescuento) || 0,
                usosMaximos: parseInt(form.usosMaximos) || 0,
                usosPorUsuario: parseInt(form.usosPorUsuario) || 1
            }

            if (editando) {
                await api.put(`/admin/cupones/${editando.id}`, payload)
                setCupones(prev => prev.map(c =>
                    c.id === editando.id ? { ...c, ...payload } : c
                ))
            } else {
                const { data } = await api.post('/admin/cupones', payload)
                setCupones(prev => [data, ...prev])
            }
            cerrarModal()
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: editando ? 'Cupón actualizado' : 'Cupón creado',
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937',
                color: '#fff'
            })
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.error || 'Error al guardar',
                background: '#1f2937',
                color: '#fff'
            })
        } finally {
            setSaving(false)
        }
    }

    const toggleActivo = async (cupon: Cupon) => {
        try {
            await api.put(`/admin/cupones/${cupon.id}`, { activo: !cupon.activo })
            setCupones(prev => prev.map(c =>
                c.id === cupon.id ? { ...c, activo: !c.activo } : c
            ))
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const eliminar = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar cupón?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/cupones/${id}`)
                setCupones(prev => prev.filter(c => c.id !== id))
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const copiarCodigo = (codigo: string) => {
        navigator.clipboard.writeText(codigo)
        setCopiado(codigo)
        setTimeout(() => setCopiado(null), 2000)
    }

    const cuponesFiltrados = cupones.filter(c =>
        c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
    )

    const estaVigente = (cupon: Cupon) => {
        const ahora = new Date()
        const inicio = new Date(cupon.fechaInicio)
        const fin = cupon.fechaFin ? new Date(cupon.fechaFin) : null
        return cupon.activo && inicio <= ahora && (!fin || fin >= ahora)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Cupones</h1>
                    <p className="text-gray-400 mt-1">{cupones.length} cupones · {cupones.filter(c => c.activo).length} activos</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar cupón..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 w-64"
                        />
                    </div>
                    <button
                        onClick={() => abrirModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Cupón
                    </button>
                </div>
            </div>

            {/* Grid de Cupones */}
            {cuponesFiltrados.length === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
                    <Ticket className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay cupones</h3>
                    <p className="text-gray-400 mb-6">Creá tu primer cupón de descuento</p>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl"
                    >
                        Crear cupón
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cuponesFiltrados.map((cupon) => {
                        const vigente = estaVigente(cupon)
                        const tipoInfo = tiposCupon.find(t => t.id === cupon.tipo)
                        const TipoIcon = tipoInfo?.icon || Ticket

                        return (
                            <motion.div
                                key={cupon.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative bg-gray-800 rounded-2xl overflow-hidden border transition-all ${vigente ? 'border-gray-700' : 'border-gray-800 opacity-60'
                                    }`}
                            >
                                {/* Header con tipo */}
                                <div className={`p-4 ${cupon.tipo === 'PORCENTAJE' ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20' :
                                    cupon.tipo === 'FIJO' ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20' :
                                        'bg-gradient-to-r from-blue-600/20 to-cyan-600/20'
                                    }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cupon.tipo === 'PORCENTAJE' ? 'bg-purple-500/20 text-purple-400' :
                                                cupon.tipo === 'FIJO' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                <TipoIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-2xl font-black text-white">
                                                    {cupon.tipo === 'PORCENTAJE' ? `${cupon.valor}%` :
                                                        cupon.tipo === 'FIJO' ? `$${cupon.valor}` :
                                                            'GRATIS'}
                                                </span>
                                                <p className="text-xs text-gray-400">{tipoInfo?.label}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${vigente
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-600/50 text-gray-400'
                                            }`}>
                                            {vigente ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    {/* Código copiable */}
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 px-3 py-2 bg-black rounded-lg font-mono text-lg text-teal-400 tracking-wider">
                                            {cupon.codigo}
                                        </code>
                                        <button
                                            onClick={() => copiarCodigo(cupon.codigo)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            {copiado === cupon.codigo ? (
                                                <Check className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <Copy className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    {cupon.descripcion && (
                                        <p className="text-sm text-gray-400">{cupon.descripcion}</p>
                                    )}

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{cupon.usosActuales}{cupon.usosMaximos ? `/${cupon.usosMaximos}` : ''} usos</span>
                                        </div>
                                        {cupon.minimoCompra && (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Mín ${cupon.minimoCompra}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Fechas */}
                                    {cupon.fechaFin && (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>Hasta {new Date(cupon.fechaFin).toLocaleDateString()}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                                        <button
                                            onClick={() => setQrModal({ abierto: true, codigo: cupon.codigo })}
                                            className="p-2 text-gray-500 hover:text-teal-500 hover:bg-teal-500/10 rounded-lg transition-colors"
                                            title="Ver QR"
                                        >
                                            <QrIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => abrirModal(cupon)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
                                        >
                                            <Edit2 className="w-4 h-4" /> Editar
                                        </button>
                                        <button
                                            onClick={() => toggleActivo(cupon)}
                                            className={`p-2 rounded-lg transition-colors ${cupon.activo
                                                ? 'text-yellow-500 hover:bg-yellow-500/10'
                                                : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                                                }`}
                                        >
                                            {cupon.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => eliminar(cupon.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 my-8"
                        >
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                                    <h2 className="text-xl font-bold text-white">
                                        {editando ? 'Editar Cupón' : 'Nuevo Cupón'}
                                    </h2>
                                    <button type="button" onClick={cerrarModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-5">
                                    {/* Tipo */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Tipo de descuento</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {tiposCupon.map(tipo => (
                                                <button
                                                    key={tipo.id}
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, tipo: tipo.id as any }))}
                                                    className={`p-3 rounded-xl border-2 transition-all text-center ${form.tipo === tipo.id
                                                        ? 'border-teal-500 bg-teal-500/10'
                                                        : 'border-gray-700 hover:border-gray-600'
                                                        }`}
                                                >
                                                    <tipo.icon className={`w-5 h-5 mx-auto mb-1 ${form.tipo === tipo.id ? 'text-teal-400' : 'text-gray-500'}`} />
                                                    <p className="text-sm font-medium text-white">{tipo.label}</p>
                                                    <p className="text-xs text-gray-500">{tipo.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Código */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Código *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                value={form.codigo}
                                                onChange={(e) => setForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                                                placeholder="DESCUENTO20"
                                                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-teal-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={generarCodigo}
                                                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm font-medium text-white transition-colors"
                                            >
                                                Generar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Valor */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                {form.tipo === 'PORCENTAJE' ? 'Porcentaje (%)' : form.tipo === 'FIJO' ? 'Monto ($)' : 'Valor'} *
                                            </label>
                                            <input
                                                type="number"
                                                required={form.tipo !== 'ENVIO_GRATIS'}
                                                value={form.valor}
                                                onChange={(e) => setForm(prev => ({ ...prev, valor: e.target.value }))}
                                                placeholder={form.tipo === 'PORCENTAJE' ? '20' : '500'}
                                                disabled={form.tipo === 'ENVIO_GRATIS'}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Mínimo de compra ($)</label>
                                            <input
                                                type="number"
                                                value={form.minimoCompra}
                                                onChange={(e) => setForm(prev => ({ ...prev, minimoCompra: e.target.value }))}
                                                placeholder="5000"
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Límites */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Usos máximos</label>
                                            <input
                                                type="number"
                                                value={form.usosMaximos}
                                                onChange={(e) => setForm(prev => ({ ...prev, usosMaximos: e.target.value }))}
                                                placeholder="Ilimitado"
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        {form.tipo === 'PORCENTAJE' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Descuento máximo ($)</label>
                                                <input
                                                    type="number"
                                                    value={form.maximoDescuento}
                                                    onChange={(e) => setForm(prev => ({ ...prev, maximoDescuento: e.target.value }))}
                                                    placeholder="Sin límite"
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha inicio</label>
                                            <input
                                                type="date"
                                                value={form.fechaInicio}
                                                onChange={(e) => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Fecha fin</label>
                                            <input
                                                type="date"
                                                value={form.fechaFin}
                                                onChange={(e) => setForm(prev => ({ ...prev, fechaFin: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Descripción (interna)</label>
                                        <input
                                            type="text"
                                            value={form.descripcion}
                                            onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            placeholder="Campaña de verano..."
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    {/* Activo */}
                                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={form.activo}
                                            onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-teal-500"
                                        />
                                        <span className="text-gray-300">Cupón activo</span>
                                    </label>
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 p-6 border-t border-gray-700">
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        className="flex-1 py-3 border border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || !form.codigo || (!form.valor && form.tipo !== 'ENVIO_GRATIS')}
                                        className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editando ? 'Guardar' : 'Crear Cupón'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <ModalQR
                isOpen={qrModal.abierto}
                onClose={() => setQrModal({ ...qrModal, abierto: false })}
                codigo={qrModal.codigo}
            />
        </div>
    )
}
