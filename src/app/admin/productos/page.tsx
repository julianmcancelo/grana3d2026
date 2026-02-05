"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Edit2, Trash2, Package,
    Eye, EyeOff, ArrowUpDown, X, Upload, Loader2
} from 'lucide-react'
import api from '@/lib/api'

interface Producto {
    id: string
    nombre: string
    slug: string
    precio: number
    precioOferta?: number
    stock: number
    imagen?: string
    categoria?: { nombre: string }
    activo: boolean
    destacado: boolean
}

interface Categoria {
    id: string
    nombre: string
}

export default function ProductosAdmin() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Producto | null>(null)
    const [guardando, setGuardando] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        precioOferta: '',
        stock: '',
        categoriaId: '',
        imagen: '',
        activo: true,
        destacado: false
    })

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([
                api.get('/productos?limit=100'),
                api.get('/categorias')
            ])
            setProductos(prodRes.data.productos || prodRes.data)
            setCategorias(catRes.data)
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const abrirModal = (producto?: Producto) => {
        if (producto) {
            setEditando(producto)
            setForm({
                nombre: producto.nombre,
                descripcion: '',
                precio: producto.precio.toString(),
                precioOferta: producto.precioOferta?.toString() || '',
                stock: producto.stock.toString(),
                categoriaId: '',
                imagen: producto.imagen || '',
                activo: producto.activo,
                destacado: producto.destacado
            })
        } else {
            setEditando(null)
            setForm({
                nombre: '',
                descripcion: '',
                precio: '',
                precioOferta: '',
                stock: '',
                categoriaId: categorias[0]?.id || '',
                imagen: '',
                activo: true,
                destacado: false
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
        setGuardando(true)

        try {
            const datos = {
                nombre: form.nombre,
                descripcion: form.descripcion || 'Producto sin descripción',
                precio: parseFloat(form.precio),
                precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : null,
                stock: parseInt(form.stock) || 0,
                categoriaId: form.categoriaId,
                imagen: form.imagen || null,
                activo: form.activo,
                destacado: form.destacado
            }

            if (editando) {
                await api.put(`/productos/${editando.id}`, datos)
            } else {
                await api.post('/productos', datos)
            }

            cerrarModal()
            cargarDatos()
        } catch (error) {
            console.error('Error guardando:', error)
        } finally {
            setGuardando(false)
        }
    }

    const eliminarProducto = async (id: string) => {
        if (!confirm('¿Eliminar este producto?')) return
        try {
            await api.delete(`/productos/${id}`)
            cargarDatos()
        } catch (error) {
            console.error('Error eliminando:', error)
        }
    }

    const toggleActivo = async (producto: Producto) => {
        try {
            await api.put(`/productos/${producto.id}`, { activo: !producto.activo })
            cargarDatos()
        } catch (error) {
            console.error('Error actualizando:', error)
        }
    }

    const productosFiltrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    )

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
                    <h1 className="text-3xl font-bold mb-2">Productos</h1>
                    <p className="text-gray-400">{productos.length} productos en total</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" /> Nuevo Producto
                </button>
            </div>

            {/* Buscador */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                />
            </div>

            {/* Tabla */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-black/50">
                        <tr>
                            <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Producto</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Precio</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Stock</th>
                            <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Estado</th>
                            <th className="text-right px-6 py-4 text-xs font-bold text-gray-400 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {productosFiltrados.map((producto) => (
                            <motion.tr
                                key={producto.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-white/5"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                            {producto.imagen ? (
                                                <img src={producto.imagen} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{producto.nombre}</div>
                                            <div className="text-xs text-gray-500">{producto.categoria?.nombre}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">${producto.precio.toLocaleString('es-AR')}</div>
                                    {producto.precioOferta && (
                                        <div className="text-xs text-green-500">Oferta: ${producto.precioOferta.toLocaleString('es-AR')}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${producto.stock < 5 ? 'text-red-500' : 'text-white'}`}>
                                        {producto.stock} un.
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleActivo(producto)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${producto.activo
                                                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                            }`}
                                    >
                                        {producto.activo ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {producto.activo ? 'Activo' : 'Oculto'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => abrirModal(producto)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => eliminarProducto(producto.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {productosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay productos</p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
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
                                    <h2 className="text-xl font-bold">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                    <button onClick={cerrarModal} className="p-2 hover:bg-white/10 rounded-lg">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
                                        <input
                                            type="text"
                                            required
                                            value={form.nombre}
                                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                                        <textarea
                                            value={form.descripcion}
                                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Precio *</label>
                                            <input
                                                type="number"
                                                required
                                                value={form.precio}
                                                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Precio Oferta</label>
                                            <input
                                                type="number"
                                                value={form.precioOferta}
                                                onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Stock</label>
                                            <input
                                                type="number"
                                                value={form.stock}
                                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                                            <select
                                                value={form.categoriaId}
                                                onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                                            >
                                                <option value="">Sin categoría</option>
                                                {categorias.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                ))}
                                            </select>
                                        </div>
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

                                    <div className="flex gap-6 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.activo}
                                                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-black accent-teal-500"
                                            />
                                            <span className="text-sm text-gray-400">Activo</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.destacado}
                                                onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                                                className="w-5 h-5 rounded border-white/10 bg-black accent-teal-500"
                                            />
                                            <span className="text-sm text-gray-400">Destacado</span>
                                        </label>
                                    </div>

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
                                            {editando ? 'Guardar Cambios' : 'Crear Producto'}
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
