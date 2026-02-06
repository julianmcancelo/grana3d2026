"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Plus, Edit2, Trash2, Image as ImageIcon,
    Eye, EyeOff, X, Loader2, GripVertical, Save,
    ExternalLink, Palette, ArrowRight, Monitor
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'
import ImageUpload from '@/components/admin/ImageUpload'

interface Banner {
    id: string
    titulo: string
    subtitulo?: string
    descripcion?: string
    imagen: string
    textoBoton?: string
    linkBoton?: string
    colorTexto?: string
    colorOverlay?: string
    orden: number
    activo: boolean
}

// Colores predefinidos para overlay
const overlayColors = [
    { id: 'none', label: 'Sin overlay', value: '' },
    { id: 'dark', label: 'Oscuro', value: 'rgba(0,0,0,0.5)' },
    { id: 'darker', label: 'Muy oscuro', value: 'rgba(0,0,0,0.7)' },
    { id: 'teal', label: 'Teal', value: 'rgba(20,184,166,0.4)' },
    { id: 'blue', label: 'Azul', value: 'rgba(59,130,246,0.4)' },
    { id: 'purple', label: 'Púrpura', value: 'rgba(139,92,246,0.4)' },
]

export default function BannersAdmin() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Banner | null>(null)
    const [guardando, setGuardando] = useState(false)
    const [previewAbierto, setPreviewAbierto] = useState(false)

    const [form, setForm] = useState({
        titulo: '',
        subtitulo: '',
        descripcion: '',
        imagen: '',
        textoBoton: '',
        linkBoton: '',
        colorTexto: '#ffffff',
        colorOverlay: 'rgba(0,0,0,0.5)',
        activo: true
    })

    useEffect(() => {
        cargarBanners()
    }, [])

    const cargarBanners = async () => {
        try {
            const { data } = await api.get('/admin/banners')
            setBanners((data.banners || data || []).sort((a: Banner, b: Banner) => a.orden - b.orden))
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const abrirModal = (banner?: Banner) => {
        if (banner) {
            setEditando(banner)
            setForm({
                titulo: banner.titulo,
                subtitulo: banner.subtitulo || '',
                descripcion: banner.descripcion || '',
                imagen: banner.imagen,
                textoBoton: banner.textoBoton || '',
                linkBoton: banner.linkBoton || '',
                colorTexto: banner.colorTexto || '#ffffff',
                colorOverlay: banner.colorOverlay || 'rgba(0,0,0,0.5)',
                activo: banner.activo
            })
        } else {
            setEditando(null)
            setForm({ titulo: '', subtitulo: '', descripcion: '', imagen: '', textoBoton: '', linkBoton: '', colorTexto: '#ffffff', colorOverlay: 'rgba(0,0,0,0.5)', activo: true })
        }
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setEditando(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setGuardando(true)

        try {
            if (editando) {
                await api.put(`/admin/banners/${editando.id}`, form)
                setBanners(prev => prev.map(b => b.id === editando.id ? { ...b, ...form } : b))
            } else {
                const { data } = await api.post('/admin/banners', form)
                setBanners(prev => [...prev, data])
            }
            cerrarModal()
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: editando ? 'Banner actualizado' : 'Banner creado',
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937',
                color: '#fff'
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar banner?',
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
                await api.delete(`/admin/banners/${id}`)
                setBanners(prev => prev.filter(b => b.id !== id))
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const toggleActivo = async (banner: Banner) => {
        try {
            await api.put(`/admin/banners/${banner.id}`, { activo: !banner.activo })
            setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, activo: !b.activo } : b))
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const guardarOrden = async (newOrder: Banner[]) => {
        setBanners(newOrder)
        try {
            await Promise.all(newOrder.map((banner, i) =>
                api.put(`/admin/banners/${banner.id}`, { orden: i })
            ))
        } catch (error) {
            console.error('Error guardando orden:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Banners</h1>
                    <p className="text-gray-400 mt-1">{banners.length} banners · Arrastrá para reordenar</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Banner
                </button>
            </div>

            {/* Lista */}
            {banners.length === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
                    <ImageIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay banners</h3>
                    <p className="text-gray-400 mb-6">Creá tu primer banner para el carousel principal</p>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl"
                    >
                        Crear banner
                    </button>
                </div>
            ) : (
                <Reorder.Group axis="y" values={banners} onReorder={guardarOrden} className="space-y-3">
                    {banners.map((banner) => (
                        <Reorder.Item
                            key={banner.id}
                            value={banner}
                            className={`group bg-gray-800 rounded-2xl overflow-hidden border cursor-grab active:cursor-grabbing transition-all ${banner.activo ? 'border-gray-700 hover:border-gray-600' : 'border-gray-800 opacity-60'
                                }`}
                        >
                            <div className="flex items-stretch">
                                {/* Drag Handle + Preview */}
                                <div className="flex items-center gap-2 px-3 bg-gray-900/50">
                                    <GripVertical className="w-5 h-5 text-gray-500" />
                                </div>

                                {/* Preview de imagen con overlay */}
                                <div className="w-56 h-32 relative overflow-hidden shrink-0">
                                    {banner.imagen ? (
                                        <>
                                            <img src={banner.imagen} alt="" className="w-full h-full object-cover" />
                                            {banner.colorOverlay && (
                                                <div
                                                    className="absolute inset-0"
                                                    style={{ backgroundColor: banner.colorOverlay }}
                                                />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                                <div className="text-center" style={{ color: banner.colorTexto || '#fff' }}>
                                                    <p className="font-bold text-sm line-clamp-2">{banner.titulo}</p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}
                                    {!banner.activo && (
                                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                            <span className="text-xs font-bold text-red-400">OCULTO</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 p-4 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{banner.titulo}</h3>
                                        {banner.subtitulo && <p className="text-gray-400 text-sm">{banner.subtitulo}</p>}
                                        <div className="flex items-center gap-3 mt-2">
                                            {banner.textoBoton && (
                                                <span className="px-2 py-1 bg-teal-500/10 text-teal-500 text-xs font-bold rounded">
                                                    {banner.textoBoton}
                                                </span>
                                            )}
                                            {banner.linkBoton && (
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <ExternalLink className="w-3 h-3" /> {banner.linkBoton}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActivo(banner)}
                                            className={`p-2 rounded-lg transition-colors ${banner.activo
                                                    ? 'text-green-500 hover:bg-green-500/10'
                                                    : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                                                }`}
                                        >
                                            {banner.activo ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => abrirModal(banner)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => eliminar(banner.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gray-900 rounded-2xl w-full max-w-4xl border border-gray-700 my-8"
                        >
                            <form onSubmit={handleSubmit}>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                                    <h2 className="text-xl font-bold text-white">
                                        {editando ? 'Editar Banner' : 'Nuevo Banner'}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewAbierto(!previewAbierto)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${previewAbierto ? 'bg-teal-500/20 text-teal-400' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <Monitor className="w-4 h-4" /> Preview
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cerrarModal}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className={`grid ${previewAbierto ? 'grid-cols-2' : 'grid-cols-1'} gap-0`}>
                                    {/* Preview en tiempo real */}
                                    {previewAbierto && (
                                        <div className="border-r border-gray-700 p-6 bg-gray-950">
                                            <div className="aspect-[16/9] rounded-xl overflow-hidden relative bg-gray-800">
                                                {form.imagen ? (
                                                    <>
                                                        <img
                                                            src={form.imagen}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div
                                                            className="absolute inset-0"
                                                            style={{ backgroundColor: form.colorOverlay }}
                                                        />
                                                        <div
                                                            className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                                                            style={{ color: form.colorTexto }}
                                                        >
                                                            {form.subtitulo && (
                                                                <p className="text-sm font-medium uppercase tracking-wider mb-2 opacity-80">
                                                                    {form.subtitulo}
                                                                </p>
                                                            )}
                                                            <h3 className="text-3xl font-black mb-4">
                                                                {form.titulo || 'Título del banner'}
                                                            </h3>
                                                            {form.descripcion && (
                                                                <p className="text-sm mb-6 opacity-80 max-w-md">
                                                                    {form.descripcion}
                                                                </p>
                                                            )}
                                                            {form.textoBoton && (
                                                                <button className="px-6 py-3 bg-teal-500 text-black font-bold rounded-full flex items-center gap-2">
                                                                    {form.textoBoton} <ArrowRight className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <div className="text-center text-gray-500">
                                                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                                            <p className="text-sm">Agregá una imagen</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Form */}
                                    <div className="p-6 space-y-5">
                                        {/* Imagen */}
                                        <ImageUpload
                                            value={form.imagen}
                                            onChange={(url) => setForm({ ...form, imagen: Array.isArray(url) ? url[0] : url })}
                                            label="Imagen del Banner"
                                        />

                                        {/* Título y Subtítulo */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Título *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={form.titulo}
                                                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Subtítulo</label>
                                                <input
                                                    type="text"
                                                    value={form.subtitulo}
                                                    onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
                                            <textarea
                                                rows={2}
                                                value={form.descripcion}
                                                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                            />
                                        </div>

                                        {/* Colores */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                                    <Palette className="w-4 h-4" /> Color de texto
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={form.colorTexto}
                                                        onChange={(e) => setForm({ ...form, colorTexto: e.target.value })}
                                                        className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-700"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={form.colorTexto}
                                                        onChange={(e) => setForm({ ...form, colorTexto: e.target.value })}
                                                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Overlay</label>
                                                <select
                                                    value={form.colorOverlay}
                                                    onChange={(e) => setForm({ ...form, colorOverlay: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                >
                                                    {overlayColors.map(c => (
                                                        <option key={c.id} value={c.value}>{c.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Botón */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Texto del botón</label>
                                                <input
                                                    type="text"
                                                    value={form.textoBoton}
                                                    onChange={(e) => setForm({ ...form, textoBoton: e.target.value })}
                                                    placeholder="Ver más"
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Link del botón</label>
                                                <input
                                                    type="text"
                                                    value={form.linkBoton}
                                                    onChange={(e) => setForm({ ...form, linkBoton: e.target.value })}
                                                    placeholder="/tienda"
                                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Activo */}
                                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/50 rounded-xl border border-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={form.activo}
                                                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                                className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-teal-500"
                                            />
                                            <span className="text-gray-300">Banner activo (visible en el sitio)</span>
                                        </label>
                                    </div>
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
                                        disabled={guardando || !form.titulo || !form.imagen}
                                        className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editando ? 'Guardar' : 'Crear Banner'}
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
