"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Edit2, Trash2, Image as ImageIcon,
    Eye, EyeOff, X, Loader2, MoveUp, MoveDown
} from 'lucide-react'
import api from '@/lib/api'

interface Banner {
    id: string
    titulo: string
    subtitulo?: string
    descripcion?: string
    imagen: string
    textoBoton?: string
    linkBoton?: string
    orden: number
    activo: boolean
}

export default function BannersAdmin() {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Banner | null>(null)
    const [guardando, setGuardando] = useState(false)

    const [form, setForm] = useState({
        titulo: '',
        subtitulo: '',
        descripcion: '',
        imagen: '',
        textoBoton: '',
        linkBoton: '',
        activo: true
    })

    useEffect(() => {
        cargarBanners()
    }, [])

    const cargarBanners = async () => {
        try {
            const { data } = await api.get('/admin/banners')
            setBanners(data.banners || data || [])
        } catch (error) {
            console.error('Error cargando banners:', error)
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
                activo: banner.activo
            })
        } else {
            setEditando(null)
            setForm({ titulo: '', subtitulo: '', descripcion: '', imagen: '', textoBoton: '', linkBoton: '', activo: true })
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
            } else {
                await api.post('/admin/banners', form)
            }
            cerrarModal()
            cargarBanners()
        } catch (error) {
            console.error('Error guardando:', error)
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id: string) => {
        if (!confirm('¿Eliminar este banner?')) return
        try {
            await api.delete(`/admin/banners/${id}`)
            cargarBanners()
        } catch (error) {
            console.error('Error eliminando:', error)
        }
    }

    const toggleActivo = async (banner: Banner) => {
        try {
            await api.put(`/admin/banners/${banner.id}`, { activo: !banner.activo })
            cargarBanners()
        } catch (error) {
            console.error('Error actualizando:', error)
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
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Banners</h1>
                    <p className="text-gray-400">{banners.length} banners configurados</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Banner
                </button>
            </div>

            {/* Lista de banners */}
            <div className="space-y-4">
                {banners.map((banner, index) => (
                    <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-stretch">
                            {/* Preview de imagen */}
                            <div className="w-48 h-32 bg-gray-800 shrink-0 relative overflow-hidden">
                                {banner.imagen ? (
                                    <img src={banner.imagen} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-600" />
                                    </div>
                                )}
                                {!banner.activo && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-xs font-bold text-red-500">OCULTO</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white text-lg">{banner.titulo}</h3>
                                    {banner.subtitulo && <p className="text-gray-400 text-sm">{banner.subtitulo}</p>}
                                    {banner.textoBoton && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-teal-500/10 text-teal-500 text-xs font-bold rounded">
                                            {banner.textoBoton}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActivo(banner)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${banner.activo
                                                ? 'bg-green-500/10 text-green-500'
                                                : 'bg-red-500/10 text-red-500'
                                            }`}
                                    >
                                        {banner.activo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    </button>
                                    <button
                                        onClick={() => abrirModal(banner)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => eliminar(banner.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {banners.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-900 border border-white/10 rounded-2xl">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay banners</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modalAbierto && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={cerrarModal}
                            className="fixed inset-0 bg-black/80 z-50"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between p-6 border-b border-white/10">
                                    <h2 className="text-xl font-bold">{editando ? 'Editar Banner' : 'Nuevo Banner'}</h2>
                                    <button onClick={cerrarModal} className="p-2 hover:bg-white/10 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Título *</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.titulo}
                                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Subtítulo</label>
                                        <input
                                            type="text"
                                            value={form.subtitulo}
                                            onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">URL Imagen *</label>
                                        <input
                                            type="url"
                                            required
                                            value={form.imagen}
                                            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Texto Botón</label>
                                            <input
                                                type="text"
                                                value={form.textoBoton}
                                                onChange={(e) => setForm({ ...form, textoBoton: e.target.value })}
                                                placeholder="Ver más"
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Link Botón</label>
                                            <input
                                                type="text"
                                                value={form.linkBoton}
                                                onChange={(e) => setForm({ ...form, linkBoton: e.target.value })}
                                                placeholder="/tienda"
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.activo}
                                            onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/10 bg-black accent-teal-500"
                                        />
                                        <span className="text-sm text-gray-400">Activo</span>
                                    </label>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={cerrarModal}
                                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={guardando}
                                            className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-black rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {editando ? 'Guardar' : 'Crear'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
