"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Plus, Edit2, Trash2, Eye, EyeOff, X, Loader2, GripVertical, Save,
    MessageCircle, ExternalLink, Palette, Tag
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface PromoBanner {
    id: string
    titulo: string
    descripcion?: string
    etiqueta?: string
    link?: string
    textoBoton?: string
    colorFondo: string
    orden: number
    activo: boolean
}

const gradientOptions = [
    { label: 'Gamer (Indigo/Purple)', value: 'from-indigo-900 to-purple-900' },
    { label: 'Servicio (Gray/Teal)', value: 'from-gray-800 to-gray-900' },
    { label: 'Oferta (Red/Orange)', value: 'from-red-900 to-orange-900' },
    { label: 'Novedad (Emerald/Teal)', value: 'from-emerald-900 to-teal-900' },
    { label: 'Premium (Slate/Black)', value: 'from-slate-900 to-black' },
    { label: 'Blue (Blue/Cyan)', value: 'from-blue-900 to-cyan-900' }
]

export default function PromoBannersAdmin() {
    const [banners, setBanners] = useState<PromoBanner[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<PromoBanner | null>(null)
    const [guardando, setGuardando] = useState(false)

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        etiqueta: '',
        link: '',
        textoBoton: '',
        colorFondo: 'from-gray-800 to-gray-900',
        activo: true
    })

    useEffect(() => {
        cargarBanners()
    }, [])

    const cargarBanners = async () => {
        try {
            const { data } = await api.get('/admin/promobanners')
            setBanners(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const abrirModal = (banner?: PromoBanner) => {
        if (banner) {
            setEditando(banner)
            setForm({
                titulo: banner.titulo,
                descripcion: banner.descripcion || '',
                etiqueta: banner.etiqueta || '',
                link: banner.link || '',
                textoBoton: banner.textoBoton || '',
                colorFondo: banner.colorFondo,
                activo: banner.activo
            })
        } else {
            setEditando(null)
            setForm({
                titulo: '', descripcion: '', etiqueta: 'OFERTA',
                link: '', textoBoton: 'Ver Más',
                colorFondo: 'from-gray-800 to-gray-900', activo: true
            })
        }
        setModalAbierto(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGuardando(true)
        try {
            if (editando) {
                await api.put(`/admin/promobanners/${editando.id}`, form)
            } else {
                await api.post('/admin/promobanners', form)
            }
            await cargarBanners()
            setModalAbierto(false)
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                timer: 1500,
                showConfirmButton: false,
                background: '#1a1a1a',
                color: '#fff'
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el banner'
            })
        } finally {
            setGuardando(false)
        }
    }

    const toggleEstado = async (id: string, estadoActual: boolean) => {
        try {
            await api.put(`/admin/promobanners/${id}`, { activo: !estadoActual })
            cargarBanners()
        } catch (error) {
            console.error(error)
        }
    }

    const eliminarBanner = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            background: '#1a1a1a',
            color: '#fff'
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/promobanners/${id}`)
                cargarBanners()
                Swal.fire({
                    title: 'Eliminado',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#fff'
                })
            } catch (error) {
                console.error(error)
            }
        }
    }

    const guardarOrden = async (nuevosBanners: PromoBanner[]) => {
        setBanners(nuevosBanners) // Actualización optimista
        try {
            await Promise.all(nuevosBanners.map((b, i) =>
                api.put(`/admin/promobanners/${b.id}`, { orden: i + 1 })
            ))
        } catch (error) {
            console.error('Error guardando orden', error)
            cargarBanners() // Revertir si falla
        }
    }

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Banners Promocionales</h1>
                    <p className="text-gray-400">Gestiona los banners secundarios de la tienda</p>
                </div>
                <button onClick={() => abrirModal()} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Banner
                </button>
            </div>

            <Reorder.Group axis="y" values={banners} onReorder={guardarOrden} className="grid gap-4">
                {banners.map((banner) => (
                    <Reorder.Item key={banner.id} value={banner} className="relative bg-gray-900 border border-white/10 rounded-xl overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${banner.colorFondo}`} />

                        <div className="flex items-center p-4 pl-6 gap-6">
                            <div className="cursor-grab active:cursor-grabbing p-2 text-gray-500 hover:text-white">
                                <GripVertical className="w-5 h-5" />
                            </div>

                            <div className={`p-4 rounded-lg bg-gradient-to-r ${banner.colorFondo} flex-shrink-0 w-32 h-20 flex items-center justify-center text-center`}>
                                <span className="text-xs text-white/80 font-bold">{banner.etiqueta}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-white truncate">{banner.titulo}</h3>
                                    {!banner.activo && <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Inactivo</span>}
                                </div>
                                <p className="text-sm text-gray-400 truncate">{banner.descripcion}</p>
                                {banner.link && <div className="flex items-center gap-1 text-xs text-teal-400 mt-1"><ExternalLink className="w-3 h-3" /> {banner.link}</div>}
                            </div>

                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleEstado(banner.id, banner.activo)} className={`p-2 rounded-lg transition-colors ${banner.activo ? 'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                                    {banner.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button onClick={() => abrirModal(banner)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => eliminarBanner(banner.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            <AnimatePresence>
                {modalAbierto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111]">
                                <h2 className="text-xl font-bold text-white">
                                    {editando ? 'Editar Banner' : 'Nuevo Banner'}
                                </h2>
                                <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                                            <input type="text" required value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                                            <textarea rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Etiqueta</label>
                                            <div className="relative">
                                                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                                <input type="text" value={form.etiqueta} onChange={e => setForm({ ...form, etiqueta: e.target.value })} placeholder="Ej: OFERTA, SERVICIO"
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Link de destino</label>
                                            <div className="relative">
                                                <ExternalLink className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                                <input type="text" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="/tienda o https://..."
                                                    className="w-full bg-[#222] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Texto Botón</label>
                                            <input type="text" value={form.textoBoton} onChange={e => setForm({ ...form, textoBoton: e.target.value })}
                                                className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Estilo (Gradiente)</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {gradientOptions.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setForm({ ...form, colorFondo: opt.value })}
                                                        className={`h-10 rounded-lg bg-gradient-to-r ${opt.value} border-2 transition-all ${form.colorFondo === opt.value ? 'border-white scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                                        title={opt.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="text-sm font-medium text-gray-400 mb-4">Vista Previa</h3>
                                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${form.colorFondo} p-8 border border-white/10 shadow-lg`}>
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                        <div className="relative z-10">
                                            {form.etiqueta && (
                                                <span className="inline-block px-3 py-1 rounded bg-white/10 text-xs font-bold text-white/80 mb-4 tracking-wider uppercase">
                                                    {form.etiqueta}
                                                </span>
                                            )}
                                            <h3 className="text-2xl font-bold text-white mb-2">{form.titulo || 'Título del Banner'}</h3>
                                            <p className="text-white/70 mb-6 max-w-xs">{form.descripcion || 'Descripción corta del banner promocional.'}</p>
                                            <span className="px-6 py-3 bg-white text-black font-bold rounded-lg shadow-lg inline-block">
                                                {form.textoBoton || 'Ver Más'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                                    <button type="button" onClick={() => setModalAbierto(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={guardando}
                                        className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
