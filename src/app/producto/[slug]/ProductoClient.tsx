"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check, Minus, Plus, Package, Image as ImageIcon, Star, CreditCard, ArrowLeft } from 'lucide-react'
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
        <div className="bg-transparent min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#00AE42] selection:text-white pb-32 lg:pb-0">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/tienda" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#00AE42] transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Volver a la tienda
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">

                    {/* Gallery Section - Bambu Clean Style */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                            <motion.div
                                layoutId={`product-image-${producto.id}`}
                                className="aspect-square relative flex items-center justify-center"
                            >
                                {tieneOferta && (
                                    <div className="absolute top-0 left-0 z-10 bg-[#00AE42] text-white px-3 py-1 rounded-md font-bold text-xs tracking-wider uppercase">
                                        -{descuento}% OFF
                                    </div>
                                )}
                                {producto.imagenes[imagenActiva] ? (
                                    <img src={producto.imagenes[imagenActiva]} alt={producto.nombre} className="w-full h-full object-contain max-h-[500px]" />
                                ) : (
                                    <ImageIcon className="w-24 h-24 text-gray-200 dark:text-gray-800" />
                                )}
                            </motion.div>
                        </div>

                        {producto.imagenes.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {producto.imagenes.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImagenActiva(i)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 bg-white dark:bg-[#111] p-1 transition-all ${i === imagenActiva ? 'border-[#00AE42]' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            <FeatureBox icon={Truck} title="Envío Gratis" sub="+$50.000" />
                            <FeatureBox icon={Shield} title="Garantía" sub="6 Meses" />
                            <FeatureBox icon={CreditCard} title="Cuotas" sub="Sin Interés" />
                            <FeatureBox icon={Package} title="Devolución" sub="30 Días" />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none">

                            <div className="mb-6">
                                {producto.categoria && (
                                    <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-[#00AE42] font-bold tracking-widest uppercase text-[10px] mb-3 inline-block hover:underline bg-[#00AE42]/10 px-2 py-1 rounded">
                                        {producto.categoria.nombre}
                                    </Link>
                                )}
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
                                    {producto.nombre}
                                </h1>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-gray-900 dark:text-white">${precio.toLocaleString('es-AR')}</span>
                                        {tieneOferta && (
                                            <span className="text-lg text-gray-400 line-through decoration-2">${producto.precio.toLocaleString('es-AR')}</span>
                                        )}
                                    </div>
                                    {tieneOferta && (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-1 rounded">
                                            OFERTA LIMITADA
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 mb-8">
                                {/* Selectores (Color/Tamaño) */}
                                {producto.colores?.length > 0 && (
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Color</span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.colores.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColorSeleccionado(c)}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${colorSeleccionado === c ? 'border-[#00AE42] text-[#00AE42] bg-[#00AE42]/5' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {producto.tamanos?.length > 0 && (
                                    <div>
                                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tamaño</span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.tamanos.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTamanoSeleccionado(t)}
                                                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${tamanoSeleccionado === t ? 'border-[#00AE42] text-[#00AE42] bg-[#00AE42]/5' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cantidad */}
                                <div>
                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cantidad</span>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{cantidad}</span>
                                            <button onClick={() => setCantidad(cantidad + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-500">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {producto.stock > 0 ? (
                                            <div className="flex items-center gap-2 text-[#00AE42] text-xs font-bold bg-[#00AE42]/10 px-3 py-1.5 rounded-full">
                                                <Check className="w-3 h-3" /> Stock Disponible
                                            </div>
                                        ) : (
                                            <div className="text-red-500 text-xs font-bold bg-red-500/10 px-3 py-1.5 rounded-full">Sin Stock</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-8">
                                <button
                                    onClick={handleAgregar}
                                    className="flex-1 py-3.5 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold rounded-lg shadow-lg hover:shadow-[#00AE42]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Agregar al Carrito
                                </button>
                                <button className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-400 hover:text-red-500">
                                    <Heart className="w-5 h-5" />
                                </button>
                            </div>

                            {producto.descripcion && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wider">Detalles</h3>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                        {producto.descripcion}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-40 pb-safe shadow-inverse">
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Total</div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">${(precio * cantidad).toLocaleString('es-AR')}</div>
                    </div>
                    <button
                        onClick={handleAgregar}
                        className="flex-[2] py-3 bg-[#00AE42] text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    )
}

function FeatureBox({ icon: Icon, title, sub }: any) {
    return (
        <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-xl flex flex-col items-center text-center gap-2 border border-transparent hover:border-[#00AE42]/30 transition-colors">
            <Icon className="w-6 h-6 text-[#00AE42]" />
            <div>
                <div className="font-bold text-xs text-gray-900 dark:text-white">{title}</div>
                <div className="text-[10px] text-gray-500">{sub}</div>
            </div>
        </div>
    )
}
