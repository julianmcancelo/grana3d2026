"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check, Minus, Plus, Package, Image as ImageIcon } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useCarrito } from '@/context/CarritoContext'

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

export default function ProductoClient({ producto }: { producto: Producto }) {
    const { agregarProducto, abrirCarrito } = useCarrito()

    const [imagenActiva, setImagenActiva] = useState(0)
    const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(
        producto.colores?.length ? producto.colores[0] : null
    )
    const [tamanoSeleccionado, setTamanoSeleccionado] = useState<string | null>(
        producto.tamanos?.length ? producto.tamanos[0] : null
    )
    const [cantidad, setCantidad] = useState(1)

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
                            <span className="text-gray-900 font-medium truncate max-w-[200px]">{producto.nombre}</span>
                        </nav>
                    </div>
                </div>

                {/* Product */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Images */}
                            <div className="space-y-4">
                                <motion.div key={imagenActiva} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative group">
                                    {producto.imagenes[imagenActiva] ? (
                                        <img src={producto.imagenes[imagenActiva]} alt={producto.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-24 h-24 text-gray-300" />
                                        </div>
                                    )}
                                </motion.div>
                                {producto.imagenes.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {producto.imagenes.map((img, i) => (
                                            <button key={i} onClick={() => setImagenActiva(i)}
                                                className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === imagenActiva ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div>
                                {producto.categoria && <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-sm text-teal-600 font-bold uppercase tracking-wider mb-2 inline-block hover:underline">{producto.categoria.nombre}</Link>}
                                <h1 className="text-2xl lg:text-4xl font-black text-gray-900 mt-1 mb-4 leading-tight">{producto.nombre}</h1>
                                {producto.descripcionCorta && <p className="text-gray-500 mb-6 text-lg leading-relaxed">{producto.descripcionCorta}</p>}

                                <div className="flex items-baseline gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <span className="text-4xl font-black text-gray-900">${precio.toLocaleString('es-AR')}</span>
                                    {tieneOferta && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                                            <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-bold shadow-sm">{descuento}% OFF</span>
                                        </>
                                    )}
                                </div>

                                <p className="text-sm text-gray-500 mb-8 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    12 cuotas sin interés de <strong className="text-gray-900">${Math.round(precio / 12).toLocaleString('es-AR')}</strong>
                                </p>

                                {producto.colores?.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-gray-900 text-sm">Color: <span className="font-normal text-gray-500">{colorSeleccionado}</span></span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.colores.map((c) => (
                                                <button key={c} onClick={() => setColorSeleccionado(c)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${colorSeleccionado === c ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'}`}>
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {producto.tamanos?.length > 0 && (
                                    <div className="mb-6">
                                        <span className="font-bold text-gray-900 text-sm block mb-3">Tamaño: <span className="font-normal text-gray-500">{tamanoSeleccionado}</span></span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.tamanos.map((t) => (
                                                <button key={t} onClick={() => setTamanoSeleccionado(t)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${tamanoSeleccionado === t ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'}`}>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <span className="font-bold text-gray-900 text-sm block mb-3">Cantidad</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-gray-900 text-lg">{cantidad}</span>
                                            <button onClick={() => setCantidad(cantidad + 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {producto.stock > 0 ? (
                                            <span className="text-sm text-green-600 flex items-center gap-1 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200"><Check className="w-4 h-4" /> Stock disponible</span>
                                        ) : (
                                            <span className="text-sm text-red-600 flex items-center gap-1 font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">Sin Stock</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-3 mb-8">
                                    <motion.button onClick={handleAgregar} whileTap={{ scale: 0.98 }}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-teal-600 text-white font-bold text-lg rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30">
                                        <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                                    </motion.button>
                                    <button className="w-14 h-14 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-all"><Heart className="w-6 h-6" /></button>
                                    <button className="w-14 h-14 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-teal-500 hover:border-teal-300 hover:bg-teal-50 transition-all"><Share2 className="w-6 h-6" /></button>
                                </div>

                                <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    {benefits.map((b, i) => (
                                        <div key={i} className="text-center">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 shadow-sm border border-gray-100">
                                                <b.icon className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-600">{b.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {producto.descripcion && (
                        <div className="mt-6 bg-white rounded-xl p-6 lg:p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Descripción del Producto</h2>
                            <div className="prose prose-teal max-w-none text-gray-600">
                                <p className="whitespace-pre-line">{producto.descripcion}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
