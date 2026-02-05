"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Banner {
    id: string
    titulo: string
    descripcion?: string
    etiqueta?: string
    link?: string
    textoBoton?: string
    colorFondo: string
    imagen?: string // Optional if we use background image
}

interface BannerPromoProps {
    banners: Banner[]
}

export default function BannerPromo({ banners }: BannerPromoProps) {
    if (!banners || banners.length === 0) return null

    return (
        <section className="py-10">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-6">
                    {banners.map((banner) => (
                        <Link
                            key={banner.id}
                            href={banner.link || '#'}
                            target={banner.link?.startsWith('http') ? "_blank" : "_self"}
                            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.colorFondo || 'from-teal-600 to-teal-800'} p-8 md:p-12 border border-white/10 group shadow-lg block hover:scale-[1.02] transition-transform`}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                {banner.etiqueta && (
                                    <span className="inline-block px-3 py-1 rounded bg-white/10 text-xs font-bold text-white/80 mb-4 tracking-wider uppercase">
                                        {banner.etiqueta}
                                    </span>
                                )}
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.titulo}</h3>
                                {banner.descripcion && <p className="text-white/70 mb-6 max-w-xs">{banner.descripcion}</p>}
                                {banner.textoBoton && (
                                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg group-hover:bg-gray-100 transition-colors">
                                        {banner.textoBoton} <ChevronRight className="w-4 h-4" />
                                    </span>
                                )}
                            </div>
                            {banner.imagen && (
                                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-50 mix-blend-overlay">
                                    <img src={banner.imagen} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
