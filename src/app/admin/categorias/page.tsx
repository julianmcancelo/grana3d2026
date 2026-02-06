"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import {
    Plus, Edit2, Trash2, Eye, EyeOff, X, Loader2,
    GripVertical, Palette, Image as ImageIcon, Save,
    Printer, Box, Sparkles, Gamepad2, Gift, Cpu, Wrench,
    Puzzle, Star, Zap, Heart, Shapes, Crown, Gem, Target
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'
import ImageUpload from '@/components/admin/ImageUpload'

interface Categoria {
    id: string
    nombre: string
    slug: string
    descripcion?: string
    imagen?: string
    icono?: string
    color?: string
    orden: number
    activo: boolean
}

// Iconos disponibles
const iconosDisponibles = [
    { id: 'printer', icon: Printer, label: 'Impresora' },
    { id: 'box', icon: Box, label: 'Caja' },
    { id: 'sparkles', icon: Sparkles, label: 'Brillos' },
    { id: 'gamepad', icon: Gamepad2, label: 'Gaming' },
    { id: 'gift', icon: Gift, label: 'Regalo' },
    { id: 'cpu', icon: Cpu, label: 'CPU' },
    { id: 'wrench', icon: Wrench, label: 'Herramienta' },
    { id: 'puzzle', icon: Puzzle, label: 'Puzzle' },
    { id: 'star', icon: Star, label: 'Estrella' },
    { id: 'zap', icon: Zap, label: 'Rayo' },
    { id: 'heart', icon: Heart, label: 'Corazón' },
    { id: 'shapes', icon: Shapes, label: 'Formas' },
    { id: 'crown', icon: Crown, label: 'Corona' },
    { id: 'gem', icon: Gem, label: 'Gema' },
    { id: 'target', icon: Target, label: 'Target' },
]

// Colores predefinidos
const coloresPredefinidos = [
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#ef4444', // red
    '#6366f1', // indigo
    '#06b6d4', // cyan
]

export default function CategoriasAdmin() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Categoria | null>(null)
    const [formData, setFormData] = useState({
        nombre: '',
        slug: '',
        descripcion: '',
        imagen: '',
        icono: 'box',
        color: '#14b8a6'
    })

    useEffect(() => {
        cargarCategorias()
    }, [])

    const cargarCategorias = async () => {
        try {
            const { data } = await api.get('/categorias')
            setCategorias(data.sort((a: Categoria, b: Categoria) => a.orden - b.orden))
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const generarSlug = (nombre: string) => {
        return nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    const abrirModal = (categoria?: Categoria) => {
        if (categoria) {
            setEditando(categoria)
            setFormData({
                nombre: categoria.nombre,
                slug: categoria.slug,
                descripcion: categoria.descripcion || '',
                imagen: categoria.imagen || '',
                icono: categoria.icono || 'box',
                color: categoria.color || '#14b8a6'
            })
        } else {
            setEditando(null)
            setFormData({
                nombre: '',
                slug: '',
                descripcion: '',
                imagen: '',
                icono: 'box',
                color: '#14b8a6'
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
                ...formData,
                slug: formData.slug || generarSlug(formData.nombre)
            }

            if (editando) {
                await api.put(`/admin/categorias/${editando.id}`, payload)
                setCategorias(prev => prev.map(c =>
                    c.id === editando.id ? { ...c, ...payload } : c
                ))
            } else {
                const { data } = await api.post('/admin/categorias', payload)
                setCategorias(prev => [...prev, data])
            }

            cerrarModal()
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: editando ? 'Categoría actualizada' : 'Categoría creada',
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

    const toggleActivo = async (categoria: Categoria) => {
        try {
            await api.put(`/admin/categorias/${categoria.id}`, { activo: !categoria.activo })
            setCategorias(prev => prev.map(c =>
                c.id === categoria.id ? { ...c, activo: !c.activo } : c
            ))
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const eliminar = async (id: string) => {
        const result = await Swal.fire({
            title: '¿Eliminar categoría?',
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
                await api.delete(`/admin/categorias/${id}`)
                setCategorias(prev => prev.filter(c => c.id !== id))
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.error || 'No se puede eliminar',
                    background: '#1f2937',
                    color: '#fff'
                })
            }
        }
    }

    const guardarOrden = async (newOrder: Categoria[]) => {
        setCategorias(newOrder)
        try {
            await Promise.all(newOrder.map((cat, i) =>
                api.put(`/admin/categorias/${cat.id}`, { orden: i })
            ))
        } catch (error) {
            console.error('Error guardando orden:', error)
        }
    }

    const getIconComponent = (iconId: string) => {
        const found = iconosDisponibles.find(i => i.id === iconId)
        return found?.icon || Box
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
                    <h1 className="text-3xl font-black text-white">Categorías</h1>
                    <p className="text-gray-400 mt-1">{categorias.length} categorías · Arrastrá para reordenar</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Categoría
                </button>
            </div>

            {/* Grid de Categorías */}
            {categorias.length === 0 ? (
                <div className="bg-gray-800/50 rounded-2xl p-12 text-center border border-gray-700">
                    <Shapes className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay categorías</h3>
                    <p className="text-gray-400 mb-6">Creá tu primera categoría para organizar productos</p>
                    <button
                        onClick={() => abrirModal()}
                        className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl"
                    >
                        Crear categoría
                    </button>
                </div>
            ) : (
                <Reorder.Group
                    axis="y"
                    values={categorias}
                    onReorder={guardarOrden}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {categorias.map((categoria) => {
                        const IconComponent = getIconComponent(categoria.icono || 'box')
                        const color = categoria.color || '#14b8a6'

                        return (
                            <Reorder.Item
                                key={categoria.id}
                                value={categoria}
                                className={`group relative bg-gray-800 rounded-2xl overflow-hidden border transition-all cursor-grab active:cursor-grabbing ${categoria.activo ? 'border-gray-700 hover:border-gray-600' : 'border-gray-800 opacity-60'
                                    }`}
                            >
                                {/* Header con color */}
                                <div
                                    className="h-24 relative flex items-center justify-center"
                                    style={{ backgroundColor: `${color}20` }}
                                >
                                    <div className="absolute top-3 left-3">
                                        <GripVertical className="w-5 h-5 text-gray-500" />
                                    </div>

                                    {categoria.imagen ? (
                                        <img
                                            src={categoria.imagen}
                                            alt={categoria.nombre}
                                            className="w-16 h-16 object-contain"
                                        />
                                    ) : (
                                        <IconComponent
                                            className="w-12 h-12"
                                            style={{ color }}
                                        />
                                    )}

                                    {/* Badge de estado */}
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${categoria.activo
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-600/50 text-gray-400'
                                            }`}>
                                            {categoria.activo ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-white text-lg mb-1">{categoria.nombre}</h3>
                                    <p className="text-sm text-gray-500 mb-3">/{categoria.slug}</p>

                                    {categoria.descripcion && (
                                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                            {categoria.descripcion}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-gray-700">
                                        <button
                                            onClick={() => abrirModal(categoria)}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-sm"
                                        >
                                            <Edit2 className="w-4 h-4" /> Editar
                                        </button>
                                        <button
                                            onClick={() => toggleActivo(categoria)}
                                            className={`p-2 rounded-lg transition-colors ${categoria.activo
                                                    ? 'text-yellow-500 hover:bg-yellow-500/10'
                                                    : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                                                }`}
                                        >
                                            {categoria.activo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => eliminar(categoria.id)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </Reorder.Item>
                        )
                    })}
                </Reorder.Group>
            )}

            {/* Modal Crear/Editar */}
            <AnimatePresence>
                {modalAbierto && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-700 my-8"
                        >
                            <form onSubmit={handleSubmit}>
                                {/* Header del Modal */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                                    <h2 className="text-xl font-bold text-white">
                                        {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={cerrarModal}
                                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Contenido */}
                                <div className="p-6 space-y-6">
                                    {/* Preview */}
                                    <div
                                        className="flex items-center gap-4 p-4 rounded-xl"
                                        style={{ backgroundColor: `${formData.color}15` }}
                                    >
                                        <div
                                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: `${formData.color}25` }}
                                        >
                                            {formData.imagen ? (
                                                <img src={formData.imagen} alt="Preview" className="w-10 h-10 object-contain" />
                                            ) : (
                                                (() => {
                                                    const Icon = getIconComponent(formData.icono)
                                                    return <Icon className="w-8 h-8" style={{ color: formData.color }} />
                                                })()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{formData.nombre || 'Nombre de categoría'}</h3>
                                            <p className="text-sm text-gray-500">/{formData.slug || generarSlug(formData.nombre) || 'slug'}</p>
                                        </div>
                                    </div>

                                    {/* Nombre y Slug */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.nombre}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    nombre: e.target.value,
                                                    slug: prev.slug ? prev.slug : generarSlug(e.target.value)
                                                }))}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">Slug</label>
                                            <input
                                                type="text"
                                                value={formData.slug}
                                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                                placeholder="auto-generado"
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Descripción</label>
                                        <textarea
                                            rows={2}
                                            value={formData.descripcion}
                                            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    {/* Selector de Icono */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-3">Icono</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {iconosDisponibles.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, icono: item.id }))}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${formData.icono === item.id
                                                            ? 'border-teal-500 bg-teal-500/10'
                                                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                                                        }`}
                                                >
                                                    <item.icon className="w-6 h-6" style={{ color: formData.color }} />
                                                    <span className="text-[10px] text-gray-500">{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Selector de Color */}
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-3">
                                            <Palette className="w-4 h-4" /> Color
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-2">
                                                {coloresPredefinidos.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''
                                                            }`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    {/* Imagen Upload */}
                                    <ImageUpload
                                        value={formData.imagen}
                                        onChange={(url) => setFormData(prev => ({ ...prev, imagen: url }))}
                                        label="Imagen (opcional, reemplaza el icono)"
                                    />
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
                                        disabled={saving || !formData.nombre}
                                        className="flex-1 py-3 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {editando ? 'Guardar' : 'Crear'}
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
