"use client"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import { Instagram, MessageCircle, Fan, Zap, Loader2, Check, Box, Lock, Settings, Thermometer } from 'lucide-react'
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

    // Motion Values para sincronización física
    const headX = useMotionValue(0)
    
    // Form States
    const [email, setEmail] = useState('')
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [subMsg, setSubMsg] = useState('')

    // Configuración Física Visual
    const TARGET_NOZZLE = 210
    const TARGET_BED = 60
    const TOTAL_LAYERS = 40
    const MAX_HEIGHT_PX = 100 

    // Transformación dinámica del cable PTFE
    const currentLayer = Math.floor((progress / 100) * TOTAL_LAYERS)
    const currentHeightPx = currentLayer * (MAX_HEIGHT_PX / TOTAL_LAYERS)
    
    const tubePath = useTransform(headX, (x) => {
        const startX = 280
        const startY = 150
        const endX = 170 + x
        const endY = 230 - currentHeightPx
        
        const cp1X = startX - 20
        const cp1Y = startY - 150
        const cp2X = endX
        const cp2Y = endY - 150

        return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`
    })

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

    // Control de Animación del Cabezal
    useEffect(() => {
        if (state === 'PRINTING') {
            const controls = animate(headX, [0, 80, -60, 40, -40, 20, -80, 0], {
                duration: 1.8,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
            })
            return () => controls.stop()
        } else if (state === 'HOMING') {
            animate(headX, -130, { duration: 1 })
        } else {
            animate(headX, 0, { duration: 0.5 })
        }
    }, [state, headX])

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
        <div className="relative h-screen w-full bg-[#050505] text-white font-sans selection:bg-teal-500 selection:text-white overflow-hidden flex items-center justify-center">

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#14b8a6 1px, transparent 1px), linear-gradient(90deg, #14b8a6 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16">

                {/* LEFT SIDE: 3D PRINTER (Scaled to fit) */}
                <div className="flex-1 flex items-center justify-center w-full max-h-[50vh] lg:max-h-full">
                    <div className="transform scale-[0.6] sm:scale-[0.7] md:scale-[0.85] lg:scale-100 xl:scale-110 transition-transform duration-500 origin-center">
                        
                        {/* 3D PRINTER SIMULATION STAGE - BAMBU LAB A1 STYLE */}
                        <div className="relative w-[400px] h-[450px] flex items-end justify-center">

                            {/* BASE UNIDAD PRINCIPAL */}
                            <div className="absolute bottom-0 w-[380px] h-14 bg-gray-200 rounded-3xl shadow-2xl z-20 flex items-center justify-center border-t border-white/50">
                                {/* Detalle frontal base */}
                                <div className="w-[340px] h-2 bg-gray-300/50 rounded-full mt-8" />
                                <div className="absolute right-4 top-[-50px] w-24 h-16 bg-black rounded-xl border-2 border-gray-600 shadow-xl flex items-center justify-center overflow-hidden transform rotate-y-12 origin-bottom-left hover:scale-105 transition-transform cursor-pointer">
                                    {/* PANTALLA */}
                                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-1">
                                        <div className="text-[10px] font-mono text-teal-400 font-bold">{Math.floor(progress)}%</div>
                                        <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                                        </div>
                                        <div className="text-[6px] text-gray-500 mt-1 uppercase tracking-wider">Printing...</div>
                                    </div>
                                </div>
                            </div>

                            {/* COLUMNA Z (PÓRTICO) */}
                            <div className="absolute bottom-10 w-[340px] h-[380px] z-10 pointer-events-none">
                                {/* Columna Izquierda */}
                                <div className="absolute left-0 bottom-0 w-14 h-full bg-gradient-to-r from-gray-300 to-gray-100 rounded-t-xl shadow-lg border-r border-gray-400/30" />
                                {/* Columna Derecha */}
                                <div className="absolute right-0 bottom-0 w-14 h-full bg-gradient-to-l from-gray-300 to-gray-100 rounded-t-xl shadow-lg border-l border-gray-400/30" />

                                {/* VIGA SUPERIOR */}
                                <div className="absolute top-4 left-0 right-0 h-12 bg-gray-200 flex items-center justify-center rounded-lg shadow-md z-0 border-b border-gray-300">
                                    <div className="text-[9px] font-black text-gray-400 tracking-[0.3em] uppercase flex items-center gap-2">
                                        <Box className="w-3 h-3" /> Grana3D A1
                                    </div>
                                </div>
                            </div>

                            {/* TUBO BOWDEN (PTFE) - Sincronizado Físicamente */}
                            <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none overflow-visible">
                                <motion.path
                                    d={tubePath}
                                    fill="none"
                                    stroke="#eee"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}
                                />
                                {/* Sombra interna del tubo para volumen */}
                                <motion.path
                                    d={tubePath}
                                    fill="none"
                                    stroke="#ccc"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    transform="translate(0, 1)"
                                    style={{ opacity: 0.5 }}
                                />
                            </svg>

                            {/* EJE X + CABEZAL (Sube en Z) */}
                            <motion.div
                                className="absolute w-[380px] z-30 pointer-events-none"
                                style={{ bottom: 110, transformOrigin: 'bottom' }}
                                animate={{ y: -currentHeightPx }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            >
                                {/* RIEL X (Viga Gris Metalizada con textura técnica) */}
                                <div className="w-full h-14 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-400 rounded-lg shadow-2xl flex items-center justify-between px-2 relative border border-gray-400 overflow-hidden">
                                    {/* Riel lineal (Linear Rail) */}
                                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-3 bg-gray-700/20 rounded-full shadow-inner" />
                                    {/* Tornillos/Detalles */}
                                    <div className="flex justify-between w-full px-6 opacity-30">
                                        {[...Array(6)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-black/40 shadow-sm" />)}
                                    </div>
                                </div>

                                {/* CABEZAL (TOOLHEAD) - Sincronizado con MotionValue */}
                                <motion.div
                                    className="absolute top-[-40px] left-1/2 w-28 h-36 bg-white rounded-3xl shadow-2xl flex flex-col items-center border border-gray-200 z-50"
                                    style={{ marginLeft: '-56px', x: headX }}
                                >
                                    {/* Logo Bambu / Grana Frontal */}
                                    <div className="absolute top-4 w-8 h-8 opacity-20">
                                        <Box className="w-full h-full text-black" />
                                    </div>

                                    {/* VENTILADOR PRINCIPAL (Hotend Fan) */}
                                    <div className="mt-10 w-16 h-16 bg-[#111] rounded-full flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden border-[3px] border-gray-300 group z-20">
                                        {/* Aspas del ventilador con Motion Blur */}
                                        <motion.div
                                            className="w-full h-full flex items-center justify-center"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: fanSpeed > 0 ? 0.05 : 0, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Fan className={`w-12 h-12 ${fanSpeed > 0 ? 'text-yellow-400 blur-[1px]' : 'text-yellow-500'}`} />
                                        </motion.div>
                                        {/* Centro del ventilador */}
                                        <div className="absolute w-5 h-5 bg-[#222] rounded-full border border-gray-600 shadow-md z-30 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Conducto de Capa (Part Cooling) */}
                                    <div className="absolute bottom-1 w-24 h-8 bg-gray-200 rounded-xl flex justify-between items-end px-1 border border-gray-300 shadow-sm z-10">
                                        <div className="w-8 h-5 bg-black/10 rounded-b-lg transform -skew-x-12" />
                                        <div className="w-8 h-5 bg-black/10 rounded-b-lg transform skew-x-12" />
                                    </div>

                                    {/* Nozzle (Boquilla) */}
                                    <div className="absolute -bottom-3 w-5 h-6 bg-[#b45309] clip-triangle flex items-center justify-center z-0">
                                        {/* Hotend Glow */}
                                        <motion.div
                                            className="absolute w-8 h-8 bg-orange-500 rounded-full blur-md"
                                            animate={{ opacity: nozzleTemp > 180 ? 0.6 : 0 }}
                                        />
                                    </div>

                                    {/* Extrusor Gear Visual (Rueda dentada arriba) */}
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-gray-300 rounded-full border border-gray-400 flex items-center justify-center animate-spin-slow">
                                        <Settings className="w-3 h-3 text-gray-500" />
                                    </div>

                                    {/* LED Status Ring */}
                                    <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-300 ${state === 'HEATING' ? 'bg-red-500 text-red-500 animate-pulse' : state === 'PRINTING' ? 'bg-white text-white' : 'bg-[#00AE42] text-[#00AE42]'}`} />
                                </motion.div>
                            </motion.div>

                            {/* PIEZA IMPRESA */}
                            <div className="absolute bottom-[70px] w-full flex justify-center z-20">
                                <AnimatePresence mode="wait">
                                    {state !== 'EJECT' && (
                                        <motion.div
                                            key="piece"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: Math.max(0, currentHeightPx),
                                                opacity: 1
                                            }}
                                            exit={{ x: 200, opacity: 0, rotate: 15, transition: { duration: 0.8, ease: "backIn" } }}
                                            className="relative origin-bottom"
                                            style={{ width: '120px' }}
                                        >
                                            <div className="w-full h-full relative overflow-hidden">
                                                {/* Cuerpo Principal */}
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 w-full bg-gradient-to-tr from-teal-600 via-[#00AE42] to-teal-400 shadow-lg"
                                                    style={{
                                                        height: '100%',
                                                        clipPath: 'polygon(15% 100%, 85% 100%, 100% 30%, 80% 0%, 20% 0%, 0% 30%)'
                                                    }}
                                                >
                                                    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_6px)]" />
                                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_4px)]" />
                                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/20 to-transparent skew-x-12" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Purge Line */}
                            <motion.div
                                className="absolute bottom-[70px] left-10 w-1.5 bg-[#00AE42] rounded-full shadow-sm origin-bottom"
                                initial={{ height: 0 }}
                                animate={{ height: state === 'PRINTING' || state === 'FINISHED' ? 50 : 0 }}
                                transition={{ duration: 1 }}
                            />

                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: INFO & CONTROLS */}
                <div className="flex-1 w-full max-w-lg flex flex-col justify-center space-y-6 lg:space-y-8 z-20">
                    
                    {/* TITLE */}
                    <div className="text-center lg:text-left">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-2 text-white leading-none">
                                Mantenimiento <br/><span className="text-[#00AE42]">Bambu</span>
                            </h1>
                            <p className="text-sm lg:text-base text-gray-400 font-light max-w-md mx-auto lg:mx-0">
                                {texto || "Calibrando flujo y nivelando la cama. Ya volvemos."}
                            </p>
                        </motion.div>
                    </div>

                    {/* DASHBOARD */}
                    <div className="w-full bg-[#111] border border-gray-800 rounded-xl p-5 shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
                            <div className="flex items-center gap-3">
                                <h2 className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">STATUS</h2>
                                <div className="text-lg font-bold text-white flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${state === 'PRINTING' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                    {getStatusText()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">TIME LEFT</div>
                                <div className="text-lg font-mono text-white">00:{Math.floor((100 - progress) * 0.45).toString().padStart(2, '0')}m</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div className="absolute h-full bg-[#00AE42]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: "tween", ease: "linear" }} />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <BambuStat label="Nozzle" value={Math.floor(nozzleTemp)} unit="°C" icon={Thermometer} active={nozzleTemp > 50} />
                            <BambuStat label="Bed" value={Math.floor(bedTemp)} unit="°C" icon={Thermometer} active={bedTemp > 40} />
                            <BambuStat label="Fan" value={fanSpeed} unit="%" icon={Fan} active={fanSpeed > 0} />
                            <BambuStat label="Speed" value={state === 'PRINTING' ? 100 : 0} unit="%" icon={Zap} active={state === 'PRINTING'} />
                        </div>
                    </div>

                    {/* NEWSLETTER FORM */}
                    <div className="w-full">
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

                    {/* SOCIALS */}
                    <div className="flex gap-4 justify-center lg:justify-start">
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
