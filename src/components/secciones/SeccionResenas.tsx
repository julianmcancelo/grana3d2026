"use client"
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Resena {
    id: string
    nombre: string
    texto: string
    rating: number
    imagen?: string
}

interface SeccionResenasProps {
    resenas: Resena[]
    titulo?: string
    subtitulo?: string
}

export default function SeccionResenas({ resenas, titulo, subtitulo }: SeccionResenasProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 380
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    if (!resenas || resenas.length === 0) return null

    return (
        <section className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    {subtitulo && (
                        <span className="text-teal-500 font-bold text-sm uppercase tracking-wider">
                            {subtitulo}
                        </span>
                    )}
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mt-2">
                        {titulo || 'Lo que dicen nuestros clientes'}
                    </h2>
                    <div className="flex items-center justify-center gap-1 mt-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="ml-2 text-gray-600 dark:text-gray-400 font-medium">
                            4.9/5 basado en {resenas.length}+ reseñas
                        </span>
                    </div>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:block"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {resenas.map((resena, index) => (
                            <motion.div
                                key={resena.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex-shrink-0 w-[350px]"
                                style={{ scrollSnapAlign: 'start' }}
                            >
                                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-full relative">
                                    <Quote className="absolute top-6 right-6 w-10 h-10 text-teal-500/20" />

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < resena.rating
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Text */}
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                                        "{resena.texto}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        {resena.imagen ? (
                                            <img
                                                src={resena.imagen}
                                                alt={resena.nombre}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                                {resena.nombre.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                {resena.nombre}
                                            </h4>
                                            <p className="text-sm text-gray-500">Cliente verificado</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:block"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>
            </div>
        </section>
    )
}
