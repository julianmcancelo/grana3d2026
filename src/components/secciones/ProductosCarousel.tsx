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
    precioOferta?: number
    imagen?: string
    categoria: { nombre: string; slug: string }
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
        <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        {subtitulo && (
                            <span className="text-teal-500 font-bold text-sm uppercase tracking-wider">
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
                        const descuento = producto.precioOferta
                            ? Math.round((1 - producto.precioOferta / producto.precio) * 100)
                            : 0

                        return (
                            <motion.div
                                key={producto.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex-shrink-0 w-[280px] group"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                                    {/* Image */}
                                    <Link href={`/producto/${producto.slug}`} className="block relative aspect-square overflow-hidden">
                                        {descuento > 0 && (
                                            <span className="absolute top-3 left-3 z-10 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                                -{descuento}%
                                            </span>
                                        )}
                                        <img
                                            src={producto.imagen || '/placeholder.jpg'}
                                            alt={producto.nombre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </Link>

                                    {/* Content */}
                                    <div className="p-4">
                                        <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-xs font-medium text-teal-500 hover:text-teal-400 uppercase tracking-wider">
                                            {producto.categoria.nombre}
                                        </Link>
                                        <Link href={`/producto/${producto.slug}`}>
                                            <h3 className="font-bold text-gray-900 dark:text-white mt-1 line-clamp-2 hover:text-teal-500 transition-colors">
                                                {producto.nombre}
                                            </h3>
                                        </Link>

                                        {/* Rating placeholder */}
                                        <div className="flex items-center gap-1 mt-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">(12)</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-center justify-between mt-4">
                                            <div>
                                                {producto.precioOferta ? (
                                                    <>
                                                        <span className="text-gray-400 line-through text-sm">
                                                            ${producto.precio.toLocaleString()}
                                                        </span>
                                                        <span className="text-xl font-black text-teal-500 ml-2">
                                                            ${producto.precioOferta.toLocaleString()}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-xl font-black text-gray-900 dark:text-white">
                                                        ${producto.precio.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => agregarProducto({
                                                    id: producto.id,
                                                    nombre: producto.nombre,
                                                    precio: producto.precioOferta || producto.precio,
                                                    imagen: producto.imagen || '',
                                                    cantidad: 1
                                                })}
                                                className="p-3 bg-teal-500 hover:bg-teal-400 text-black rounded-xl transition-colors"
                                            >
                                                <ShoppingCart className="w-5 h-5" />
                                            </button>
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
