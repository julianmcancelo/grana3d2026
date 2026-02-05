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
        }, 5000)
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
        enter: (dir: number) => ({ x: dir > 0 ? 1000 : -1000, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir < 0 ? 1000 : -1000, opacity: 0 })
    }

    return (
        <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={current}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'tween', duration: 0.5 }}
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

                    {/* Overlay */}
                    {banner.overlay && (
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    )}

                    {/* Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex items-center">
                        <div className="max-w-2xl" style={{ color: banner.colorTexto || '#fff' }}>
                            {banner.subtitulo && (
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-block px-4 py-1 bg-teal-500/20 text-teal-400 text-sm font-bold rounded-full mb-4"
                                >
                                    {banner.subtitulo}
                                </motion.span>
                            )}

                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight"
                            >
                                {banner.titulo}
                            </motion.h2>

                            {banner.descripcion && (
                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg md:text-xl text-gray-300 mb-8"
                                >
                                    {banner.descripcion}
                                </motion.p>
                            )}

                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap gap-4"
                            >
                                {banner.textoBoton && banner.linkBoton && (
                                    <Link
                                        href={banner.linkBoton}
                                        className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all hover:scale-105"
                                    >
                                        {banner.textoBoton}
                                    </Link>
                                )}
                                {banner.textoBoton2 && banner.linkBoton2 && (
                                    <Link
                                        href={banner.linkBoton2}
                                        className="px-8 py-4 border-2 border-white/30 hover:border-white text-white font-bold rounded-xl transition-all hover:bg-white/10"
                                    >
                                        {banner.textoBoton2}
                                    </Link>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {banners.length > 1 && (
                <>
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-20"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all z-20"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                                className={`w-3 h-3 rounded-full transition-all ${i === current ? 'bg-teal-500 w-8' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}
