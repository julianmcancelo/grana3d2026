"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight, CreditCard, ShoppingCart, Heart, Image as ImageIcon, Star } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'

interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string }; variantes: any
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

    // Variant Logic
    const variantGroups = producto.variantes?.groups || [] as any[]
    const hasVariants = variantGroups.length > 0

    // Calculate min price
    let minPrice = precio
    if (hasVariants) {
        // Assume simplified logic: sum of min extras? Or just take the lowest combination?
        // This can be complex. Let's simplfy: The base price is usually the "starting" price.
        // But if there are negative extras (e.g. smaller size), we need to find the lowest possible price.
        // For now, let's look for the lowest single extra option across groups to show "Desde..." if applicable.
        // Better yet: just check if there are options with negative price.

        // Actually, simpler: Calculate min possible final price.
        // Iterate groups, find min extra in each group.
        let totalMinExtra = 0
        variantGroups.forEach((g: any) => {
            if (g.opciones.length > 0) {
                const minExtra = Math.min(...g.opciones.map((o: any) => o.precioExtra))
                // If the group is required (usually yes), we add the min extra.
                // For now, we assume one selection per group is required.
                totalMinExtra += minExtra
            }
        })
        minPrice = precio + totalMinExtra
    }

    return (
        <motion.div variants={fadeInUp} className="group bg-white dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-[#00AE42] dark:hover:border-[#00AE42] hover:shadow-[0_10px_40px_-10px_rgba(0,174,66,0.1)] transition-all duration-300 flex flex-col h-full">
            <Link href={`/producto/${producto.slug}`} className="flex-1 flex flex-col">
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

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        {producto.categoria && <span className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md uppercase tracking-wider font-bold">{producto.categoria.nombre}</span>}
                        <div className="flex text-yellow-500 ml-auto">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                        </div>
                    </div>

                    <h3 className="text-gray-900 dark:text-white font-bold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-[#00AE42] transition-colors">{producto.nombre}</h3>

                    {/* Variant Badges */}
                    {hasVariants && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {variantGroups.slice(0, 2).map((g: any) => (
                                <span key={g.id} className="text-[10px] text-gray-500 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded">
                                    {g.opciones.length} {g.nombre}s
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            {hasVariants && minPrice !== precio && (
                                <span className="text-[10px] text-gray-500 uppercase font-bold">Desde</span>
                            )}
                            <div className="flex items-baseline gap-2">
                                {tieneOferta ? (
                                    <>
                                        <span className="text-xl font-black text-gray-900 dark:text-white">${producto.precioOferta?.toLocaleString('es-AR')}</span>
                                        <span className="text-xs text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                                    </>
                                ) : (
                                    <span className="text-xl font-black text-gray-900 dark:text-white">${minPrice.toLocaleString('es-AR')}</span>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                agregarProducto({ id: producto.id, nombre: producto.nombre, precio: minPrice, imagen: producto.imagenes[0] || '' })
                            }}
                            className="p-3 bg-[#1a1a1a] text-white rounded-xl hover:bg-[#00AE42] transition-all shadow-lg hover:shadow-[#00AE42]/20"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                    </div>
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
