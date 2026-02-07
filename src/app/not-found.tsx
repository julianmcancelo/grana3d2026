"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 overflow-hidden relative">
            
            {/* Fondo Grid Animado */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10 text-center">
                {/* 404 Glitch Effect */}
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="relative inline-block"
                >
                    <h1 className="text-[150px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-800 leading-none select-none tracking-tighter">
                        404
                    </h1>
                    {/* Sombra Glitch */}
                    <div className="absolute top-0 left-1 text-[150px] md:text-[200px] font-black text-[#00AE42] opacity-50 mix-blend-screen animate-pulse -z-10 leading-none tracking-tighter blur-sm">
                        404
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        ¡Se nos terminó el filamento! 🧵
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        La página que buscás no existe o se perdió en el proceso de impresión. 
                        Mejor volvamos a calibrar la cama.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            href="/"
                            className="px-8 py-3 bg-[#00AE42] text-white font-bold rounded-xl hover:bg-[#008a34] transition-all shadow-lg hover:shadow-[#00AE42]/20 flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" /> Ir al Inicio
                        </Link>
                        <button 
                            onClick={() => window.history.back()}
                            className="px-8 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" /> Volver Atrás
                        </button>
                    </div>
                </motion.div>

                {/* Decoración 3D Abstracta */}
                <motion.div 
                    animate={{ 
                        rotate: [0, 360],
                        y: [0, -20, 0]
                    }}
                    transition={{ 
                        rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute -top-20 -right-20 w-32 h-32 border-4 border-[#00AE42]/20 rounded-full border-dashed opacity-50 -z-10 hidden md:block"
                />
                 <motion.div 
                    animate={{ 
                        rotate: [360, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ 
                        rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                        y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute -bottom-20 -left-20 w-48 h-48 border-2 border-white/10 rounded-full border-dashed opacity-30 -z-10 hidden md:block"
                />
            </div>
        </div>
    )
}
