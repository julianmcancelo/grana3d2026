"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, Zap } from 'lucide-react'
import api from '@/lib/api'

interface Novedad {
    id: string
    titulo: string
    contenido: string
    imagen: string | null
    fechaPublicacion: string
}

export default function Novedades() {
    const [novedades, setNovedades] = useState<Novedad[]>([
        {
            id: '1',
            titulo: '¡Llegaron los nuevos filamentos Silk!',
            contenido: 'Acabamos de recibir una partida de filamentos PLA Silk en colores Oro, Plata y Cobre. Ideales para piezas decorativas que requieran un brillo metálico espectacular.',
            imagen: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1000&auto=format&fit=crop',
            fechaPublicacion: new Date().toISOString()
        },
        {
            id: '2',
            titulo: 'Descuento especial en Resina',
            contenido: 'Toda la semana, 15% OFF en impresiones de resina 8K. Si tenés miniaturas o joyería para imprimir, es el momento.',
            imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
            fechaPublicacion: new Date().toISOString()
        },
        {
            id: '3',
            titulo: 'Nuevo servicio de escaneo 3D',
            contenido: 'Incorporamos un escáner 3D de alta precisión. Traenos tu pieza física y la digitalizamos para replicarla o modificarla.',
            imagen: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1000&auto=format&fit=crop',
            fechaPublicacion: new Date().toISOString()
        }
    ])

    useEffect(() => {
        api.get('/novedades')
            .then(res => {
                if (res.data && res.data.length > 0) {
                    setNovedades(res.data)
                }
            })
            .catch(err => console.error("Usando novedades por defecto", err))
    }, [])

    if (novedades.length === 0) return null

    return (
        <section className="py-24 bg-white dark:bg-black/50 border-t border-gray-100 dark:border-white/5 relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex items-center gap-3 mb-12">
                    <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg text-teal-600 dark:text-teal-400">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Novedades <span className="text-teal-500">Live</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {novedades.map((novedad, i) => (
                        <motion.div
                            key={novedad.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex flex-col h-full bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:border-teal-500/50 hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300"
                        >
                            {novedad.imagen && (
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10 opacity-60" />
                                    <img 
                                        src={novedad.imagen} 
                                        alt={novedad.titulo} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 text-xs font-medium text-white/90 bg-black/50 backdrop-blur px-2 py-1 rounded-md">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(novedad.fechaPublicacion).toLocaleDateString()}
                                    </div>
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-teal-500 transition-colors">
                                    {novedad.titulo}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 flex-1">
                                    {novedad.contenido}
                                </p>
                                <button className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:gap-3 transition-all self-start">
                                    Leer más <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
