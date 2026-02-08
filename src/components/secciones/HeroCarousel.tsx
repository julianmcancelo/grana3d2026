"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface Banner {
    id: string
    titulo: string
    subtitulo?: string
    descripcion?: string
    imagen: string
    imagenMovil?: string
    textoBoton?: string
    linkBoton?: string
    textoBoton2?: string
    linkBoton2?: string
    colorFondo?: string
    colorTexto?: string
    overlay: boolean
}

interface HeroCarouselProps {
    banners: Banner[]
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(0)

    useEffect(() => {
        if (banners.length <= 1) return
        const timer = setInterval(() => {
            setDirection(1)
            setCurrent((prev) => (prev + 1) % banners.length)
        }, 6000)
        return () => clearInterval(timer)
    }, [banners.length])

    const paginate = (newDirection: number) => {
        setDirection(newDirection)
        setCurrent((prev) => {
            if (newDirection === 1) return (prev + 1) % banners.length
            return (prev - 1 + banners.length) % banners.length
        })
    }

    if (!banners || banners.length === 0) return null

    const banner = banners[current]

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 })
    }

    return (
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden bg-black group">
            <AnimatePresence initial={false} custom={direction} mode='popLayout'>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${banner.imagen})`,
                            backgroundColor: banner.colorFondo || '#000'
                        }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex items-center">
                        <div className="max-w-3xl pt-20">
                            {banner.subtitulo && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="inline-flex items-center gap-2 mb-6"
                                >
                                    <span className="w-12 h-[2px] bg-[#00AE42]"></span>
                                    <span className="text-[#00AE42] font-bold tracking-[0.2em] uppercase text-sm md:text-base">
                                        {banner.subtitulo}
                                    </span>
                                </motion.div>
                            )}

                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                style={{ color: banner.colorTexto || '#fff' }}
                                className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter"
                            >
                                {banner.titulo}
                            </motion.h2>

                            {banner.descripcion && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl font-light leading-relaxed"
                                >
                                    {banner.descripcion}
                                </motion.p>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-4"
                            >
                                {banner.textoBoton && banner.linkBoton && (
                                    <Link
                                        href={banner.linkBoton}
                                        className="px-10 py-4 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,174,66,0.3)] hover:shadow-[0_0_30px_rgba(0,174,66,0.5)]"
                                    >
                                        {banner.textoBoton}
                                    </Link>
                                )}
                                {banner.textoBoton2 && banner.linkBoton2 && (
                                    <Link
                                        href={banner.linkBoton2}
                                        className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10 font-bold rounded-full transition-all hover:scale-105"
                                    >
                                        {banner.textoBoton2}
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Modern Navigation */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:border-[#00AE42]"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/20 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all opacity-0 group-hover:opacity-100 border border-white/10 hover:border-[#00AE42]"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Progress Indicators */}
                    <div className="absolute bottom-10 left-12 flex items-center gap-3 z-20">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                                className={`h-1 rounded-full transition-all duration-300 ${i === current ? 'bg-[#00AE42] w-12' : 'bg-white/30 w-6 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}
