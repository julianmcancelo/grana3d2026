"use client"
import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Box, ArrowLeft, Fan, Thermometer } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useUsuario()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // --- ANIMATION STATE ---
    // Coordenadas relativas al contenedor de 800x600
    // Base Impresora: x=50, y=450 (ancho 400, alto 100)
    // Torre Z: x=380 (desde base hacia arriba)

    // VARIABLES DE MOVIMIENTO
    const armZ = useMotionValue(130) // Comienza abajo (Primera capa)
    const headX = useMotionValue(100) // Posición X

    // Ciclo de impresión realista (Loop infinito)
    useEffect(() => {
        // Movimiento del Cabezal (Relleno rápido Zig-Zag)
        const controlsX = animate(headX, [60, 320], {
            duration: 1.2, // Velocidad de impresión
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
        })
        
        // Movimiento del Eje Z (Crecimiento de la pieza)
        const controlsZ = animate(armZ, [130, 350], {
            duration: 25, // Tiempo que tarda en imprimir la pieza completa
            repeat: Infinity, // Al terminar, resetea y arranca otra
            ease: "linear"
        })
        
        return () => { controlsX.stop(); controlsZ.stop(); }
    }, [headX, armZ])

    // Transformada para la altura de la pieza impresa (Sincronizada con Z)
    const printHeight = useTransform(armZ, [130, 350], [1, 220]) 
    // Opacidad para que desaparezca al resetear
    const printOpacity = useTransform(armZ, [130, 340, 350], [1, 1, 0])

    // --- CABLES DINÁMICOS (Bowden Tubes) - CÁLCULO DE FÍSICA ---
    // AMS Hub Center Estimation:
    // Container Bottom: 600 - 50 = 550
    // Stack: Spools (280h) + Stand (160h) with -60 overlap.
    // Spool Top Y: 550 - 100 (Stand visible) - 280 = 170
    // Hub Center Y: 170 + 140 = 310
    // Hub Center X: 800 - 50 - 140 = 610
    
    // Función para generar path de cable con física simulada
    const generateCable = (offsetIndex: number, x: number, z: number, colorOffset: number) => {
        // Puntos de anclaje (Toolhead)
        const startX = 120 + x + (offsetIndex * 3); // Más juntos en el cabezal
        const startY = 470 - z; 
        
        // Puntos de destino (AMS Hub Central Feeder)
        const endX = 610 + (offsetIndex * 2); // Convergen casi en el mismo punto
        const endY = 310; // Centro exacto del Hub

        // Puntos de control para Curva Bezier Cúbica
        // CP1: Sale vertical del cabezal
        const cp1X = startX;
        const cp1Y = startY - 120 - (z * 0.15); // Arco dinámico según altura Z

        // CP2: Entra horizontal/diagonal al AMS desde la izquierda
        const cp2X = endX - 120; // Tira hacia la izquierda para hacer la curva de entrada
        const cp2Y = endY + 20;  // Ligera caída natural

        return `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
    }

    const cable1 = useTransform([headX, armZ], ([x, z]: any) => generateCable(0, x, z, 0)); // Amarillo
    const cable2 = useTransform([headX, armZ], ([x, z]: any) => generateCable(1, x, z, 0)); // Rosa
    const cable3 = useTransform([headX, armZ], ([x, z]: any) => generateCable(-1, x, z, 0)); // Azul
    const cable4 = useTransform([headX, armZ], ([x, z]: any) => generateCable(-2, x, z, 0)); // Blanco

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                router.push('/')
            }
        } catch (err) {
            console.error(err)
            setError('Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] flex text-white font-sans selection:bg-[#00AE42] selection:text-white">

            {/* IZQUIERDA - VISUAL 3D A1 MINI */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] items-center justify-center border-r border-gray-900">
                {/* Fondo Técnico */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20" />

                {/* CONTEXTO DE ANIMACIÓN (Escala ajustada para que entre todo) */}
                <div className="relative w-[800px] h-[600px] scale-[0.85] origin-center">

                    {/* === CAPA DE CABLES SVG (Por encima de todo) === */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
                        <defs>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="2" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        {/* Sombras cables */}
                        <motion.path d={cable1} fill="none" stroke="black" strokeWidth="6" strokeOpacity="0.5" />
                        <motion.path d={cable2} fill="none" stroke="black" strokeWidth="6" strokeOpacity="0.5" />
                        <motion.path d={cable3} fill="none" stroke="black" strokeWidth="6" strokeOpacity="0.5" />
                        <motion.path d={cable4} fill="none" stroke="black" strokeWidth="6" strokeOpacity="0.5" />

                        {/* Cables Colores */}
                        <motion.path d={cable1} fill="none" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
                        <motion.path d={cable2} fill="none" stroke="#EC4899" strokeWidth="4" strokeLinecap="round" />
                        <motion.path d={cable3} fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
                        <motion.path d={cable4} fill="none" stroke="#E5E7EB" strokeWidth="4" strokeLinecap="round" />
                    </svg>

                    {/* === AMS LITE (DERECHA) === */}
                    <div className="absolute right-[50px] bottom-[50px] z-10 flex flex-col items-center">
                        <div className="relative w-[280px] h-[280px]">
                            {/* Hub Central AMS */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#222] rounded-full border border-gray-700 z-20 flex items-center justify-center shadow-2xl">
                                <span className="text-xs font-black text-gray-500">AMS</span>
                            </div>

                            {/* Spools (Simulando posición en X) */}
                            {/* Top Right - Amarillo */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute top-4 right-4 w-28 h-28 rounded-full bg-[#111] border-[4px] border-gray-800 flex items-center justify-center shadow-lg">
                                <div className="w-24 h-24 rounded-full border-[8px] border-yellow-500 border-dashed opacity-90" />
                            </motion.div>

                            {/* Bottom Right - Rosa */}
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute bottom-4 right-4 w-28 h-28 rounded-full bg-[#111] border-[4px] border-gray-800 flex items-center justify-center shadow-lg">
                                <div className="w-24 h-24 rounded-full border-[8px] border-pink-500 border-dashed opacity-90" />
                            </motion.div>

                            {/* Top Left - Azul */}
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                                className="absolute top-4 left-4 w-28 h-28 rounded-full bg-[#111] border-[4px] border-gray-800 flex items-center justify-center shadow-lg">
                                <div className="w-24 h-24 rounded-full border-[8px] border-blue-500 border-dashed opacity-90" />
                            </motion.div>

                            {/* Bottom Left - Blanco */}
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                className="absolute bottom-4 left-4 w-28 h-28 rounded-full bg-[#111] border-[4px] border-gray-800 flex items-center justify-center shadow-lg">
                                <div className="w-24 h-24 rounded-full border-[8px] border-gray-200 border-dashed opacity-90" />
                            </motion.div>
                        </div>

                        {/* Stand AMS */}
                        <div className="w-16 h-40 bg-gray-800 mt-[-60px] -z-10 rounded-b-xl transform skew-x-3 opacity-80" />
                    </div>

                    {/* === IMPRESORA A1 MINI (IZQUIERDA) === */}
                    <div className="absolute left-[50px] bottom-[50px] w-[450px] h-[550px] z-20">

                        {/* 1. BASE ESTÁTICA (ABAJO) - CORRECTO */}
                        <div className="absolute bottom-0 w-full h-[100px] bg-[#e5e7eb] rounded-xl shadow-2xl flex items-center px-6 justify-between border-b-[6px] border-[#9ca3af] z-20">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-gray-800 tracking-tighter">Bambu Lab</span>
                                <span className="text-xs font-bold text-[#00AE42] tracking-[0.2em]">A1 MINI</span>
                            </div>

                            {/* Pantalla Táctil Integrada */}
                            <div className="w-[120px] h-[70px] bg-black rounded-lg border-2 border-gray-400 overflow-hidden relative shadow-inner">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
                                <div className="p-2 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-center border-b border-white/20 pb-1">
                                        <span className="text-[6px] text-green-400 font-bold animate-pulse">● PRINTING</span>
                                        <div className="flex gap-0.5">
                                            <div className="w-1.5 h-1 bg-white rounded-[1px]" />
                                            <div className="w-1.5 h-1 bg-white/50 rounded-[1px]" />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-white">64</span>
                                        <span className="text-[8px] text-gray-400">%</span>
                                    </div>
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-[64%] h-full bg-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. PILAR Z (Torre Derecha que sube desde la base) */}
                        <div className="absolute right-[40px] bottom-[100px] w-[80px] h-[450px] bg-[#d1d5db] rounded-t-lg z-10 border-l border-white/50 shadow-lg flex justify-center">
                            {/* Riel Z */}
                            <div className="w-[30px] h-full bg-[#e5e7eb] border-x border-gray-300" />
                        </div>

                        {/* 3. BRAZO X (Cantilever) - Se mueve Verticalmente (Z) */}
                        <motion.div
                            className="absolute right-[40px] w-[380px] h-[60px] bg-[#f3f4f6] rounded-l-lg shadow-xl z-30 flex items-center border border-white/60"
                            style={{ bottom: armZ }}
                        >
                            {/* Riel X */}
                            <div className="w-[340px] h-[20px] bg-[#1f2937] ml-4 rounded flex items-center overflow-hidden opacity-80">
                                <div className="w-full h-full bg-[repeating-linear-gradient(90deg,transparent_0,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_11px)]" />
                            </div>

                            {/* 4. CABEZAL (Toolhead) - Se mueve Horizontalmente (X) */}
                            <motion.div
                                className="absolute w-[80px] h-[100px] bg-white rounded-xl shadow-2xl border border-gray-200 z-40 flex flex-col items-center"
                                style={{ top: -20, left: headX }}
                            >
                                {/* Fan Cover */}
                                <div className="mt-3 w-12 h-12 bg-gray-50 rounded-full border border-gray-200 flex items-center justify-center">
                                    <Fan className="w-8 h-8 text-gray-300 animate-[spin_1s_linear_infinite]" />
                                </div>
                                <span className="mt-1 text-[5px] font-black text-gray-300 tracking-widest uppercase">BAMBU</span>
                                {/* Nozzle */}
                                <div className="absolute -bottom-2 w-4 h-4 bg-yellow-600 rotate-45" />
                                {/* Conector Tubos (Arriba) */}
                                <div className="absolute -top-3 w-full flex justify-center gap-1">
                                    <div className="w-1.5 h-3 bg-black rounded-full" />
                                    <div className="w-1.5 h-3 bg-black rounded-full" />
                                    <div className="w-1.5 h-3 bg-black rounded-full" />
                                    <div className="w-1.5 h-3 bg-black rounded-full" />
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* 5. CAMA Y (Bed Slinger) - Se mueve Adelante/Atrás */}
                        <div className="absolute bottom-[100px] left-[20px] w-[340px] h-[240px] z-10 flex justify-center perspective-[800px]">
                            <motion.div
                                className="w-[240px] h-[240px] relative preserve-3d"
                                style={{ rotateX: "60deg" }}
                                animate={{ translateY: ["-30px", "30px", "-30px"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                {/* Placa PEI */}
                                <div className="absolute inset-0 bg-[#a16207] rounded-lg border-[6px] border-[#111] shadow-2xl flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-multiply" />
                                    
                                    {/* Objeto impreso 3D (Creciendo) */}
                                    <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                                        <motion.div 
                                            className="w-24 bg-[#00AE42] border border-[#00ff55]/50 shadow-[0_0_30px_rgba(0,174,66,0.3)] relative"
                                            style={{ 
                                                height: printHeight,
                                                opacity: printOpacity,
                                                rotateX: -90, // Vertical relativo a la cama
                                                z: 10, // Levantar un poco para evitar Z-fighting
                                                transformOrigin: "bottom"
                                            }}
                                        >
                                            {/* Cara Superior (Top Layer) */}
                                            <div className="absolute top-0 left-0 w-full h-24 bg-[#00da52] border border-[#00ff55]/50 flex items-center justify-center overflow-hidden" 
                                                 style={{ transform: "translateY(-100%) rotateX(90deg)", transformOrigin: "bottom" }}>
                                                {/* Relleno (Infill) */}
                                                <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent_0,transparent_5px,rgba(0,0,0,0.1)_5px,rgba(0,0,0,0.1)_7px)]" />
                                            </div>

                                            {/* Cara Frontal (Brillo) */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                                            
                                            {/* Detalle interno (Vase mode) */}
                                            <div className="absolute inset-1 border border-white/20 opacity-50" />
                                        </motion.div>
                                    </div>
                                </div>
                                {/* Estructura Y inferior */}
                                <div className="absolute inset-0 bg-[#333] translate-z-[-20px] scale-90 rounded" />
                            </motion.div>
                        </div>

                    </div>
                </div>

                {/* Texto Promocional */}
                <div className="absolute bottom-10 left-0 w-full text-center z-50">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black tracking-tight text-white mb-2"
                    >
                        Imprimí el futuro.
                    </motion.h2>
                    <p className="text-gray-500 font-medium">Gestión inteligente para tu granja de impresión.</p>
                </div>
            </div>

            {/* DERECHA - FORMULARIO DE LOGIN */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-[#050505]">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-sm space-y-8"
                >
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#00AE42] font-bold text-sm mb-8 transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver a la tienda
                        </Link>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#00AE42] rounded-lg flex items-center justify-center text-black">
                                <Box className="w-6 h-6" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-white">Hola de nuevo.</h1>
                        </div>
                        <p className="text-gray-500">Ingresá tus credenciales para continuar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#00AE42] transition-colors">Email</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                        placeholder="nombre@ejemplo.com"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase group-focus-within:text-[#00AE42] transition-colors">Contraseña</label>
                                    <a href="#" className="text-xs font-bold text-[#00AE42] hover:text-[#008a34]">¿Olvidaste tu contraseña?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
                                    <input
                                        type={mostrarPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setMostrarPassword(!mostrarPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                                    >
                                        {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="flex items-center h-5">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-5 h-5 border border-gray-700 rounded bg-[#1a1a1a] focus:ring-0 focus:ring-offset-0 checked:bg-[#00AE42] checked:border-[#00AE42] transition-all cursor-pointer appearance-none relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-xs checked:after:flex checked:after:justify-center checked:after:items-center checked:after:w-full checked:after:h-full"
                                />
                            </div>
                            <label htmlFor="remember" className="text-sm font-medium text-gray-400 cursor-pointer select-none hover:text-white transition-colors">
                                Mantener sesión iniciada
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00AE42]/10 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Ingresar a la Plataforma
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-gray-800 text-center">
                        <p className="text-gray-500 text-sm">
                            ¿Todavía no tenés cuenta?{' '}
                            <Link href="/registro" className="text-white font-bold hover:text-[#00AE42] transition-colors inline-block ml-1">
                                Registrarse gratis
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
