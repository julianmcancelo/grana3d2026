"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check, Minus, Plus, Package, Image as ImageIcon, Star, CreditCard } from 'lucide-react'
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
        <div className="bg-[#FAFAFA] dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white pb-32 lg:pb-0">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            <main className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                    <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/tienda" className="hover:text-black dark:hover:text-white transition-colors">Tienda</Link>
                    {producto.categoria && (
                        <>
                            <ChevronRight className="w-3 h-3" />
                            <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="hover:text-black dark:hover:text-white transition-colors font-medium">
                                {producto.categoria.nombre}
                            </Link>
                        </>
                    )}
                </nav>

                <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

                    {/* Gallery Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <motion.div
                            layoutId={`product-image-${producto.id}`}
                            className="aspect-[4/3] lg:aspect-square bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 relative shadow-2xl shadow-gray-200/50 dark:shadow-none"
                        >
                            {tieneOferta && (
                                <div className="absolute top-6 left-6 z-10 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-black text-xs tracking-widest uppercase">
                                    {descuento}% OFF
                                </div>
                            )}
                            {producto.imagenes[imagenActiva] ? (
                                <img src={producto.imagenes[imagenActiva]} alt={producto.nombre} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-24 h-24 text-gray-200 dark:text-gray-800" /></div>
                            )}
                        </motion.div>

                        {producto.imagenes.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {producto.imagenes.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImagenActiva(i)}
                                        className={`snap-start w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${i === imagenActiva ? 'border-teal-500 ring-4 ring-teal-500/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="hidden lg:grid grid-cols-3 gap-6 pt-12 border-t border-gray-100 dark:border-white/5">
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400"><Truck className="w-6 h-6" /></div>
                                <div className="font-bold text-sm">Envío Gratis</div>
                                <div className="text-xs text-gray-500">Superando $50.000</div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400"><Shield className="w-6 h-6" /></div>
                                <div className="font-bold text-sm">Garantía Total</div>
                                <div className="text-xs text-gray-500">6 meses de cobertura</div>
                            </div>
                            <div className="flex flex-col items-center text-center gap-3">
                                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400"><CreditCard className="w-6 h-6" /></div>
                                <div className="font-bold text-sm">Cuotas S/Interés</div>
                                <div className="text-xs text-gray-500">Con todos los bancos</div>
                            </div>
                        </div>
                    </div>

                    {/* Info Section - Sticky on Desktop */}
                    <div className="lg:col-span-5 relative">
                        <div className="lg:sticky lg:top-24 space-y-8">

                            <div>
                                {producto.categoria && (
                                    <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-teal-600 dark:text-teal-400 font-bold tracking-widest uppercase text-xs mb-4 inline-block hover:underline">
                                        {producto.categoria.nombre}
                                    </Link>
                                )}
                                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-4">
                                    {producto.nombre}
                                </h1>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">(12 reseñas)</span>
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-5xl font-black text-gray-900 dark:text-white">${precio.toLocaleString('es-AR')}</span>
                                    {tieneOferta && (
                                        <span className="text-xl text-gray-400 line-through font-medium">${producto.precio.toLocaleString('es-AR')}</span>
                                    )}
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-white/5" />

                            <div className="space-y-6">
                                {producto.colores?.length > 0 && (
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Color</span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.colores.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColorSeleccionado(c)}
                                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${colorSeleccionado === c ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {producto.tamanos?.length > 0 && (
                                    <div>
                                        <span className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Tamaño</span>
                                        <div className="flex flex-wrap gap-2">
                                            {producto.tamanos.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTamanoSeleccionado(t)}
                                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${tamanoSeleccionado === t ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <span className="block text-sm font-bold text-gray-900 dark:text-white mb-3">Cantidad</span>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-gray-100 dark:bg-white/5 rounded-full p-1">
                                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-12 text-center font-bold text-lg">{cantidad}</span>
                                            <button onClick={() => setCantidad(cantidad + 1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 transition-colors">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {producto.stock > 0 ? (
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Stock Disponible
                                            </div>
                                        ) : (
                                            <div className="text-red-500 text-sm font-bold">Sin Stock</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={handleAgregar}
                                    className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-black text-lg rounded-full shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
                                >
                                    <ShoppingCart className="w-5 h-5" /> Agregar
                                </button>
                                <button className="w-14 h-14 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>

                            {producto.descripcion && (
                                <div className="pt-8 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                                    <h3 className="text-gray-900 dark:text-white font-bold mb-4">Descripción</h3>
                                    {producto.descripcion}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/5 p-4 lg:hidden z-40 pb-safe">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-xl font-black text-gray-900 dark:text-white">${(precio * cantidad).toLocaleString('es-AR')}</div>
                    </div>
                    <button
                        onClick={handleAgregar}
                        className="flex-[2] py-3 bg-teal-500 text-white font-bold rounded-full shadow-lg flex items-center justify-center gap-2"
                    >
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    )
}
