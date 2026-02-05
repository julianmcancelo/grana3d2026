"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, MessageCircle, Hammer, Ruler, Component, Thermometer, ArrowUpFromLine, Fan, RefreshCw, Zap, Mail, ArrowRight, Loader2, Check, Box, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { suscribirNewsletter } from '@/app/actions'

type PrinterState = 'IDLE' | 'HEATING' | 'HOMING' | 'PRINTING' | 'COOLING' | 'FINISHED' | 'EJECT'

export default function MantenimientoEpicardo({ texto }: { texto: string }) {
    const [state, setState] = useState<PrinterState>('HEATING')
    const [progress, setProgress] = useState(0)
    const [nozzleTemp, setNozzleTemp] = useState(24)
    const [bedTemp, setBedTemp] = useState(24)
    const [fanSpeed, setFanSpeed] = useState(0)

    // Form States
    const [email, setEmail] = useState('')
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [subMsg, setSubMsg] = useState('')

    // Configuración Física Visual
    const TARGET_NOZZLE = 210
    const TARGET_BED = 60
    const TOTAL_LAYERS = 40
    const MAX_HEIGHT_PX = 100 // Altura de impresión

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return
        setSubStatus('loading')

        const res = await suscribirNewsletter(email)

        if (res.success) {
            setSubStatus('success')
            setSubMsg(res.message)
            setEmail('')
        } else {
            setSubStatus('error')
            setSubMsg(res.message)
        }

        if (!res.success) setTimeout(() => setSubStatus('idle'), 3000)
    }

    useEffect(() => {
        let interval: NodeJS.Timeout

        const runCycle = () => {
            interval = setInterval(() => {
                setState(currentState => {
                    const noise = () => (Math.random() - 0.5) * 1.5

                    switch (currentState) {
                        case 'HEATING':
                            setNozzleTemp(p => {
                                const n = p + (TARGET_NOZZLE - p) * 0.1 + noise()
                                return n > TARGET_NOZZLE - 1 ? TARGET_NOZZLE + noise() : n
                            })
                            setBedTemp(p => {
                                const n = p + (TARGET_BED - p) * 0.08 + noise()
                                return n > TARGET_BED - 1 ? TARGET_BED + noise() : n
                            })

                            if (nozzleTemp > TARGET_NOZZLE - 5 && bedTemp > TARGET_BED - 2) return 'HOMING'
                            return 'HEATING'

                        case 'HOMING':
                            if (Math.random() > 0.95) return 'PRINTING'
                            return 'HOMING'

                        case 'PRINTING':
                            setFanSpeed(100)
                            setNozzleTemp(TARGET_NOZZLE + (Math.random() - 0.5) * 3)
                            setBedTemp(TARGET_BED + (Math.random() - 0.5) * 1)

                            setProgress(prev => {
                                const next = prev + 0.3
                                if (next >= 100) return 100
                                return next
                            })

                            if (progress >= 100) return 'FINISHED'
                            return 'PRINTING'

                        case 'FINISHED':
                            setFanSpeed(0)
                            return 'COOLING'

                        case 'COOLING':
                            setNozzleTemp(prev => Math.max(24, prev - 4))
                            if (nozzleTemp < 60) return 'EJECT'
                            return 'COOLING'

                        case 'EJECT':
                            if (Math.random() > 0.97) {
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

    const currentLayer = Math.floor((progress / 100) * TOTAL_LAYERS)
    const layerHeight = MAX_HEIGHT_PX / TOTAL_LAYERS
    const currentHeightPx = currentLayer * layerHeight

    const getStatusText = () => {
        switch (state) {
            case 'HEATING': return `Calentando...`
            case 'HOMING': return "Calibrando..."
            case 'PRINTING': return `Imprimiendo`
            case 'FINISHED': return "Listo"
            case 'COOLING': return "Enfriando"
            case 'EJECT': return "Retirando"
            default: return "Standby"
        }
    }

    return (
        <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white font-sans selection:bg-teal-500 selection:text-white overflow-x-hidden py-6 md:py-10">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center">

                {/* 3D PRINTER SIMULATION STAGE - BAMBU LAB A1 STYLE */}
                <div className="relative w-full max-w-md aspect-[1/1] mb-8 flex items-end justify-center pb-4 scale-90 md:scale-100">

                    {/* BASE UNIDAD PRINCIPAL */}
                    <div className="absolute bottom-0 w-[340px] h-12 bg-gray-200 rounded-2xl shadow-2xl z-20 flex items-center justify-center border-t border-white/50">
                        {/* Detalle frontal base */}
                        <div className="w-[300px] h-2 bg-gray-300/50 rounded-full mt-8" />
                        <div className="absolute right-4 top-[-40px] w-20 h-14 bg-black rounded-lg border-2 border-gray-600 shadow-xl flex items-center justify-center overflow-hidden transform rotate-y-12">
                            {/* PANTALLA */}
                            <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-1">
                                <div className="text-[8px] font-mono text-teal-400">{Math.floor(progress)}%</div>
                                <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA Z (PÓRTICO) */}
                    <div className="absolute bottom-10 w-[300px] h-[320px] z-10 pointer-events-none">
                        {/* Columna Izquierda */}
                        <div className="absolute left-0 bottom-0 w-12 h-full bg-gradient-to-r from-gray-300 to-gray-100 rounded-t-lg shadow-lg border-r border-gray-400/30" />
                        {/* Columna Derecha */}
                        <div className="absolute right-0 bottom-0 w-12 h-full bg-gradient-to-l from-gray-300 to-gray-100 rounded-t-lg shadow-lg border-l border-gray-400/30" />

                        {/* VIGA SUPERIOR */}
                        <div className="absolute top-4 left-0 right-0 h-10 bg-gray-200 flex items-center justify-center rounded-sm shadow-md z-0">
                            <div className="text-[8px] font-black text-gray-400 tracking-[0.2em] uppercase">Bambu Lab A1</div>
                        </div>
                    </div>

                    {/* TUBO BOWDEN (PTFE) - Animado */}
                    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
                        <motion.path
                            d={`M 150 ${300 - currentHeightPx} C 150 ${100 - currentHeightPx}, 320 150, 320 250`}
                            fill="none"
                            stroke="#ddd"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={false}
                            animate={{ d: `M ${150 + (state === 'PRINTING' ? 30 : 0)} ${260 - currentHeightPx} C 120 ${20 - currentHeightPx}, 360 80, 340 280` }}
                            transition={{ type: "spring", stiffness: 40, damping: 10 }}
                        />
                        {/* Sombra del tubo */}
                        <motion.path
                            d={`M 152 ${302 - currentHeightPx} C 152 ${102 - currentHeightPx}, 322 152, 322 252`}
                            fill="none"
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            initial={false}
                            animate={{ d: `M ${154 + (state === 'PRINTING' ? 30 : 0)} ${264 - currentHeightPx} C 124 ${24 - currentHeightPx}, 364 84, 344 284` }}
                            transition={{ type: "spring", stiffness: 40, damping: 10 }}
                        />
                    </svg>

                    {/* EJE X + CABEZAL (Sube en Z) */}
                    <motion.div
                        className="absolute w-[340px] z-30 pointer-events-none"
                        style={{ bottom: 100, transformOrigin: 'bottom' }}
                        animate={{ y: -currentHeightPx }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    >
                        {/* RIEL X (Viga Gris Metalizada) */}
                        <div className="w-full h-10 bg-gradient-to-b from-gray-200 to-gray-300 rounded-sm shadow-xl flex items-center justify-between px-3 relative border-b border-gray-400/50 overflow-hidden">
                            {/* Brillo metálico */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 opacity-50" />
                            {/* Guía lineal (Rail) */}
                            <div className="absolute top-1/2 left-2 right-2 h-1.5 bg-gray-800/20 rounded-full" />
                        </div>

                        {/* CABEZAL (TOOLHEAD) - Diseño Refinado */}
                        <motion.div
                            className="absolute top-[-28px] left-1/2 w-20 h-24 bg-gray-100 rounded-xl shadow-2xl flex flex-col items-center border border-white/50"
                            style={{ marginLeft: '-40px' }}
                            animate={
                                state === 'HOMING' ? { x: -120 } :
                                    state === 'PRINTING' ? {
                                        x: [0, 70, -70, 35, -35, 10, -10, 0],
                                    } : { x: 0 }
                            }
                            transition={{
                                x: {
                                    duration: 1.5,
                                    repeat: state === 'PRINTING' ? Infinity : 0,
                                    repeatType: "mirror",
                                    ease: "easeInOut"
                                }
                            }}
                        >
                            {/* Carcasa Frontal Gris Oscuro (Detalle Bambu) */}
                            <div className="absolute top-0 w-full h-8 bg-gray-200 rounded-t-xl border-b border-gray-300" />

                            {/* Logo Ventilador (Amarillo/Negro) con profundidad */}
                            <div className="mt-6 w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative overflow-hidden border-2 border-[#1a1a1a] z-10 group-hover:border-yellow-500 transition-colors">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: fanSpeed > 0 ? 0.08 : 0, repeat: Infinity, ease: "linear" }}
                                    className="text-yellow-500 drop-shadow-md"
                                >
                                    <Fan className="w-9 h-9" />
                                </motion.div>
                                {/* Reflejo en ventilador */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 rounded-full pointer-events-none" />
                            </div>

                            {/* Conducto de aire (Fan Duct) */}
                            <div className="absolute bottom-2 w-14 h-4 bg-gray-300 rounded-b-lg flex justify-between px-2 items-end pb-1">
                                <div className="w-2 h-1.5 bg-black/20 rounded-full" />
                                <div className="w-2 h-1.5 bg-black/20 rounded-full" />
                            </div>

                            {/* Nozzle (Boquilla) */}
                            <div className="absolute -bottom-2.5 w-4 h-4 bg-gray-800 clip-triangle flex items-center justify-center z-0">
                                <motion.div
                                    className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"
                                    animate={{ opacity: nozzleTemp > 180 ? [0.6, 1, 0.6] : 1 }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                />
                            </div>

                            {/* LED Status */}
                            <div className={`absolute top-2 right-3 w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor] transition-colors duration-300 ${state === 'HEATING' ? 'bg-red-500 text-red-500' : state === 'PRINTING' ? 'bg-white text-white' : 'bg-green-500 text-green-500'}`} />
                        </motion.div>
                    </motion.div>

                    {/* PIEZA IMPRESA (Directo sobre la base) */}
                    <div className="absolute bottom-[60px] w-full flex justify-center z-20">
                        <AnimatePresence mode="wait">
                            {state !== 'EJECT' && (
                                <motion.div
                                    key="piece"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{
                                        height: Math.max(0, currentHeightPx),
                                        opacity: 1
                                    }}
                                    exit={{ x: 100, opacity: 0, transition: { duration: 0.5 } }}
                                    className="w-24 relative origin-bottom shadow-lg"
                                    style={{
                                        // Forma más interesante (Jarrón Low Poly simple)
                                        clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 100%, 0 100%, 0 20%)',
                                        background: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 50%, #0f766e 100%)',
                                    }}
                                >
                                    {/* Capas horizontales marcadas */}
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.05)_0px,rgba(0,0,0,0.05)_1px,transparent_1px,transparent_3px)]" />
                                    {/* Brillo lateral */}
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>



                {/* DASHBOARD - BAMBU STYLE (Clean White/Grey) */}
                <div className="w-full max-w-2xl bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden mb-12 shadow-2xl">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <h2 className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">STATUS</h2>
                                <div className="text-xl font-bold text-white flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${state === 'PRINTING' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                    {getStatusText()}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mb-1">TIME LEFT</div>
                            <div className="text-xl font-mono text-white">00:{Math.floor((100 - progress) * 0.45).toString().padStart(2, '0')}m</div>
                        </div>
                    </div>

                    {/* Progress Bar - Bambu Green */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs text-gray-400 font-medium mb-2">
                            <span>Progress</span>
                            <span className="text-white">{Math.floor(progress)}%</span>
                        </div>
                        <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="absolute h-full bg-[#00AE42]" // Bambu Green
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ type: "tween", ease: "linear" }}
                            />
                        </div>
                    </div>

                    {/* Sensors Grid */}
                    <div className="grid grid-cols-4 gap-4">
                        <BambuStat label="Nozzle" value={Math.floor(nozzleTemp)} unit="°C" icon={Thermometer} active={nozzleTemp > 50} />
                        <BambuStat label="Bed" value={Math.floor(bedTemp)} unit="°C" icon={Thermometer} active={bedTemp > 40} />
                        <BambuStat label="Fan" value={fanSpeed} unit="%" icon={Fan} active={fanSpeed > 0} />
                        <BambuStat label="Speed" value={state === 'PRINTING' ? 100 : 0} unit="%" icon={Zap} active={state === 'PRINTING'} />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full max-w-lg mx-auto text-center px-4 relative z-50">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">
                            Mantenimiento <span className="text-[#00AE42]">Bambu</span>
                        </h1>
                        <p className="text-sm text-gray-400 mb-8 font-light">
                            {texto || "Calibrando flujo y nivelando la cama. Ya volvemos."}
                        </p>
                    </motion.div>

                    {/* Captura de Leads */}
                    <div className="mb-12">
                        {subStatus === 'success' ? (
                            <div className="bg-[#00AE42]/20 border border-[#00AE42]/40 rounded-lg p-4 text-[#00AE42] font-bold text-sm flex items-center justify-center gap-2">
                                <Check className="w-4 h-4" /> {subMsg}
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} className="flex gap-2">
                                <input
                                    type="email"
                                    required
                                    className="flex-1 bg-[#222] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00AE42] transition-colors"
                                    placeholder="Notificarme al lanzar..."
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={subStatus === 'loading'}
                                />
                                <button
                                    type="submit"
                                    disabled={subStatus === 'loading'}
                                    className="bg-white text-black hover:bg-gray-200 font-bold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                                >
                                    {subStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
                                </button>
                            </form>
                        )}
                        {subStatus === 'error' && <p className="text-red-400 text-xs mt-2 text-left">{subMsg}</p>}
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4 justify-center mb-12">
                        <a href="https://wa.me/5491126354636" target="_blank" className="p-3 bg-[#222] hover:bg-[#333] rounded-full text-white transition-colors">
                            <MessageCircle className="w-5 h-5" />
                        </a>
                        <a href="https://instagram.com/grana.3d" target="_blank" className="p-3 bg-[#222] hover:bg-[#333] rounded-full text-white transition-colors">
                            <Instagram className="w-5 h-5" />
                        </a>
                    </div>
                </div>

            </div>

            {/* Admin Access Hidden Button */}
            <Link href="/admin" className="fixed bottom-4 right-4 p-3 text-white/5 hover:text-white/30 transition-colors z-50 rounded-full hover:bg-white/5">
                <Lock className="w-5 h-5" />
            </Link>
        </div>
    )
}

function BambuStat({ label, value, unit, icon: Icon, active }: any) {
    return (
        <div className="flex flex-col items-center p-2 rounded-lg bg-[#222] border border-gray-800">
            <div className={`mb-1 ${active ? 'text-[#00AE42]' : 'text-gray-500'}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-white leading-none">{value}</div>
            <div className="text-[9px] text-gray-500 font-bold uppercase">{unit}</div>
        </div>
    )
}
