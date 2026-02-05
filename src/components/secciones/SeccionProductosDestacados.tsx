"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, ShoppingCart, Heart, Image as ImageIcon } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'

interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string }
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

function ProductCard({ producto }: { producto: Producto }) {
    const { agregarProducto } = useCarrito()
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    return (
        <motion.div variants={fadeInUp} className="group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-teal-500 hover:dark:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
            <Link href={`/producto/${producto.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {tieneOferta && (
                        <div className="absolute top-2 left-2 z-10 bg-teal-500 text-white dark:text-black text-xs font-bold px-2 py-1 rounded">
                            {descuento}% OFF
                        </div>
                    )}
                    {producto.imagenes[0] ? (
                        <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-700" /></div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur text-gray-700 dark:text-white rounded-full hover:bg-teal-500 hover:text-white dark:hover:text-black transition-colors shadow-sm">
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {producto.categoria && <span className="text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">{producto.categoria.nombre}</span>}
                    <h3 className="text-gray-900 dark:text-white font-bold mt-1 line-clamp-2 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{producto.nombre}</h3>

                    <div className="mt-3 flex items-baseline gap-2">
                        {tieneOferta ? (
                            <>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">${producto.precioOferta?.toLocaleString('es-AR')}</span>
                                <span className="text-sm text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">${producto.precio.toLocaleString('es-AR')}</span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        12 cuotas de <span className="text-gray-900 dark:text-white font-bold">${Math.round(precio / 12).toLocaleString('es-AR')}</span>
                    </p>
                </div>
            </Link>

            <div className="px-4 pb-4">
                <button onClick={() => agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '' })}
                    className="w-full py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-teal-500 hover:text-white dark:hover:text-black hover:border-teal-500 transition-all text-sm flex items-center justify-center gap-2 group/btn">
                    <ShoppingCart className="w-4 h-4 group-hover/btn:fill-current" /> Agregar
                </button>
            </div>
        </motion.div>
    )
}

export default function SeccionProductosDestacados({ productos, titulo, subtitulo }: { productos: Producto[], titulo?: string, subtitulo?: string }) {
    if (!productos || productos.length === 0) return null

    return (
        <section className="py-20 bg-gray-100 dark:bg-gray-900/30">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                        <div>
                            <span className="text-teal-600 dark:text-teal-500 font-bold tracking-wider text-sm uppercase mb-2 block">{subtitulo || 'Tendencias'}</span>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">{titulo || 'Lo más vendido'}</h2>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">Semana</button>
                            <button className="px-4 py-2 rounded-full bg-transparent text-gray-500 text-sm font-medium hover:text-gray-900 dark:hover:text-white transition-colors">Mes</button>
                        </div>
                    </div>
                    <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {productos.map((p) => <ProductCard key={p.id} producto={p} />)}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
