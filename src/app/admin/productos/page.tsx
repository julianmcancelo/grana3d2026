"use client"
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
    Plus, Search, Edit2, Trash2, Package,
    Eye, EyeOff, X, Loader2, Upload,
    ArrowRight, ArrowLeft, Info
} from 'lucide-react'
import api from '@/lib/api'
import ImageUpload from '@/components/admin/ImageUpload'
import VariantsManager from '@/components/admin/VariantsManager'

const MarkdownEditor = dynamic(() => import('@/components/admin/MarkdownEditor'), {
    loading: () => <div className="h-[300px] w-full bg-white/5 rounded-xl animate-pulse" />,
    ssr: false
})

interface Producto {
    id: string
    nombre: string
    slug: string
    precio: number
    precioOferta?: number
    precioMayorista?: number
    stock: number
    imagen?: string
    imagenes: string[]
    categoria?: { nombre: string }
    activo: boolean
    destacado: boolean
    esPreventa: boolean
    fechaLlegada?: string
    tiempoProduccion?: string
    variantes?: any // JSON
}

interface Categoria {
    id: string
    nombre: string
}

function ProductosContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState<Producto | null>(null)
    const [guardando, setGuardando] = useState(false)

    // Wizard State
    const [step, setStep] = useState(1)
    const [tieneVariantes, setTieneVariantes] = useState(false)

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        precioOferta: '',
        precioMayorista: '',
        stock: '',
        categoriaId: '',
        imagen: '',
        imagenes: [] as string[],
        activo: true,
        destacado: false,
        esPreventa: false,
        fechaLlegada: '',
        tiempoProduccion: '',
        sumaCupoMayorista: false,
        variantes: [] as any[] // Array de grupos de variantes
    })


    useEffect(() => {
        cargarDatos()
        if (searchParams.get('nuevo') === 'true') {
            abrirModal()
            // Limpiar URL
            router.replace('/admin/productos', { scroll: false })
        }
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
                precioMayorista: producto.precioMayorista?.toString() || '',
                stock: producto.stock.toString(),
                categoriaId: '',
                imagen: producto.imagen || '',
                imagenes: producto.imagenes || (producto.imagen ? [producto.imagen] : []),
                activo: producto.activo,
                destacado: producto.destacado,
                esPreventa: producto.esPreventa || false,
                fechaLlegada: producto.fechaLlegada ? new Date(producto.fechaLlegada).toISOString().split('T')[0] : '',
                tiempoProduccion: producto.tiempoProduccion || '',
                sumaCupoMayorista: (producto as any).sumaCupoMayorista || false,
                variantes: (producto.variantes as any)?.groups || []
            })
            setTieneVariantes(!!(producto.variantes))
        } else {
            setEditando(null)
            setForm({
                nombre: '',
                descripcion: '',
                precio: '',
                precioOferta: '',
                precioMayorista: '',
                stock: '',
                categoriaId: categorias[0]?.id || '',
                imagen: '',
                imagenes: [],
                activo: true,
                destacado: false,
                esPreventa: false,
                fechaLlegada: '',
                tiempoProduccion: '',
                sumaCupoMayorista: false,
                variantes: []
            })
            setTieneVariantes(false)
        }
        setStep(1) // Reset step
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
            // Asegurar que imagen principal es la primera del array
            const imagenesFinales = form.imagenes.length > 0 ? form.imagenes : (form.imagen ? [form.imagen] : [])
            const imagenPrincipal = imagenesFinales.length > 0 ? imagenesFinales[0] : null

            let precioFinal = parseFloat(form.precio) || 0
            let stockFinal = parseInt(form.stock) || 0

            // Si tiene variantes, calculamos precio mínimo y stock total
            if (tieneVariantes && form.variantes && form.variantes.length > 0) {
                // Stock: Suma de las opciones del primer grupo
                if (form.variantes[0]?.opciones) {
                    stockFinal = form.variantes[0].opciones.reduce((acc: number, opt: any) => acc + (parseInt(opt.stock) || 0), 0)
                }

                // Precio: El mínimo de todas las opciones configuradas
                const allOptions = form.variantes.flatMap((g: any) => g.opciones)
                if (allOptions.length > 0) {
                    // Tomamos el precioExtra como el precio final ya que basePrice es 0 en este modo
                    precioFinal = Math.min(...allOptions.map((o: any) => parseFloat(o.precioExtra) || 0))
                }
            }

            const datos = {
                nombre: form.nombre,
                descripcion: form.descripcion || 'Producto sin descripción',
                precio: precioFinal,
                precioOferta: form.precioOferta ? parseFloat(form.precioOferta) : null,
                precioMayorista: form.precioMayorista ? parseFloat(form.precioMayorista) : null,
                stock: stockFinal,
                categoriaId: form.categoriaId,
                imagen: imagenPrincipal,
                imagenes: imagenesFinales,
                activo: form.activo,
                destacado: form.destacado,
                esPreventa: form.esPreventa,
                fechaLlegada: form.fechaLlegada ? new Date(form.fechaLlegada) : null,
                tiempoProduccion: form.tiempoProduccion || null,
                sumaCupoMayorista: form.sumaCupoMayorista,
                variantes: { groups: form.variantes } // Wrap in object as expected
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
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (!confirm('¿Sincronizar TODO con Google Sheets?\n\n• Productos\n• Clientes\n• Cotizaciones\n• Estadísticas\n\nEsto actualizará todas las hojas.')) return
                            try {
                                const res = await fetch('/api/admin/sync-sheets', { method: 'POST' })
                                const data = await res.json()
                                if (data.exito) {
                                    alert(`✅ Sincronización completa:\n\n${data.detalles.productos}\n${data.detalles.clientes}\n${data.detalles.cotizaciones}\nEstadísticas: ${data.detalles.estadisticas}`)
                                } else {
                                    alert('❌ Error: ' + (data.error || 'Error desconocido'))
                                }
                            } catch (e) {
                                alert('❌ Error al sincronizar con Google Sheets')
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors border border-green-500/20"
                    >
                        <Upload className="w-5 h-5 rotate-180" /> Sync Todo a Sheets
                    </button>
                    <Link
                        href="/admin/productos/importar"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors border border-white/10"
                    >
                        <Upload className="w-5 h-5" /> Importar
                    </Link>
                    <button
                        onClick={() => abrirModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Producto
                    </button>
                </div>
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

            {/* Modal Crear/Editar (Wizard) */}
            <AnimatePresence>
                {modalAbierto && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={cerrarModal}
                            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                        >
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto shadow-2xl shadow-black/50">
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 1 ? 'bg-teal-500' : 'bg-teal-500/30'}`} />
                                            <div className={`h-1.5 w-8 rounded-full transition-colors ${step === 2 ? 'bg-teal-500' : 'bg-white/10'}`} />
                                            <span className="text-xs text-gray-500 ml-2">Paso {step} de 2</span>
                                        </div>
                                    </div>
                                    <button onClick={cerrarModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    <form id="product-form" onSubmit={handleSubmit}>
                                        {step === 1 ? (
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="space-y-6"
                                            >
                                                {/* Paso 1: Información General */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">Nombre del Producto <span className="text-red-500">*</span></label>
                                                        <input
                                                            type="text"
                                                            required
                                                            value={form.nombre}
                                                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                                            placeholder="Ej: Filamento PLA Grana3D"
                                                            className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-bold text-gray-300 mb-1.5">Categoría <span className="text-red-500">*</span></label>
                                                            <div className="relative">
                                                                <select
                                                                    value={form.categoriaId}
                                                                    onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                                                                    className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:border-teal-500 transition-all cursor-pointer"
                                                                >
                                                                    <option value="">Seleccionar categoría...</option>
                                                                    {categorias.map(cat => (
                                                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                                                    ))}
                                                                </select>
                                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                    <div className="border-t-[4px] border-t-white/30 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-end pb-3">
                                                            <div className="flex gap-4 w-full">
                                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.activo ? 'bg-teal-500 border-teal-500' : 'border-white/20 bg-[#111]'}`}>
                                                                        {form.activo && <CheckMark className="w-3.5 h-3.5 text-black" />}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={form.activo}
                                                                        onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Activo</span>
                                                                </label>

                                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.destacado ? 'bg-amber-500 border-amber-500' : 'border-white/20 bg-[#111]'}`}>
                                                                        {form.destacado && <CheckMark className="w-3.5 h-3.5 text-black" />}
                                                                    </div>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={form.destacado}
                                                                        onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                                                                        className="hidden"
                                                                    />
                                                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Destacado</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">Descripción</label>
                                                        <div className="border border-white/10 rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-colors">
                                                            <MarkdownEditor
                                                                value={form.descripcion}
                                                                onChange={(val) => setForm({ ...form, descripcion: val })}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-bold text-gray-300 mb-1.5">Imágenes</label>
                                                        <ImageUpload
                                                            value={form.imagenes}
                                                            onChange={(urls) => setForm({
                                                                ...form,
                                                                imagenes: Array.isArray(urls) ? urls : [urls],
                                                                imagen: Array.isArray(urls) && urls.length > 0 ? urls[0] : (typeof urls === 'string' ? urls : '')
                                                            })}
                                                            label="Arrastrá imágenes aquí o click para subir"
                                                            multiple={true}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                                            <Eye className="w-3 h-3" /> La primera imagen será la portada.
                                                        </p>
                                                    </div>

                                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                        <label className="flex items-center gap-3 cursor-pointer">
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.esPreventa ? 'bg-purple-500 border-purple-500' : 'border-white/20 bg-[#111]'}`}>
                                                                {form.esPreventa && <CheckMark className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                checked={form.esPreventa}
                                                                onChange={(e) => setForm({ ...form, esPreventa: e.target.checked })}
                                                                className="hidden"
                                                            />
                                                            <div>
                                                                <span className="font-bold text-sm text-white block">Es Preventa</span>
                                                                <span className="text-xs text-gray-400 block">El producto aún no está en stock físico inmediato.</span>
                                                            </div>
                                                        </label>

                                                        {form.esPreventa && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                className="grid grid-cols-2 gap-4 mt-4 overflow-hidden"
                                                            >
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Fecha Estimada de Llegada</label>
                                                                    <input
                                                                        type="date"
                                                                        value={form.fechaLlegada}
                                                                        onChange={(e) => setForm({ ...form, fechaLlegada: e.target.value })}
                                                                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-gray-400 mb-1">Tiempo de Producción</label>
                                                                    <input
                                                                        type="text"
                                                                        value={form.tiempoProduccion}
                                                                        onChange={(e) => setForm({ ...form, tiempoProduccion: e.target.value })}
                                                                        placeholder="Ej: 48-72 hs hábiles"
                                                                        className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
                                                                    />
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-6"
                                            >
                                                {/* Paso 2: Variantes y Precios */}

                                                {/* Selector Tipo Producto */}
                                                <div className="bg-[#111] border border-white/10 rounded-xl p-1 flex">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTieneVariantes(false)}
                                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!tieneVariantes ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Producto Simple
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setTieneVariantes(true)}
                                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tieneVariantes ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-400 hover:text-white'}`}
                                                    >
                                                        Producto con Variantes
                                                    </button>
                                                </div>

                                                <AnimatePresence mode="wait">
                                                    {!tieneVariantes ? (
                                                        <motion.div
                                                            key="simple"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="space-y-6"
                                                        >
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="bg-white/5 border border-white/5 rounded-xl p-5">
                                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Precio Base <span className="text-red-500">*</span></label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                                                        <input
                                                                            type="number"
                                                                            required={!tieneVariantes}
                                                                            value={form.precio}
                                                                            onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                                                            className="w-full pl-7 pr-4 py-3 bg-black border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-teal-500 text-lg"
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white/5 border border-white/5 rounded-xl p-5">
                                                                    <label className="block text-sm font-bold text-gray-400 mb-1">Stock Inicial</label>
                                                                    <input
                                                                        type="number"
                                                                        value={form.stock}
                                                                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                                                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-teal-500 text-lg"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Precios Avanzados */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-green-400 mb-1">Precio Oferta (Opcional)</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                                        <input
                                                                            type="number"
                                                                            value={form.precioOferta}
                                                                            onChange={(e) => setForm({ ...form, precioOferta: e.target.value })}
                                                                            className="w-full pl-6 pr-3 py-2 bg-black border border-green-500/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-green-500"
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-blue-400 mb-1">Precio Mayorista (Opcional)</label>
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                                        <input
                                                                            type="number"
                                                                            value={form.precioMayorista}
                                                                            onChange={(e) => setForm({ ...form, precioMayorista: e.target.value })}
                                                                            className="w-full pl-6 pr-3 py-2 bg-black border border-blue-500/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                                                                            placeholder="0.00"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="variants"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="space-y-4"
                                                        >
                                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex gap-3 items-start">
                                                                <div className="p-1 bg-yellow-500/20 rounded-lg shrink-0">
                                                                    <Info className="w-4 h-4 text-yellow-500" />
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-yellow-500 font-bold text-sm">Modo Variantes Activado</h4>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        El precio y stock se gestionan individualmente por cada variante.
                                                                        El sistema tomará automáticamente el <strong>precio más bajo</strong> como base.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <VariantsManager
                                                                variantes={form.variantes}
                                                                onChange={(newVariantes) => setForm({ ...form, variantes: newVariantes })}
                                                                basePrice={0} // No base price needed here
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </form>
                                </div>

                                {/* Footer (Actions) */}
                                <div className="p-6 border-t border-white/5 flex items-center justify-between shrink-0 bg-[#0a0a0a]">
                                    {step === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="px-6 py-3 text-gray-400 hover:text-white font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" /> Volver
                                        </button>
                                    )}
                                    <div className="flex gap-3 ml-auto w-full md:w-auto">
                                        <button
                                            type="button"
                                            onClick={cerrarModal}
                                            className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl font-bold transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        {step === 1 ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Validate Step 1
                                                    const formEl = document.getElementById('product-form') as HTMLFormElement
                                                    if (formEl.checkValidity()) {
                                                        setStep(2)
                                                    } else {
                                                        formEl.reportValidity()
                                                    }
                                                }}
                                                className="flex-1 md:flex-none px-8 py-3 bg-teal-500 hover:bg-teal-600 text-black rounded-xl font-bold transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                                            >
                                                Siguiente <ArrowRight className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleSubmit} // Submit form
                                                disabled={guardando}
                                                className="flex-1 md:flex-none px-8 py-3 bg-teal-500 hover:bg-teal-600 text-black rounded-xl font-bold transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {guardando && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {editando ? 'Guardar Cambios' : 'Crear Producto'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}


export default function ProductosAdmin() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        }>
            <ProductosContent />
        </Suspense>
    )
}

function CheckMark({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
