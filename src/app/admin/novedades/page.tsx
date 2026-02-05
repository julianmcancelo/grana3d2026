"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Edit2, Trash2, Zap,
    Eye, EyeOff, X, Loader2, Calendar
} from 'lucide-react'
import api from '@/lib/api'

interface Novedad {
    id: string
    titulo: string
    contenido: string
    imagen?: string
    activa: boolean
    fechaPublicacion: string
}

export default function NovedadesAdmin() {
    const [novedades, setNovedades] = useState<Novedad[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Novedad | null>(null)
    const [guardando, setGuardando] = useState(false)

    const [form, setForm] = useState({
        titulo: '',
        contenido: '',
        imagen: '',
        activa: true
    })

    useEffect(() => {
        cargarNovedades()
    }, [])

    const cargarNovedades = async () => {
        try {
            const { data } = await api.get('/admin/novedades')
            setNovedades(data.novedades || data || [])
        } catch (error) {
            console.error('Error cargando novedades:', error)
        } finally {
            setLoading(false)
        }
    }

    const abrirModal = (novedad?: Novedad) => {
        if (novedad) {
            setEditando(novedad)
            setForm({
                titulo: novedad.titulo,
                contenido: novedad.contenido,
                imagen: novedad.imagen || '',
                activa: novedad.activa
            })
        } else {
            setEditando(null)
            setForm({ titulo: '', contenido: '', imagen: '', activa: true })
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
                await api.put(`/admin/novedades/${editando.id}`, form)
            } else {
                await api.post('/admin/novedades', form)
            }
            cerrarModal()
            cargarNovedades()
        } catch (error) {
            console.error('Error guardando:', error)
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (id: string) => {
        if (!confirm('¿Eliminar esta novedad?')) return
        try {
            await api.delete(`/admin/novedades/${id}`)
            cargarNovedades()
        } catch (error) {
            console.error('Error eliminando:', error)
        }
    }

    const toggleActiva = async (novedad: Novedad) => {
        try {
            await api.put(`/admin/novedades/${novedad.id}`, { activa: !novedad.activa })
            cargarNovedades()
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
                    <h1 className="text-3xl font-bold mb-2">Novedades</h1>
                    <p className="text-gray-400">{novedades.length} novedades en total</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nueva Novedad
                </button>
            </div>

            {/* Lista de novedades */}
            <div className="space-y-4">
                {novedades.map((novedad) => (
                    <motion.div
                        key={novedad.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            {novedad.imagen && (
                                <img src={novedad.imagen} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                            )}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{novedad.titulo}</h3>
                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{novedad.contenido}</p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(novedad.fechaPublicacion).toLocaleDateString('es-AR')}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => toggleActiva(novedad)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${novedad.activa
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                }`}
                                        >
                                            {novedad.activa ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                            {novedad.activa ? 'Activa' : 'Oculta'}
                                        </button>
                                        <button
                                            onClick={() => abrirModal(novedad)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => eliminar(novedad.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {novedades.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-900 border border-white/10 rounded-2xl">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay novedades</p>
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
                                    <h2 className="text-xl font-bold">{editando ? 'Editar Novedad' : 'Nueva Novedad'}</h2>
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
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Contenido *</label>
                                        <textarea
                                            required
                                            value={form.contenido}
                                            onChange={(e) => setForm({ ...form, contenido: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">URL Imagen</label>
                                        <input
                                            type="url"
                                            value={form.imagen}
                                            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                                            placeholder="https://..."
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.activa}
                                            onChange={(e) => setForm({ ...form, activa: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/10 bg-black accent-teal-500"
                                        />
                                        <span className="text-sm text-gray-400">Activa</span>
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
