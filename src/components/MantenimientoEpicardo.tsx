"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Hammer, Ruler, Component, Thermometer, ArrowUpFromLine, Fan, RefreshCw, Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

type PrinterState = 'IDLE' | 'HEATING' | 'HOMING' | 'PRINTING' | 'COOLING' | 'FINISHED' | 'EJECT'

export default function MantenimientoEpicardo({ texto }: { texto: string }) {
    const [state, setState] = useState<PrinterState>('HEATING')
    const [progress, setProgress] = useState(0)
    const [nozzleTemp, setNozzleTemp] = useState(24)
    const [bedTemp, setBedTemp] = useState(24)
    const [fanSpeed, setFanSpeed] = useState(0)
    
    // Configuración Física Visual
    const TARGET_NOZZLE = 210
    const TARGET_BED = 60
    const TOTAL_LAYERS = 200
    // Altura máxima visual en px que tendrá la pieza al 100%
    const MAX_HEIGHT_PX = 120 

    useEffect(() => {
        let interval: NodeJS.Timeout
        
        const runCycle = () => {
            interval = setInterval(() => {
                setState(currentState => {
                    switch (currentState) {
                        case 'HEATING':
                            setNozzleTemp(p => { const n = p + (TARGET_NOZZLE - p) * 0.08; return n > TARGET_NOZZLE - 2 ? TARGET_NOZZLE : n })
                            setBedTemp(p => { const n = p + (TARGET_BED - p) * 0.05; return n > TARGET_BED - 1 ? TARGET_BED : n })
                            if (nozzleTemp > TARGET_NOZZLE - 5 && bedTemp > TARGET_BED - 2) return 'HOMING'
                            return 'HEATING'

                        case 'HOMING':
                            if (Math.random() > 0.92) return 'PRINTING'
                            return 'HOMING'

                        case 'PRINTING':
                            setFanSpeed(100)
                            setNozzleTemp(TARGET_NOZZLE + (Math.random() - 0.5) * 3)
                            
                            setProgress(prev => {
                                const next = prev + 0.15 
                                if (next >= 100) return 100
                                return next
                            })
                            
                            if (progress >= 100) return 'FINISHED'
                            return 'PRINTING'

                        case 'FINISHED':
                            setFanSpeed(0)
                            return 'COOLING'

                        case 'COOLING':
                            setNozzleTemp(prev => Math.max(24, prev - 3))
                            if (nozzleTemp < 100) return 'EJECT'
                            return 'COOLING'

                        case 'EJECT':
                            if (Math.random() > 0.96) {
                                setProgress(0)
                                return 'HEATING'
                            }
                            return 'EJECT'

                        default:
                            return 'HEATING'
                    }
                })
            }, 50)
        }

        runCycle()
        return () => clearInterval(interval)
    }, [nozzleTemp, bedTemp, progress])

    const currentHeightPx = (progress / 100) * MAX_HEIGHT_PX

    const getStatusText = () => {
        switch (state) {
            case 'HEATING': return `Calentando... E:${Math.floor(nozzleTemp)}° B:${Math.floor(bedTemp)}°`
            case 'HOMING': return "Homing X Y Z..."
            case 'PRINTING': return `Imprimiendo capa ${Math.floor((progress/100)*TOTAL_LAYERS)}/${TOTAL_LAYERS}`
            case 'FINISHED': return "Finalizado. Enfriando..."
            case 'COOLING': return "Enfriando hotend..."
            case 'EJECT': return "Retirando pieza..."
            default: return "Standby"
        }
    }

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden py-6 md:py-10">
            
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }} 
            />
            
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center">
                
                {/* 3D PRINTER SIMULATION STAGE */}
                <div className="relative w-80 h-96 mb-8 flex items-end justify-center pb-12">
                    
                    {/* Marco Estructural (Pillars) */}
                    <div className="absolute top-0 left-8 w-3 h-full bg-gray-800 rounded-t-lg border-l border-gray-700" />
                    <div className="absolute top-0 right-8 w-3 h-full bg-gray-800 rounded-t-lg border-r border-gray-700" />
                    <div className="absolute top-4 left-8 right-8 h-6 bg-gray-800 rounded-lg shadow-md z-0 flex items-center justify-center border-t border-gray-700">
                        <div className="text-[9px] font-black text-gray-600 tracking-[0.2em]">GRANA3D MK4</div>
                    </div>

                    {/* Cama Caliente (Bed) */}
                    {/* Ajustado: Perspective y Rotate para dar profundidad real */}
                    <div className="absolute bottom-8 w-64 h-56 perspective-1000 z-10">
                         <div className="w-full h-full bg-gray-900 border-4 border-gray-800 rounded-xl transform rotate-x-[60deg] shadow-2xl relative overflow-hidden origin-bottom">
                            {/* Superficie */}
                            <div className="absolute inset-0 bg-[#151515]" />
                            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]" />
                            {/* Logo Fantasma en Cama */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <div className="w-20 h-20 border-2 border-gray-500 rounded-full" />
                            </div>
                         </div>
                    </div>

                    {/* GRUPO Z: Pieza + Cabezal */}
                    {/* Contenedor relativo que alinea visualmente con el centro de la cama inclinada */}
                    <div className="absolute bottom-[4.5rem] w-full flex justify-center z-20">
                        
                        {/* PIEZA IMPRIMIÉNDOSE */}
                        <div className="relative flex items-end justify-center w-32">
                            <AnimatePresence mode="wait">
                                {state !== 'EJECT' && (
                                    <motion.div 
                                        key="piece"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ 
                                            height: Math.max(2, currentHeightPx),
                                            opacity: 1 
                                        }}
                                        exit={{ y: -50, opacity: 0, scale: 1.1, transition: { duration: 0.8, ease: "anticipate" } }}
                                        className="w-24 bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)] relative"
                                        style={{
                                            // Trapezio invertido sutil para compensar perspectiva
                                            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)', 
                                            background: 'linear-gradient(to bottom, #2dd4bf, #0f766e)',
                                        }}
                                    >
                                        {/* Brillo Capa Superior */}
                                        <div className="absolute top-0 w-full h-[2px] bg-white/80 shadow-[0_0_10px_white]" />
                                        
                                        {/* Textura de capas */}
                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_3px)]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* EJE X (Gantry) - Se mueve verticalmente */}
                        <motion.div 
                            className="absolute w-full px-6 pointer-events-none"
                            style={{ 
                                bottom: 0, // Base alineada con el suelo de la pieza
                                transformOrigin: 'bottom'
                            }}
                            animate={{ 
                                y: -currentHeightPx // Sube negativo (hacia arriba)
                            }}
                            transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                        >
                            {/* Riel X Horizontal */}
                            <div className="w-full h-8 bg-gray-800 border-y border-gray-700 shadow-xl relative flex items-center rounded-sm z-30">
                                {/* Correa */}
                                <div className="w-full h-2 bg-black opacity-50 mx-2 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_2px,black_2px,black_4px)]" />
                                
                                {/* CABEZAL (Hotend) - Se mueve horizontalmente */}
                                <motion.div 
                                    className="absolute h-20 w-14 bg-gray-800 rounded-lg border border-gray-600 shadow-2xl flex flex-col items-center z-40"
                                    style={{ 
                                        top: '-6px', 
                                        left: '50%', 
                                        marginLeft: '-28px' 
                                    }}
                                    animate={
                                        state === 'HOMING' ? { x: -60 } :
                                        state === 'PRINTING' ? { 
                                            x: [0, 35, -35, 15, -15, 0], 
                                        } : { x: 0 }
                                    }
                                    transition={{
                                        x: {
                                            duration: 2.5,
                                            repeat: state === 'PRINTING' ? Infinity : 0,
                                            repeatType: "mirror",
                                            ease: "linear"
                                        }
                                    }}
                                >
                                    {/* Ventilador */}
                                    <div className="mt-2 w-10 h-10 rounded bg-gray-900 border border-gray-700 flex items-center justify-center relative overflow-hidden">
                                        <Fan className={`w-8 h-8 text-gray-600 ${fanSpeed > 0 ? 'animate-spin' : ''}`} />
                                    </div>

                                    {/* Nozzle (Punta) - Debe tocar justo la pieza */}
                                    <div className="absolute -bottom-1.5 w-3 h-4 bg-[#eab308] clip-triangle shadow-sm z-10" style={{clipPath: 'polygon(20% 0, 80% 0, 50% 100%)'}} />
                                    
                                    {/* Partícula saliendo (Solo imprimiendo) */}
                                    {state === 'PRINTING' && (
                                        <motion.div 
                                            className="absolute -bottom-3 w-1 h-1 bg-white rounded-full"
                                            initial={{ opacity: 1, y: 0 }}
                                            animate={{ opacity: 0, y: 4 }}
                                            transition={{ duration: 0.1, repeat: Infinity }}
                                        />
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* DASHBOARD */}
                <div className="w-full max-w-2xl bg-[#111] border border-gray-800 rounded-2xl p-5 md:p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden mb-8 md:mb-12 mx-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${state === 'IDLE' ? 'bg-gray-600' : 'bg-teal-500 animate-pulse'}`} />
                            <div>
                                <h2 className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">ESTADO</h2>
                                <div className="text-lg md:text-xl font-mono font-bold text-white flex items-center gap-2">
                                    {state}
                                    {state === 'PRINTING' && <RefreshCw className="w-3 h-3 md:w-4 md:h-4 text-teal-500 animate-spin" />}
                                    {state === 'HEATING' && <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 animate-pulse" />}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-500 text-[10px] font-mono tracking-widest">TIEMPO</div>
                            <div className="text-lg md:text-xl font-mono text-white">00:{Math.floor(progress * 0.45).toString().padStart(2, '0')}</div>
                        </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="mb-8">
                        <div className="flex justify-between text-[10px] md:text-xs text-gray-400 font-mono mb-2">
                            <span className="truncate mr-2">{getStatusText()}</span>
                            <span>{Math.floor(progress)}%</span>
                        </div>
                        <div className="relative h-3 md:h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-inner">
                            <motion.div 
                                className="absolute h-full bg-gradient-to-r from-teal-600 to-teal-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "tween", ease: "linear" }}
                            />
                            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,black_10px,black_20px)]" />
                        </div>
                    </div>

                    {/* Datos Técnicos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <InfoBox icon={Thermometer} label="Nozzle" value={`${Math.floor(nozzleTemp)}°`} sub={`/ ${TARGET_NOZZLE}°`} color={nozzleTemp > 50 ? "text-red-400" : "text-white"} />
                        <InfoBox icon={Thermometer} label="Bed" value={`${Math.floor(bedTemp)}°`} sub={`/ ${TARGET_BED}°`} color={bedTemp > 40 ? "text-orange-400" : "text-white"} />
                        <InfoBox icon={Fan} label="Fan" value={`${fanSpeed}%`} sub={fanSpeed > 0 ? 'ON' : 'OFF'} />
                        <InfoBox icon={ArrowUpFromLine} label="Z-Axis" value={`${(progress * 0.15).toFixed(2)}`} sub="mm" />
                    </div>
                </div>

                {/* Main Text */}
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 text-center px-4">
                    Estamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Upgradeando</span><br/>
                    el Taller.
                </h1>
                <p className="text-sm md:text-base text-gray-400 mb-28 md:mb-12 max-w-lg leading-relaxed text-center px-6">
                    {texto || "Calibrando nuevas máquinas y cargando stock fresco. Volvemos con todo en unos instantes."}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg mb-20 md:mb-24 px-4 relative z-50">
                    <a href="https://wa.me/5491126354636" target="_blank" className="flex-1 py-3.5 md:py-4 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95">
                        <MessageCircle className="w-5 h-5" /> Pedido Manual
                    </a>
                    <a href="https://instagram.com/grana.3d" target="_blank" className="flex-1 py-3.5 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 active:scale-95">
                        <Instagram className="w-5 h-5" /> @grana.3d
                    </a>
                </div>

                {/* Footer Badges */}
                <div className="fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur border-t border-white/5 py-4 z-40">
                    <div className="flex justify-center gap-8 md:gap-12 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest overflow-x-auto px-4 no-scrollbar">
                        <div className="flex items-center gap-2 whitespace-nowrap"><Ruler className="w-3 h-3" /> Prototipado</div>
                        <div className="flex items-center gap-2 whitespace-nowrap"><Component className="w-3 h-3" /> Producción</div>
                        <div className="flex items-center gap-2 whitespace-nowrap"><Hammer className="w-3 h-3" /> Post-Procesado</div>
                    </div>
                </div>

            </div>
        </div>
    )
}

function InfoBox({ icon: Icon, label, value, sub, color = "text-white" }: any) {
    return (
        <div className="bg-gray-900/50 rounded-lg p-3 text-center border border-gray-800 flex flex-col items-center justify-center">
            <div className="text-[9px] text-gray-500 uppercase mb-1 flex items-center justify-center gap-1 w-full truncate">
                <Icon className="w-3 h-3" /> {label}
            </div>
            <div className={`font-mono text-base md:text-lg font-bold ${color}`}>{value}</div>
            <div className="text-[9px] text-gray-600">{sub}</div>
        </div>
    )
}
