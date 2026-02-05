"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Hammer, Ruler, Component, Thermometer, Clock, ArrowUpFromLine } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MantenimientoEpicardo({ texto }: { texto: string }) {
    const [progress, setProgress] = useState(0)
    const [statusText, setStatusText] = useState("Inicializando...")
    const [nozzleTemp, setNozzleTemp] = useState(24)
    const [bedTemp, setBedTemp] = useState(20)

    // Simulación de datos de impresora
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) return 98
                // Acelera al principio, frena al final
                const increment = Math.random() * (prev < 50 ? 2 : 0.5)
                return Math.min(98, prev + increment)
            })

            // Simular temperaturas
            setNozzleTemp(prev => prev < 210 ? prev + Math.random() * 5 : 208 + Math.random() * 4)
            setBedTemp(prev => prev < 60 ? prev + Math.random() * 2 : 59 + Math.random() * 2)

        }, 100)

        return () => clearInterval(interval)
    }, [])

    // Cambiar texto de estado según progreso
    useEffect(() => {
        if (progress < 20) setStatusText("Calentando boquilla...")
        else if (progress < 40) setStatusText("Nivelando cama (Auto-leveling)...")
        else if (progress < 60) setStatusText("Imprimiendo perímetro externo...")
        else if (progress < 80) setStatusText("Rellenando infill (20%)...")
        else setStatusText("Finalizando capas superiores...")
    }, [progress])

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-sans selection:bg-teal-500 selection:text-white overflow-hidden">
            
            {/* Background: Technical Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.05]" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }} 
            />
            
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center flex flex-col items-center">
                
                {/* Visual: Realistic FDM Printing Animation */}
                <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                    
                    {/* Impresión (Objeto crecienco) */}
                    <div className="relative w-32 h-32 flex flex-col-reverse items-center justify-start overflow-hidden border-b-2 border-gray-700">
                        {/* Capas simuladas */}
                        <motion.div 
                            className="w-24 bg-teal-500/20 border border-teal-500/50"
                            initial={{ height: 0 }}
                            animate={{ height: "70%" }}
                            transition={{ duration: 4, ease: "linear", repeat: Infinity, repeatDelay: 1 }}
                        />
                        
                        {/* Patrón de Infill (Relleno) */}
                        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000_0px,#000_2px,transparent_2px,transparent_8px)]" />
                    </div>

                    {/* Cabezal / Nozzle Animado */}
                    <motion.div 
                        className="absolute w-8 h-12 top-[30%] left-1/2 -ml-4 z-20"
                        animate={{ 
                            x: [-40, 40, -40, 40, 0], 
                            y: [0, 0, -5, -5, -30] // Sube a medida que imprime
                        }}
                        transition={{ 
                            duration: 4, 
                            ease: "easeInOut", 
                            repeat: Infinity,
                            repeatDelay: 1
                        }}
                    >
                        {/* Cuerpo del Hotend */}
                        <div className="w-full h-full bg-gray-800 rounded-lg border border-gray-600 shadow-xl flex flex-col items-center relative">
                            {/* Fan */}
                            <div className="w-6 h-6 mt-1 rounded-full border border-gray-600 animate-spin-slow opacity-50 flex items-center justify-center">
                                <div className="w-4 h-0.5 bg-gray-500" />
                                <div className="w-4 h-0.5 bg-gray-500 rotate-90 absolute" />
                            </div>
                            {/* Punta Nozzle */}
                            <div className="absolute -bottom-2 w-2 h-2 bg-yellow-600 clip-triangle" style={{clipPath: 'polygon(0 0, 100% 0, 50% 100%)'}} />
                            
                            {/* Filamento saliendo (partículas) */}
                            <motion.div 
                                className="absolute -bottom-4 w-1 h-1 bg-teal-400 rounded-full"
                                animate={{ opacity: [0, 1, 0], y: [0, 10] }}
                                transition={{ duration: 0.2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Main Text */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl font-black tracking-tight mb-4"
                >
                    Estamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Imprimiendo</span><br/>
                    el Futuro.
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed"
                >
                    {texto || "Optimizando parámetros para una adhesión perfecta. Muy pronto podrás acceder a nuestra nueva tienda online."}
                </motion.p>

                {/* Live Printer Status (Interactivo) */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="w-full max-w-md bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12 backdrop-blur-sm"
                >
                    {/* Header Info */}
                    <div className="flex justify-between items-center mb-4 text-xs font-mono text-teal-500">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" /> ONLINE</span>
                        <span>GRANA-MK4</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2 flex justify-between text-xs font-bold text-gray-300">
                        <span>{statusText}</span>
                        <span>{Math.floor(progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden mb-6 relative">
                         {/* Striped progress */}
                        <motion.div 
                            className="h-full bg-gradient-to-r from-teal-600 to-teal-400 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:10px_10px] animate-[progress-stripes_1s_linear_infinite]" />
                        </motion.div>
                    </div>

                    {/* Telemetry Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-800 pt-4">
                        <div className="text-center">
                            <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1"><Thermometer className="w-3 h-3" /> Nozzle</div>
                            <div className="font-mono text-lg font-bold text-white">{Math.floor(nozzleTemp)}°C</div>
                        </div>
                        <div className="text-center border-l border-gray-800">
                            <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1"><ArrowUpFromLine className="w-3 h-3" /> Z-Axis</div>
                            <div className="font-mono text-lg font-bold text-white">{(progress * 0.15).toFixed(2)}mm</div>
                        </div>
                        <div className="text-center border-l border-gray-800">
                            <div className="text-[10px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Time</div>
                            <div className="font-mono text-lg font-bold text-white">-00:05</div>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons: Separated from badges */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg mb-24 relative z-20"
                >
                    <a 
                        href="https://wa.me/5491112345678" 
                        target="_blank"
                        className="flex-1 py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/20 flex items-center justify-center gap-2 group"
                    >
                        <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Pedido Manual</span>
                    </a>
                    <a 
                        href="https://instagram.com/grana.3d" 
                        target="_blank"
                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                    >
                        <Instagram className="w-5 h-5" />
                        <span>@grana.3d</span>
                    </a>
                </motion.div>

                {/* Footer Badges: Fixed Bottom & Clean */}
                <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-md border-t border-white/5 py-4 z-10">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex justify-center gap-8 md:gap-16 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest"
                    >
                        <div className="flex items-center gap-2 hover:text-teal-500 transition-colors cursor-default">
                            <Ruler className="w-4 h-4" /> Prototipado
                        </div>
                        <div className="flex items-center gap-2 hover:text-teal-500 transition-colors cursor-default">
                            <Component className="w-4 h-4" /> Producción
                        </div>
                        <div className="flex items-center gap-2 hover:text-teal-500 transition-colors cursor-default">
                            <Hammer className="w-4 h-4" /> Post-Procesado
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    )
}
