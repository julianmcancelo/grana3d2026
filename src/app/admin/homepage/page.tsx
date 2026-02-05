"use client"
import { useState, useEffect } from 'react'
import { motion, Reorder, AnimatePresence } from 'framer-motion'
import { Save, Plus, Trash2, Edit2, GripVertical, Check, X, Eye, EyeOff, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Seccion {
    id: string
    tipo: string
    titulo: string | null
    subtitulo: string | null
    orden: number
    activa: boolean
    config: any
}

const tipoLabels: Record<string, string> = {
    'HERO_CAROUSEL': 'Hero Carousel Principal',
    'BANNERS_CATEGORIA': 'Banners Categorías',
    'PRODUCTOS_DESTACADOS': 'Productos Destacados',
    'PRODUCTOS_OFERTA': 'Ofertas / Imperdibles',
    'BANNER_PROMO': 'Banner Promocional',
    'CATEGORIAS_RAPIDAS': 'Accesos Rápidos',
    'RESENAS': 'Reseñas de Clientes',
    'NEWSLETTER': 'Newsletter'
}

export default function AdminHomepage() {
    const [secciones, setSecciones] = useState<Seccion[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editando, setEditando] = useState<Seccion | null>(null)

    useEffect(() => {
        cargarSecciones()
    }, [])

    const cargarSecciones = async () => {
        try {
            const { data } = await api.get('/admin/homepage')
            setSecciones(data)
        } catch (error) {
            console.error(error)
            // Intentar inicializar si está vacío
            try {
                await api.post('/admin/homepage/init')
                const { data } = await api.get('/admin/homepage')
                setSecciones(data)
            } catch (e) {
                console.error('Error inicializando', e)
            }
        } finally {
            setLoading(false)
        }
    }

    const guardarOrden = async (nuevoOrden: Seccion[]) => {
        setSecciones(nuevoOrden)
        try {
            // Actualizar orden en backend
            const ordenUpdate = nuevoOrden.map((s, index) => ({ id: s.id, orden: index }))
            await api.put('/admin/homepage', { secciones: ordenUpdate })
        } catch (error) {
            console.error('Error guardando orden', error)
        }
    }

    const toggleActiva = async (seccion: Seccion) => {
        const nuevaData = { ...seccion, activa: !seccion.activa }
        setSecciones(prev => prev.map(s => s.id === seccion.id ? nuevaData : s))

        try {
            await api.put(`/admin/homepage/${seccion.id}`, { activa: !seccion.activa })
        } catch (error) {
            console.error(error)
            // Revertir en error
            setSecciones(prev => prev.map(s => s.id === seccion.id ? seccion : s))
        }
    }

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editando) return
        setSaving(true)

        try {
            const { data } = await api.put(`/admin/homepage/${editando.id}`, {
                titulo: editando.titulo,
                subtitulo: editando.subtitulo
            })
            setSecciones(prev => prev.map(s => s.id === editando.id ? data : s))
            setEditando(null)
            Swal.fire({
                icon: 'success',
                title: 'Sección actualizada',
                showConfirmButton: false,
                timer: 1500,
                background: '#1f2937', color: '#fff'
            })
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar',
                background: '#1f2937', color: '#fff'
            })
        } finally {
            setSaving(false)
        }
    }

    const [modalNuevo, setModalNuevo] = useState(false)
    const [nuevaSeccion, setNuevaSeccion] = useState({
        tipo: 'PRODUCTOS_DESTACADOS',
        titulo: '',
        subtitulo: ''
    })

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { data } = await api.post('/admin/homepage', nuevaSeccion)
            setSecciones(prev => [...prev, data])
            setModalNuevo(false)
            setNuevaSeccion({ tipo: 'PRODUCTOS_DESTACADOS', titulo: '', subtitulo: '' })
            Swal.fire({
                icon: 'success',
                title: 'Sección creada',
                showConfirmButton: false,
                timer: 1500,
                background: '#1f2937', color: '#fff'
            })
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la sección',
                background: '#1f2937', color: '#fff'
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-500" /></div>

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configurar Homepage</h1>
                    <p className="text-gray-400">Arrastra para reordenar las secciones de tu tienda</p>
                </div>
                <button
                    onClick={() => setModalNuevo(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus size={20} /> Nueva Sección
                </button>
            </div>

            <Reorder.Group axis="y" values={secciones} onReorder={guardarOrden} className="space-y-3">
                {secciones.map((seccion) => (
                    <Reorder.Item key={seccion.id} value={seccion}>
                        <div className={`bg-gray-900 border ${seccion.activa ? 'border-gray-700' : 'border-gray-800 opacity-60'} rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-gray-600 transition-colors`}>
                            <div className="cursor-grab active:cursor-grabbing p-2 text-gray-500 hover:text-white">
                                <GripVertical size={20} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-800 rounded text-gray-400">
                                        {tipoLabels[seccion.tipo] || seccion.tipo}
                                    </span>
                                    {!seccion.activa && <span className="text-xs text-red-400 font-bold">Oculto</span>}
                                </div>
                                <h3 className="font-bold text-lg text-white mt-1">{seccion.titulo || '(Sin título visual)'}</h3>
                                {seccion.subtitulo && <p className="text-sm text-gray-400">{seccion.subtitulo}</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditando(seccion)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Editar Textos"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => toggleActiva(seccion)}
                                    className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${seccion.activa ? 'text-teal-400' : 'text-gray-600'}`}
                                    title={seccion.activa ? 'Ocultar' : 'Mostrar'}
                                >
                                    {seccion.activa ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button
                                    onClick={async () => {
                                        const result = await Swal.fire({
                                            title: '¿Eliminar sección?',
                                            text: "No podrás revertir esto",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#ef4444',
                                            cancelButtonColor: '#374151',
                                            confirmButtonText: 'Sí, eliminar',
                                            background: '#1f2937', color: '#fff'
                                        })

                                        if (result.isConfirmed) {
                                            try {
                                                await api.delete(`/admin/homepage/${seccion.id}`)
                                                setSecciones(prev => prev.filter(s => s.id !== seccion.id))
                                            } catch (error) {
                                                console.error(error)
                                            }
                                        }
                                    }}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {/* Modal Nueva Sección */}
            <AnimatePresence>
                {modalNuevo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Nueva Sección</h3>
                                <button onClick={() => setModalNuevo(false)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Tipo de Sección</label>
                                    <select
                                        value={nuevaSeccion.tipo}
                                        onChange={e => setNuevaSeccion({ ...nuevaSeccion, tipo: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                    >
                                        {Object.entries(tipoLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Título (Opcional)</label>
                                    <input
                                        value={nuevaSeccion.titulo}
                                        onChange={e => setNuevaSeccion({ ...nuevaSeccion, titulo: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                        placeholder="Ej: Lo Más Vendido"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Subtítulo (Opcional)</label>
                                    <input
                                        value={nuevaSeccion.subtitulo}
                                        onChange={e => setNuevaSeccion({ ...nuevaSeccion, subtitulo: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                        placeholder="Ej: Aprovechá hoy"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setModalNuevo(false)} className="flex-1 py-3 border border-gray-600 rounded-xl font-bold hover:bg-gray-800 text-gray-300">Cancelar</button>
                                    <button type="submit" disabled={saving} className="flex-1 py-3 bg-teal-500 text-black rounded-xl font-bold hover:bg-teal-400 disabled:opacity-50 flex justify-center items-center gap-2">
                                        {saving ? <Loader2 className="animate-spin" /> : <Plus size={18} />} Crear
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Edit (Existente) */}
            <AnimatePresence>
                {editando && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Editar Sección</h3>
                                <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <form onSubmit={handleEdit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Título Visible</label>
                                    <input
                                        value={editando.titulo || ''}
                                        onChange={e => setEditando({ ...editando, titulo: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                        placeholder="Ej: Ofertas de Verano"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Subtítulo</label>
                                    <input
                                        value={editando.subtitulo || ''}
                                        onChange={e => setEditando({ ...editando, subtitulo: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white outline-none focus:border-teal-500"
                                        placeholder="Ej: Aprovechá hasta 50% OFF"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setEditando(null)} className="flex-1 py-3 border border-gray-600 rounded-xl font-bold hover:bg-gray-800 text-gray-300">Cancelar</button>
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
