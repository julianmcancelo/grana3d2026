"use client"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check, Minus, Plus, Package, Image as ImageIcon } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useCarrito } from '@/context/CarritoContext'
import api from '@/lib/api'

interface Producto {
    id: string
    nombre: string
    slug: string
    descripcion: string
    descripcionCorta: string
    precio: number
    precioOferta: number | null
    imagenes: string[]
    colores: string[]
    tamanos: string[]
    stock: number
    categoria: { nombre: string; slug: string }
}

const benefits = [
    { icon: Truck, label: "Envío gratis +$50.000" },
    { icon: Shield, label: "Garantía de calidad" },
    { icon: RotateCcw, label: "Devolución fácil" },
]

export default function ProductoPage() {
    const params = useParams()
    const slug = params.slug as string
    const { agregarProducto, abrirCarrito } = useCarrito()

    const [producto, setProducto] = useState<Producto | null>(null)
    const [loading, setLoading] = useState(true)
    const [imagenActiva, setImagenActiva] = useState(0)
    const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null)
    const [tamanoSeleccionado, setTamanoSeleccionado] = useState<string | null>(null)
    const [cantidad, setCantidad] = useState(1)

    useEffect(() => {
        if (!slug) return
        api.get(`/productos/slug/${slug}`)
            .then(res => {
                setProducto(res.data)
                if (res.data.colores?.length) setColorSeleccionado(res.data.colores[0])
                if (res.data.tamanos?.length) setTamanoSeleccionado(res.data.tamanos[0])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [slug])

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
                </div>
            </>
        )
    }

    if (!producto) {
        return (
            <>
                <Header />
                <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h1>
                    <p className="text-gray-500 mb-6">No pudimos encontrar el producto</p>
                    <Link href="/tienda" className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600">
                        Volver a la tienda
                    </Link>
                </div>
            </>
        )
    }

    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    const handleAgregar = () => {
        const variante = [colorSeleccionado, tamanoSeleccionado].filter(Boolean).join(' - ') || undefined
        agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '', variante, cantidad })
        abrirCarrito()
    }

    return (
        <>
            <Header />
            <CarritoDrawer />
            <ModalUsuario />
            <div className="min-h-screen bg-gray-100">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <nav className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-teal-600">Inicio</Link>
                            <ChevronRight className="w-4 h-4" />
                            <Link href="/tienda" className="hover:text-teal-600">Tienda</Link>
                            {producto.categoria && (
                                <>
                                    <ChevronRight className="w-4 h-4" />
                                    <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="hover:text-teal-600">
                                        {producto.categoria.nombre}
                                    </Link>
                                </>
                            )}
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-gray-900">{producto.nombre}</span>
                        </nav>
                    </div>
                </div>

                {/* Product */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl p-6 lg:p-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Images */}
                            <div className="space-y-4">
                                <motion.div key={imagenActiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                    {producto.imagenes[imagenActiva] ? (
                                        <img src={producto.imagenes[imagenActiva]} alt={producto.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-24 h-24 text-gray-300" />
                                        </div>
                                    )}
                                </motion.div>
                                {producto.imagenes.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {producto.imagenes.map((img, i) => (
                                            <button key={i} onClick={() => setImagenActiva(i)}
                                                className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 ${i === imagenActiva ? 'border-teal-500' : 'border-gray-200'}`}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                {producto.categoria && <span className="text-sm text-gray-500 uppercase">{producto.categoria.nombre}</span>}
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1 mb-3">{producto.nombre}</h1>
                                {producto.descripcionCorta && <p className="text-gray-500 mb-4">{producto.descripcionCorta}</p>}

                                <div className="flex items-baseline gap-3 mb-4">
                                    <span className="text-3xl font-bold text-gray-900">${precio.toLocaleString('es-AR')}</span>
                                    {tieneOferta && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                                            <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-bold">{descuento}% OFF</span>
                                        </>
                                    )}
                                </div>

                                <p className="text-sm text-gray-500 mb-6">12 cuotas sin interés de ${Math.round(precio / 12).toLocaleString('es-AR')}</p>

                                {producto.colores?.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900 text-sm">Color</span>
                                            <span className="text-gray-500 text-sm">{colorSeleccionado}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.colores.map((c) => (
                                                <button key={c} onClick={() => setColorSeleccionado(c)}
                                                    className={`px-4 py-2 rounded-lg border text-sm ${colorSeleccionado === c ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {producto.tamanos?.length > 0 && (
                                    <div className="mb-4">
                                        <span className="font-medium text-gray-900 text-sm block mb-2">Tamaño</span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.tamanos.map((t) => (
                                                <button key={t} onClick={() => setTamanoSeleccionado(t)}
                                                    className={`px-4 py-2 rounded-lg border text-sm ${tamanoSeleccionado === t ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <span className="font-medium text-gray-900 text-sm block mb-2">Cantidad</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-medium text-gray-900">{cantidad}</span>
                                            <button onClick={() => setCantidad(cantidad + 1)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {producto.stock > 0 && (
                                            <span className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" /> Stock disponible</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-6">
                                    <motion.button onClick={handleAgregar} whileTap={{ scale: 0.98 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors">
                                        <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                                    </motion.button>
                                    <button className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300"><Heart className="w-5 h-5" /></button>
                                    <button className="w-12 h-12 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-teal-500 hover:border-teal-300"><Share2 className="w-5 h-5" /></button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
                                    {benefits.map((b, i) => (
                                        <div key={i} className="text-center">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                                                <b.icon className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <span className="text-xs text-gray-600">{b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {producto.descripcion && (
                        <div className="mt-6 bg-white rounded-xl p-6 lg:p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Descripción</h2>
                            <p className="text-gray-600">{producto.descripcion}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
