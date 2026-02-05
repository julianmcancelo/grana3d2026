"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Printer, Box, Sparkles, Puzzle, Gamepad2, Gift, Cpu, Wrench } from 'lucide-react'

interface Categoria {
    id: string
    nombre: string
    slug: string
    imagen?: string
    icono?: string
    color?: string
}

interface CategoriasRapidasProps {
    categorias: Categoria[]
    titulo?: string
}

// Map de iconos disponibles
const iconMap: Record<string, any> = {
    printer: Printer,
    box: Box,
    sparkles: Sparkles,
    puzzle: Puzzle,
    gamepad: Gamepad2,
    gift: Gift,
    cpu: Cpu,
    wrench: Wrench,
}

export default function CategoriasRapidas({ categorias, titulo }: CategoriasRapidasProps) {
    if (!categorias || categorias.length === 0) return null

    return (
        <section className="py-12 md:py-16 bg-white dark:bg-black">
            <div className="max-w-7xl mx-auto px-4">
                {titulo && (
                    <h2 className="text-3xl font-black text-center text-gray-900 dark:text-white mb-10">
                        {titulo}
                    </h2>
                )}

                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {categorias.map((cat, index) => {
                        const IconComponent = iconMap[cat.icono || 'box'] || Box
                        const bgColor = cat.color || '#14b8a6'

                        return (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/tienda?categoria=${cat.slug}`}
                                    className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-all group"
                                >
                                    <div
                                        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                                        style={{ backgroundColor: `${bgColor}20` }}
                                    >
                                        {cat.imagen ? (
                                            <img src={cat.imagen} alt={cat.nombre} className="w-10 h-10 object-contain" />
                                        ) : (
                                            <IconComponent className="w-8 h-8" style={{ color: bgColor }} />
                                        )}
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 text-center line-clamp-2">
                                        {cat.nombre}
                                    </span>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
