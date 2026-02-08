"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, ShoppingCart, Heart, Image as ImageIcon, Star } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'

interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string }
}

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" as const } },
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

function ProductCard({ producto }: { producto: Producto }) {
    const { agregarProducto } = useCarrito()
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    return (
        <motion.div variants={fadeInUp} className="group bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#00AE42] dark:hover:border-[#00AE42] hover:shadow-[0_10px_40px_-10px_rgba(0,174,66,0.1)] transition-all duration-300">
            <Link href={`/producto/${producto.slug}`}>
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {tieneOferta && (
                        <div className="absolute top-3 left-3 z-10 bg-[#00AE42] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-sm">
                            {descuento}% OFF
                        </div>
                    )}
                    {producto.imagenes[0] ? (
                        <>
                            <img src={producto.imagenes[0]} alt={producto.nombre} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            {/* Overlay en hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-700" /></div>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <button className="p-2.5 bg-white dark:bg-black text-gray-900 dark:text-white rounded-xl hover:bg-[#00AE42] hover:text-white transition-colors shadow-lg">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                        {producto.categoria && <span className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md uppercase tracking-wider font-bold">{producto.categoria.nombre}</span>}
                        <div className="flex text-yellow-500">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                    </div>

                    <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-[#00AE42] transition-colors">{producto.nombre}</h3>

                    <div className="flex items-baseline gap-2 mb-4">
                        {tieneOferta ? (
                            <>
                                <span className="text-2xl font-black text-gray-900 dark:text-white">${producto.precioOferta?.toLocaleString('es-AR')}</span>
                                <span className="text-sm text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                            </>
                        ) : (
                            <span className="text-2xl font-black text-gray-900 dark:text-white">${producto.precio.toLocaleString('es-AR')}</span>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '' })
                        }}
                        className="w-full py-3 bg-[#1a1a1a] text-white font-bold rounded-xl hover:bg-[#00AE42] transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> Agregar al Carrito
                        </span>
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}

export default function SeccionProductosDestacados({ productos, titulo, subtitulo }: { productos: Producto[], titulo?: string, subtitulo?: string }) {
    if (!productos || productos.length === 0) return null

    return (
        <section className="py-24 bg-white dark:bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div>
                            <span className="text-[#00AE42] font-bold tracking-[0.2em] uppercase text-xs mb-3 block flex items-center gap-2">
                                <span className="w-8 h-[2px] bg-[#00AE42]"></span>
                                {subtitulo || 'Selección Exclusiva'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">{titulo || 'Destacados'}</h2>
                        </div>
                        <Link href="/tienda" className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#00AE42] transition-colors group">
                            Vér todo el catálogo <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <motion.div variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {productos.map((p) => <ProductCard key={p.id} producto={p} />)}
                    </motion.div>

                    <div className="mt-12 text-center md:hidden">
                        <Link href="/tienda" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#00AE42] transition-colors">
                            Vér todo el catálogo <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
