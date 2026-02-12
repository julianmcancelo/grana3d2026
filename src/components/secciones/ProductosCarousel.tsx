"use client"
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

interface Producto {
    id: string
    nombre: string
    slug: string
    precio: number
    precioOferta?: number | null
    imagen?: string
    imagenes: string[]
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
                    {productos.map((producto, index) => (
                        <motion.div
                            key={producto.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex-shrink-0 w-[280px]"
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            <div className="h-full">
                                <ProductCard producto={producto} compact={true} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
