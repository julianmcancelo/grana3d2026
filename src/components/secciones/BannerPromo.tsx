"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

interface BannerPromoProps {
    imagen?: string
    titulo?: string
    subtitulo?: string
    textoBoton?: string
    linkBoton?: string
    colorFondo?: string
}

export default function BannerPromo({
    imagen,
    titulo,
    subtitulo,
    textoBoton = 'Ver más',
    linkBoton = '/tienda',
    colorFondo = '#14b8a6'
}: BannerPromoProps) {
    return (
        <section className="py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-3xl"
                    style={{ backgroundColor: colorFondo }}
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-6">
                        {/* Content */}
                        <div className="text-center md:text-left">
                            {subtitulo && (
                                <span className="inline-block px-4 py-1 bg-white/20 text-white text-sm font-bold rounded-full mb-4">
                                    {subtitulo}
                                </span>
                            )}
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                                {titulo || 'Promoción Especial'}
                            </h3>
                            <Link
                                href={linkBoton}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                {textoBoton}
                            </Link>
                        </div>

                        {/* Image */}
                        {imagen && (
                            <div className="relative w-full md:w-1/3">
                                <img
                                    src={imagen}
                                    alt={titulo || 'Promoción'}
                                    className="w-full h-auto max-h-48 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </motion.div>
            </div>
        </section>
    )
}
