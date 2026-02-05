"use client"
import { motion } from 'framer-motion'
import { Instagram, MessageCircle, Sparkles, Hammer, Rocket, Cog } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function MantenimientoEpicardo({ texto }: { texto: string }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return (
        <div className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center text-white selection:bg-teal-500 selection:text-black font-sans">
            
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div 
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] mix-blend-screen transition-transform duration-75"
                    style={{ transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)` }}
                />
                <div 
                    className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen transition-transform duration-75"
                    style={{ transform: `translate(${mousePosition.x * -0.05}px, ${mousePosition.y * -0.05}px)` }}
                />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                
                <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-3xl mx-auto mb-12 flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.5)] rotate-3"
                >
                    <Rocket className="w-12 h-12 md:w-16 md:h-16 text-black fill-black/20" />
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-8xl font-black mb-8 tracking-tighter"
                >
                    ALGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">EPICO</span><br/>
                    ESTA LLEGANDO
                </motion.h1>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-2xl mx-auto mb-12"
                >
                    <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-light border-l-4 border-teal-500 pl-6 text-left">
                        {texto || "Estamos actualizando nuestra plataforma para traerte una experiencia de impresión 3D de otro planeta. Volvemos en breve."}
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <a 
                        href="https://wa.me/5491112345678" 
                        target="_blank"
                        className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span>Escribinos por WhatsApp</span>
                        <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    
                    <a 
                        href="https://instagram.com/grana3d" 
                        target="_blank"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95 flex items-center gap-3 w-full sm:w-auto justify-center backdrop-blur-sm"
                    >
                        <Instagram className="w-5 h-5" />
                        <span>Seguinos en Instagram</span>
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex justify-center gap-8 text-xs font-bold text-gray-600 uppercase tracking-widest"
                >
                    <div className="flex items-center gap-2">
                        <Cog className="w-4 h-4 animate-spin-slow" /> Engineering
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-teal-500" /> Design
                    </div>
                    <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4" /> Manufacturing
                    </div>
                </motion.div>

            </div>
        </div>
    )
}
