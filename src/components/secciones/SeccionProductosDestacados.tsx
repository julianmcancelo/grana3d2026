"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import ProductCard from '@/components/ProductCard'

interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string; slug: string }; variantes: any
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
                        {productos.map((p) => (
                            <motion.div key={p.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <ProductCard producto={p} />
                            </motion.div>
                        ))}
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
