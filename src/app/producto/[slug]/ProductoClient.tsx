"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronRight, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Check, Minus, Plus, Package, Image as ImageIcon, Star, CreditCard, ArrowLeft, Box, Calendar, Clock } from 'lucide-react'
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
    esPreventa: boolean
    fechaLlegada?: string
    tiempoProduccion?: string
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
                        <div className="bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 p-8 shadow-sm relative group">
                            
                            {/* 3D Badge (Visual only for now) */}
                            <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur text-white px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Box className="w-3 h-3" /> Vista Previa
                            </div>

                            <motion.div
                                layoutId={`product-image-${producto.id}`}
                                className="aspect-square relative flex items-center justify-center cursor-zoom-in"
                            >
                                {tieneOferta && (
                                    <div className="absolute top-0 left-0 z-10 bg-[#00AE42] text-white px-3 py-1 rounded-md font-bold text-xs tracking-wider uppercase shadow-lg shadow-[#00AE42]/20">
                                        -{descuento}% OFF
                                    </div>
                                )}
                                {producto.imagenes[imagenActiva] ? (
                                    <div className="w-full h-full relative">
                                        <Image 
                                            src={producto.imagenes[imagenActiva]} 
                                            alt={producto.nombre} 
                                            fill
                                            priority
                                            className="object-contain p-4 drop-shadow-2xl transition-transform hover:scale-105 duration-500" 
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                ) : (
                                    <ImageIcon className="w-24 h-24 text-gray-200 dark:text-gray-800" />
                                )}
                            </motion.div>
                        </div>

                        {producto.imagenes.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                                {producto.imagenes.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setImagenActiva(i)}
                                        className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 bg-white dark:bg-[#111] p-1 transition-all snap-start relative ${i === imagenActiva ? 'border-[#00AE42] ring-2 ring-[#00AE42]/20 scale-105' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700 opacity-70 hover:opacity-100'}`}
                                    >
                                        <Image 
                                            src={img} 
                                            alt="" 
                                            fill
                                            className="object-cover rounded-lg" 
                                            sizes="100px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                            <FeatureBox icon={Truck} title="Envío Gratis" sub="En compras +$50.000" />
                            <FeatureBox icon={Shield} title="Garantía" sub="6 Meses Oficial" />
                            <FeatureBox icon={CreditCard} title="Cuotas" sub="3, 6 y 12 Sin Interés" />
                            <FeatureBox icon={Package} title="Devolución" sub="30 Días de Prueba" />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none relative overflow-hidden">
                            
                            {/* Glow Effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00AE42]/10 blur-[80px] rounded-full pointer-events-none" />

                            <div className="mb-6 relative z-10">
                                {producto.categoria && (
                                    <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-[#00AE42] font-bold tracking-widest uppercase text-[10px] mb-3 inline-block hover:underline bg-[#00AE42]/10 px-2 py-1 rounded transition-colors hover:bg-[#00AE42]/20">
                                        {producto.categoria.nombre}
                                    </Link>
                                )}
                                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                                    {producto.nombre}
                                </h1>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">${precio.toLocaleString('es-AR')}</span>
                                        {tieneOferta && (
                                            <span className="text-lg text-gray-400 line-through decoration-2 decoration-red-500/50">${producto.precio.toLocaleString('es-AR')}</span>
                                        )}
                                    </div>
                                    {tieneOferta && (
                                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                                            OFERTA FLASH
                                        </div>
                                    )}
                                </div>

                                {producto.esPreventa && (
                                    <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-bold text-blue-500 text-sm uppercase tracking-wide mb-1">Preventa Exclusiva</h4>
                                            <p className="text-sm text-blue-200/80">
                                                Reservá ahora. Fecha estimada de llegada: <strong className="text-white">{producto.fechaLlegada ? new Date(producto.fechaLlegada).toLocaleDateString('es-AR') : 'Próximamente'}</strong>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {producto.tiempoProduccion && (
                                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#161616] px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 w-fit">
                                        <Clock className="w-4 h-4 text-[#00AE42]" />
                                        <span>Tiempo de producción: <strong className="text-gray-900 dark:text-white">{producto.tiempoProduccion}</strong></span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8 mb-8 relative z-10">
                                {/* Selectores (Color/Tamaño) */}
                                {producto.colores?.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Color</span>
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{colorSeleccionado}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {producto.colores.map((c) => (
                                                <button
                                                    key={c}
                                                    onClick={() => setColorSeleccionado(c)}
                                                    className={`h-10 px-4 rounded-lg font-bold text-sm transition-all border-2 flex items-center justify-center min-w-[3rem] ${colorSeleccionado === c ? 'border-[#00AE42] text-[#00AE42] bg-[#00AE42]/5 shadow-[0_0_15px_rgba(0,174,66,0.2)]' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:scale-105'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {producto.tamanos?.length > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tamaño</span>
                                            <span className="text-xs font-bold text-[#00AE42] cursor-pointer hover:underline">Guía de talles</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {producto.tamanos.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTamanoSeleccionado(t)}
                                                    className={`h-10 px-4 rounded-lg font-bold text-sm transition-all border-2 flex items-center justify-center min-w-[3rem] ${tamanoSeleccionado === t ? 'border-[#00AE42] text-[#00AE42] bg-[#00AE42]/5 shadow-[0_0_15px_rgba(0,174,66,0.2)]' : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:scale-105'}`}
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
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#222] rounded-lg shadow-sm hover:scale-110 transition-transform text-gray-500">
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-4 text-center font-black text-lg text-gray-900 dark:text-white">{cantidad}</span>
                                            <button onClick={() => setCantidad(cantidad + 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#222] rounded-lg shadow-sm hover:scale-110 transition-transform text-gray-500">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        {producto.stock > 0 ? (
                                            <div className="flex items-center gap-2 text-[#00AE42] text-[10px] font-bold uppercase tracking-wide px-3">
                                                <div className="w-2 h-2 rounded-full bg-[#00AE42] animate-pulse" />
                                                Stock Disponible
                                            </div>
                                        ) : (
                                            <div className="text-red-500 text-[10px] font-bold uppercase tracking-wide px-3">Sin Stock</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mb-8 relative z-10">
                                <button
                                    onClick={handleAgregar}
                                    className={`flex-1 py-4 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-sm uppercase tracking-wide ${producto.esPreventa 
                                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 hover:shadow-blue-500/40' 
                                        : 'bg-[#00AE42] hover:bg-[#008a34] shadow-[#00AE42]/20 hover:shadow-[#00AE42]/40'}`}
                                >
                                    <ShoppingCart className="w-5 h-5" /> {producto.esPreventa ? 'Reservar Preventa' : 'Agregar al Carrito'}
                                </button>
                                <button className="w-14 h-14 rounded-xl border-2 border-gray-200 dark:border-gray-800 flex items-center justify-center hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-gray-400 hover:text-red-500 group">
                                    <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>

                            {producto.descripcion && (
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-6 relative z-10">
                                    <h3 className="text-xs font-black text-gray-900 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                                        <Package className="w-4 h-4 text-[#00AE42]" /> Especificaciones
                                    </h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#161616] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {producto.descripcion}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#111]/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 p-4 lg:hidden z-40 pb-safe shadow-inverse">
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white leading-none">${(precio * cantidad).toLocaleString('es-AR')}</div>
                    </div>
                    <button
                        onClick={handleAgregar}
                        className={`flex-[1.5] py-3.5 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 uppercase text-sm tracking-wide active:scale-95 transition-transform ${producto.esPreventa 
                            ? 'bg-blue-600 shadow-blue-500/20' 
                            : 'bg-[#00AE42] shadow-[#00AE42]/20'}`}
                    >
                        {producto.esPreventa ? 'Reservar' : 'Agregar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

function FeatureBox({ icon: Icon, title, sub }: any) {
    return (
        <div className="bg-gray-50 dark:bg-[#161616] p-4 rounded-2xl flex flex-col items-center text-center gap-3 border border-transparent hover:border-[#00AE42]/30 hover:bg-[#00AE42]/5 transition-all group cursor-default">
            <div className="w-10 h-10 rounded-full bg-[#00AE42]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-[#00AE42]" />
            </div>
            <div>
                <div className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wide mb-1">{title}</div>
                <div className="text-[10px] text-gray-500 font-medium">{sub}</div>
            </div>
        </div>
    )
}
