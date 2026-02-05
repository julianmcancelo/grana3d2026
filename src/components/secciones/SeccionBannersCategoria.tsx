"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'

interface Categoria {
    id: string
    nombre: string
    slug: string;
    descripcion: string;
    imagen?: string;
    icono?: string;
    color?: string
}

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

function CategoryCard({ categoria, index }: { categoria: Categoria; index: number }) {
    const gradients = [
        "from-teal-500/10 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20",
        "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
        "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
        "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
    ]
    const gradient = gradients[index % gradients.length]

    return (
        <motion.div variants={fadeInUp}>
            <Link href={`/tienda?categoria=${categoria.slug}`}>
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-gray-200 dark:border-white/10 p-6 hover:border-teal-500 hover:dark:border-teal-500/50 transition-all group cursor-pointer h-full shadow-sm dark:shadow-none`}>
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors" />
                    <div className="relative z-10">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm"
                            style={{ backgroundColor: categoria.color ? `${categoria.color}20` : 'rgba(255,255,255,0.1)' }}
                        >
                            <Package className="w-6 h-6" style={{ color: categoria.color || '#14b8a6' }} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{categoria.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{categoria.descripcion || 'Explorar productos'}</p>
                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                            Ver catálogo <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function SeccionBannersCategoria({ categorias, titulo, subtitulo }: { categorias: Categoria[], titulo?: string, subtitulo?: string }) {
    if (!categorias || categorias.length === 0) return null

    return (
        <section className="py-20 relative">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-teal-500/5 blur-[100px] pointer-events-none rounded-l-full" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{titulo || 'Explorá por Categorías'}</h2>
                            {subtitulo && <p className="text-gray-600 dark:text-gray-400">{subtitulo}</p>}
                        </div>
                        <Link href="/tienda" className="hidden sm:flex items-center gap-2 text-teal-600 dark:text-teal-500 font-bold hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                            Ver todas <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categorias.slice(0, 6).map((cat, i) => <CategoryCard key={cat.id} categoria={cat} index={i} />)}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
