"use client"
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import { useCarrito } from '@/context/CarritoContext'

interface Producto {
    id: string
    nombre: string
    slug: string
    precio: number
    precioOferta?: number | null
    imagen?: string
    categoria: { nombre: string; slug: string }
    variantes?: any
}

interface ProductosCarouselProps {
    productos: Producto[]
    titulo?: string
    subtitulo?: string
}

export default function ProductosCarousel({ productos, titulo, subtitulo }: ProductosCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const { agregarProducto } = useCarrito()

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 320
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (!productos || productos.length === 0) return null

    return (
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-[#111]">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {subtitulo && (
                            <span className="text-[#00AE42] font-bold text-sm uppercase tracking-wider block mb-2">
                                {subtitulo}
                            </span>
                        )}
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                            {titulo || 'Productos'}
                        </h2>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {productos.map((producto, index) => {
                        const precio = producto.precioOferta || producto.precio
                        const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
                        const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

                        // Variant Logic
                        const variantGroups = producto.variantes?.groups || [] as any[]
                        const hasVariants = variantGroups.length > 0

                        let minPrice = precio
                        if (hasVariants) {
                            let totalMinExtra = 0
                            variantGroups.forEach((g: any) => {
                                if (g.opciones.length > 0) {
                                    const minExtra = Math.min(...g.opciones.map((o: any) => o.precioExtra))
                                    totalMinExtra += minExtra
                                }
                            })
                            minPrice = precio + totalMinExtra
                        }

                        // Fix pluralization: "Tamaño" -> "Tamaños", but "Color" -> "Colores" if handled, 
                        // simpler: just append 's' if not ending in s, or specific check.
                        // User image showed "Tamañoss" which implies just appending 's' to "Tamaños". 
                        // We should fix this. If name is "Tamaño", badge should say "Tamaños".
                        const formatPlural = (name: string) => {
                            if (name.toLowerCase() === 'tamaño') return 'Tamaños'
                            if (name.endsWith('s')) return name
                            return name + 's'
                        }

                        return (
                            <motion.div
                                key={producto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0 w-[260px] group"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#00AE42]/10 transition-all duration-300 border border-gray-100 dark:border-gray-800 hover:border-[#00AE42] dark:hover:border-[#00AE42] h-full flex flex-col">
                                    {/* Image */}
                                    <Link href={`/producto/${producto.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-[#111]">
                                        {tieneOferta && (
                                            <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-[#00AE42] text-white text-[10px] font-bold rounded-sm uppercase tracking-wide">
                                                -{descuento}%
                                            </span>
                                        )}
                                        {producto.imagen ? (
                                            <img
                                                src={producto.imagen}
                                                alt={producto.nombre}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111]">
                                                <span className="text-gray-400 text-xs">Sin imagen</span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-[10px] font-bold text-[#00AE42] uppercase tracking-wider mb-1">
                                            {producto.categoria.nombre}
                                        </Link>
                                        <Link href={`/producto/${producto.slug}`}>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-3 line-clamp-2 group-hover:text-[#00AE42] transition-colors">
                                                {producto.nombre}
                                            </h3>
                                        </Link>

                                        {/* Variant Badges */}
                                        {hasVariants && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {variantGroups.slice(0, 2).map((g: any) => (
                                                    <span key={g.id} className="text-[10px] text-gray-500 border border-gray-700/50 px-2 py-1 rounded-md">
                                                        {g.opciones.length} {formatPlural(g.nombre)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                {hasVariants && minPrice !== precio && (
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase mb-0.5">DESDE</span>
                                                )}
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xl font-black text-gray-900 dark:text-white">
                                                        ${minPrice.toLocaleString('es-AR')}
                                                    </span>
                                                    {tieneOferta && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ${producto.precio.toLocaleString('es-AR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
