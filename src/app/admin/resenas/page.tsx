"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Plus, Trash2, Edit2, Star, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Resena {
    id: string
    nombre: string
    texto: string
    rating: number
    imagen: string | null
    activa: boolean
    orden: number
}

export default function AdminResenas() {
    const [resenas, setResenas] = useState<Resena[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editando, setEditando] = useState<Resena | null>(null)
    const [saving, setSaving] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        texto: '',
        rating: 5,
        activa: true
    })

    useEffect(() => {
        cargarResenas()
    }, [])

    const cargarResenas = async () => {
        try {
            const { data } = await api.get('/admin/resenas')
            setResenas(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const abrirModal = (resena?: Resena) => {
        if (resena) {
            setEditando(resena)
            setForm({
                nombre: resena.nombre,
                texto: resena.texto,
                rating: resena.rating,
                activa: resena.activa
            })
        } else {
            setEditando(null)
            setForm({ nombre: '', texto: '', rating: 5, activa: true })
        }
        setModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            if (editando) {
                const { data } = await api.put(`/admin/resenas/${editando.id}`, form)
                setResenas(prev => prev.map(r => r.id === editando.id ? data : r))
            } else {
                const { data } = await api.post('/admin/resenas', form)
                setResenas(prev => [...prev, data])
            }
            setModalOpen(false)
            Swal.fire({
                icon: 'success',
                title: editando ? 'Reseña actualizada' : 'Reseña creada',
                timer: 1500, showConfirmButton: false,
                background: '#1f2937', color: '#fff'
            })
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error al guardar', background: '#1f2937', color: '#fff' })
        } finally {
            setSaving(false)
        }
    }

    const eliminar = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar reseña?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Eliminar',
            background: '#1f2937', color: '#fff'
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/resenas/${id}`)
                setResenas(prev => prev.filter(r => r.id !== id))
            } catch (error) {
                console.error(error)
            }
        }
    }

    const toggleActiva = async (resena: Resena) => {
        try {
            const nuevoEstado = !resena.activa
            await api.put(`/admin/resenas/${resena.id}`, { activa: nuevoEstado })
            setResenas(prev => prev.map(r => r.id === resena.id ? { ...r, activa: nuevoEstado } : r))
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-500" /></div>

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reseñas de Clientes</h1>
                    <p className="text-gray-400">Gestiona los testimonios que aparecen en la home</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus size={20} /> Nueva Reseña
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resenas.map(resena => (
                    <motion.div
                        key={resena.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`bg-gray-900 border rounded-2xl p-6 ${resena.activa ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16}
                                        className={i < resena.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => abrirModal(resena)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => toggleActiva(resena)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-teal-400">
                                    {resena.activa ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button onClick={() => eliminar(resena.id)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-4 line-clamp-3 italic">"{resena.texto}"</p>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500 font-bold text-xs">
                                {resena.nombre.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-white">{resena.nombre}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editando ? 'Editar Reseña' : 'Nueva Reseña'}</h3>
                                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Cliente</label>
                                    <input
                                        required
                                        value={form.nombre}
                                        onChange={e => setForm({ ...form, nombre: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                        placeholder="Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Comentario</label>
                                    <textarea
                                        required
                                        value={form.texto}
                                        onChange={e => setForm({ ...form, texto: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500 h-24 resize-none"
                                        placeholder="Escribe la reseña..."
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Puntuación</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setForm({ ...form, rating: star })}
                                                    className={`p-1 transition-colors ${form.rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}`}
                                                >
                                                    <Star size={24} className={form.rating >= star ? "fill-yellow-500" : ""} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-6">
                                        <input
                                            type="checkbox"
                                            checked={form.activa}
                                            onChange={e => setForm({ ...form, activa: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-600 bg-gray-800 accent-teal-500"
                                        />
                                        <span className="text-gray-300">Visible en web</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 border border-gray-600 rounded-xl font-bold hover:bg-gray-800">Cancelar</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 bg-teal-500 text-black rounded-xl font-bold hover:bg-teal-400 disabled:opacity-50 flex justify-center items-center gap-2">
                                        {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Guardar
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
