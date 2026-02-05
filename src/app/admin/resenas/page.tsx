"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Star, Edit2, Trash2, Eye, EyeOff,
    X, Loader2, User, Search
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Resena {
    id: string
    nombre: string
    texto: string
    rating: number
    imagen?: string
    activa: boolean
    orden: number
}

export default function AdminResenas() {
    const [resenas, setResenas] = useState<Resena[]>([])
    const [loading, setLoading] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Resena | null>(null)
    const [busqueda, setBusqueda] = useState('')
    const [formData, setFormData] = useState({
        nombre: '',
        texto: '',
        rating: 5,
        imagen: ''
    })

    useEffect(() => {
        cargarResenas()
    }, [])

    const cargarResenas = async () => {
        try {
            const res = await api.get('/admin/resenas')
            setResenas(res.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const guardarResena = async () => {
        try {
            if (editando) {
                await api.put(`/admin/resenas/${editando.id}`, formData)
                setResenas(prev => prev.map(r => r.id === editando.id ? { ...r, ...formData } : r))
            } else {
                const res = await api.post('/admin/resenas', formData)
                setResenas(prev => [...prev, res.data])
            }
            cerrarModal()
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: editando ? 'Reseña actualizada' : 'Reseña creada',
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937',
                color: '#fff'
            })
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const toggleActiva = async (id: string, activa: boolean) => {
        try {
            await api.put(`/admin/resenas/${id}`, { activa: !activa })
            setResenas(prev => prev.map(r => r.id === id ? { ...r, activa: !activa } : r))
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const eliminarResena = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar reseña?',
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
                await api.delete(`/admin/resenas/${id}`)
                setResenas(prev => prev.filter(r => r.id !== id))
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const abrirEditar = (resena: Resena) => {
        setEditando(resena)
        setFormData({
            nombre: resena.nombre,
            texto: resena.texto,
            rating: resena.rating,
            imagen: resena.imagen || ''
        })
        setModalAbierto(true)
    }

    const cerrarModal = () => {
        setModalAbierto(false)
        setEditando(null)
        setFormData({ nombre: '', texto: '', rating: 5, imagen: '' })
    }

    const resenasFiltradas = resenas.filter(r =>
        r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.texto.toLowerCase().includes(busqueda.toLowerCase())
    )

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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white">Reseñas de Clientes</h1>
                    <p className="text-gray-400 mt-1">{resenas.length} reseñas</p>
                </div>
                <button
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Reseña
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar reseñas..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resenasFiltradas.map((resena) => (
                    <motion.div
                        key={resena.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-6 rounded-2xl border transition-all ${resena.activa
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-gray-800/50 border-gray-800 opacity-60'
                            }`}
                    >
                        {/* Rating */}
                        <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < resena.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'fill-gray-600 text-gray-600'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Text */}
                        <p className="text-gray-300 text-sm line-clamp-3 mb-4">"{resena.texto}"</p>

                        {/* Author */}
                        <div className="flex items-center gap-3 mb-4">
                            {resena.imagen ? (
                                <img src={resena.imagen} alt={resena.nombre} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                                    <User className="w-5 h-5 text-teal-500" />
                                </div>
                            )}
                            <span className="font-bold text-white">{resena.nombre}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-700">
                            <button
                                onClick={() => abrirEditar(resena)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" /> Editar
                            </button>
                            <button
                                onClick={() => toggleActiva(resena.id, resena.activa)}
                                className={`p-2 rounded-lg transition-colors ${resena.activa ? 'text-yellow-500 hover:bg-yellow-500/10' : 'text-gray-500 hover:text-green-500'
                                    }`}
                            >
                                {resena.activa ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => eliminarResena(resena.id)}
                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-700"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editando ? 'Editar Reseña' : 'Nueva Reseña'}
                                </h2>
                                <button onClick={cerrarModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del cliente</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Reseña</label>
                                    <textarea
                                        value={formData.texto}
                                        onChange={(e) => setFormData(prev => ({ ...prev, texto: e.target.value }))}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, rating: n }))}
                                                className="p-2"
                                            >
                                                <Star className={`w-8 h-8 transition-colors ${n <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-600 text-gray-600'
                                                    }`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">URL de imagen (opcional)</label>
                                    <input
                                        type="text"
                                        value={formData.imagen}
                                        onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={cerrarModal}
                                    className="flex-1 py-3 border border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarResena}
                                    disabled={!formData.nombre || !formData.texto}
                                    className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl disabled:opacity-50"
                                >
                                    Guardar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
