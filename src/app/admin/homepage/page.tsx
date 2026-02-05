"use client"
import { useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import {
    Plus, GripVertical, Eye, EyeOff, Trash2, Edit2,
    Image, Star, ShoppingBag, Grid3X3, Mail, Megaphone,
    Save, Loader2, AlertCircle, X
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Seccion {
    id: string
    tipo: string
    titulo?: string
    subtitulo?: string
    orden: number
    activa: boolean
    config?: any
}

const tipoIcons: Record<string, any> = {
    HERO_CAROUSEL: Image,
    BANNERS_CATEGORIA: Grid3X3,
    PRODUCTOS_DESTACADOS: ShoppingBag,
    PRODUCTOS_OFERTA: ShoppingBag,
    BANNER_PROMO: Megaphone,
    CATEGORIAS_RAPIDAS: Grid3X3,
    RESENAS: Star,
    NEWSLETTER: Mail,
}

const tipoLabels: Record<string, string> = {
    HERO_CAROUSEL: 'Carousel de Banners',
    BANNERS_CATEGORIA: 'Banners de Categoría',
    PRODUCTOS_DESTACADOS: 'Productos Destacados',
    PRODUCTOS_OFERTA: 'Productos en Oferta',
    BANNER_PROMO: 'Banner Promocional',
    CATEGORIAS_RAPIDAS: 'Categorías Rápidas',
    RESENAS: 'Reseñas de Clientes',
    NEWSLETTER: 'Newsletter',
}

const tiposDisponibles = Object.keys(tipoLabels)

export default function AdminHomepage() {
    const [secciones, setSecciones] = useState<Seccion[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [seccionEditando, setSeccionEditando] = useState<Seccion | null>(null)
    const [nuevoTipo, setNuevoTipo] = useState('')
    const [formData, setFormData] = useState({ titulo: '', subtitulo: '' })

    useEffect(() => {
        cargarSecciones()
    }, [])

    const cargarSecciones = async () => {
        try {
            const res = await api.get('/admin/homepage')
            setSecciones(res.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleActiva = async (id: string, activa: boolean) => {
        try {
            await api.put(`/admin/homepage/${id}`, { activa: !activa })
            setSecciones(prev => prev.map(s => s.id === id ? { ...s, activa: !activa } : s))
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Sección ${!activa ? 'activada' : 'desactivada'}`,
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937',
                color: '#fff'
            })
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const guardarOrden = async (newOrder: Seccion[]) => {
        setSecciones(newOrder)
        setSaving(true)
        try {
            await api.put('/admin/homepage', {
                secciones: newOrder.map((s, i) => ({ id: s.id, orden: i }))
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSaving(false)
        }
    }

    const crearSeccion = async () => {
        if (!nuevoTipo) return
        try {
            const res = await api.post('/admin/homepage', {
                tipo: nuevoTipo,
                titulo: formData.titulo || null,
                subtitulo: formData.subtitulo || null
            })
            setSecciones(prev => [...prev, res.data])
            setModalAbierto(false)
            setNuevoTipo('')
            setFormData({ titulo: '', subtitulo: '' })
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Sección creada',
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937',
                color: '#fff'
            })
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const editarSeccion = async () => {
        if (!seccionEditando) return
        try {
            await api.put(`/admin/homepage/${seccionEditando.id}`, {
                titulo: formData.titulo,
                subtitulo: formData.subtitulo,
                activa: seccionEditando.activa
            })
            setSecciones(prev => prev.map(s =>
                s.id === seccionEditando.id
                    ? { ...s, titulo: formData.titulo, subtitulo: formData.subtitulo }
                    : s
            ))
            setSeccionEditando(null)
            setFormData({ titulo: '', subtitulo: '' })
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const eliminarSeccion = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar sección?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#fff'
        })

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/homepage/${id}`)
                setSecciones(prev => prev.filter(s => s.id !== id))
            } catch (error) {
                console.error('Error:', error)
            }
        }
    }

    const abrirEditar = (seccion: Seccion) => {
        setSeccionEditando(seccion)
        setFormData({ titulo: seccion.titulo || '', subtitulo: seccion.subtitulo || '' })
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white">Secciones del Homepage</h1>
                    <p className="text-gray-400 mt-1">Arrastrá para reordenar, activá/desactivá secciones</p>
                </div>
                <button
                    onClick={() => setModalAbierto(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Agregar Sección
                </button>
            </div>

            {/* Saving indicator */}
            {saving && (
                <div className="flex items-center gap-2 text-teal-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando orden...
                </div>
            )}

            {/* Sections List */}
            {secciones.length === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
                    <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay secciones</h3>
                    <p className="text-gray-400 mb-6">Agregá secciones para personalizar tu homepage</p>
                    <button
                        onClick={() => setModalAbierto(true)}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                    >
                        Agregar primera sección
                    </button>
                </div>
            ) : (
                <Reorder.Group axis="y" values={secciones} onReorder={guardarOrden} className="space-y-3">
                    {secciones.map((seccion) => {
                        const Icon = tipoIcons[seccion.tipo] || Grid3X3
                        return (
                            <Reorder.Item
                                key={seccion.id}
                                value={seccion}
                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${seccion.activa
                                        ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        : 'bg-gray-800/50 border-gray-800 opacity-60'
                                    }`}
                            >
                                <GripVertical className="w-5 h-5 text-gray-500" />

                                <div className={`p-3 rounded-xl ${seccion.activa ? 'bg-teal-500/10' : 'bg-gray-700/50'}`}>
                                    <Icon className={`w-6 h-6 ${seccion.activa ? 'text-teal-500' : 'text-gray-500'}`} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-white">{tipoLabels[seccion.tipo]}</h3>
                                    {seccion.titulo && (
                                        <p className="text-sm text-gray-400">"{seccion.titulo}"</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => abrirEditar(seccion)}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => toggleActiva(seccion.id, seccion.activa)}
                                        className={`p-2 rounded-lg transition-colors ${seccion.activa
                                                ? 'hover:bg-yellow-500/10 text-yellow-500'
                                                : 'hover:bg-green-500/10 text-gray-500 hover:text-green-500'
                                            }`}
                                    >
                                        {seccion.activa ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => eliminarSeccion(seccion.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </Reorder.Item>
                        )
                    })}
                </Reorder.Group>
            )}

            {/* Modal Crear/Editar */}
            {(modalAbierto || seccionEditando) && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {seccionEditando ? 'Editar Sección' : 'Nueva Sección'}
                            </h2>
                            <button
                                onClick={() => { setModalAbierto(false); setSeccionEditando(null) }}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {!seccionEditando && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Tipo de Sección
                                    </label>
                                    <select
                                        value={nuevoTipo}
                                        onChange={(e) => setNuevoTipo(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                    >
                                        <option value="">Seleccionar tipo...</option>
                                        {tiposDisponibles.map(tipo => (
                                            <option key={tipo} value={tipo}>{tipoLabels[tipo]}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Título (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                    placeholder="Ej: Los más vendidos"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Subtítulo (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.subtitulo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                                    placeholder="Ej: Selección especial"
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setModalAbierto(false); setSeccionEditando(null) }}
                                className="flex-1 py-3 border border-gray-600 text-gray-300 font-bold rounded-xl hover:bg-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={seccionEditando ? editarSeccion : crearSeccion}
                                disabled={!seccionEditando && !nuevoTipo}
                                className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {seccionEditando ? 'Guardar' : 'Crear'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
