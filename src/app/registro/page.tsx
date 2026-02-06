"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Box, ArrowLeft, Check, Mail, Fan } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function RegistroPage() {
    const router = useRouter()
    const { registro } = useUsuario()

    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)

        try {
            const success = await registro(nombre, email, password)
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
            
            {/* LEFT SIDE - BAMBU AESTHETIC VISUAL */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] items-center justify-center border-r border-gray-900">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AE42]/5 rounded-full blur-[120px]" />

                {/* Animated 3D Printer Concept - AMS System Style */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative mb-12"
                    >
                        {/* AMS Unit (Sistema Multi-Material) - Ultra Realistic */}
                        <div className="w-96 h-56 bg-[#1a1a1a] rounded-t-2xl rounded-b-lg border border-gray-800 shadow-2xl relative flex items-end justify-around px-4 pb-4 overflow-hidden group perspective-1000">
                            
                            {/* Tapa de Vidrio Ahumado con Reflejos */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent z-30 pointer-events-none rounded-t-2xl border-t border-white/10 backdrop-blur-[0.5px]">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 via-transparent to-transparent opacity-50" />
                            </div>

                            {/* Spools (Bobinas) */}
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="relative w-20 h-40 flex flex-col items-center justify-end z-20">
                                    
                                    {/* Bobina (Spool) */}
                                    <motion.div 
                                        className="w-16 h-32 rounded-lg bg-[#222] border border-gray-700 relative overflow-hidden flex flex-col items-center justify-center shadow-lg"
                                        style={{ transformStyle: 'preserve-3d' }}
                                        animate={{ rotateX: i === 1 ? [0, 360] : 0 }}
                                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                                    >
                                        {/* Filamento enrollado */}
                                        <div className={`absolute inset-x-1 inset-y-2 rounded-sm border-x-[3px] ${
                                            i === 0 ? 'bg-orange-600 border-orange-500' : 
                                            i === 1 ? 'bg-[#008a34] border-[#00AE42]' : 
                                            i === 2 ? 'bg-blue-600 border-blue-500' : 
                                            'bg-gray-400 border-gray-300'
                                        }`}>
                                            {/* Textura de líneas de filamento */}
                                            <div className="w-full h-full opacity-40 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.4)_0px,rgba(0,0,0,0.4)_1px,transparent_1px,transparent_2px)]" />
                                            {/* Brillo cilíndrico */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                                        </div>
                                        
                                        {/* Eje Central (Hub) */}
                                        <div className="absolute w-8 h-8 bg-[#1a1a1a] rounded-full border-2 border-gray-600 flex items-center justify-center z-10 shadow-inner">
                                            <div className="w-3 h-3 bg-gray-500 rounded-full border border-gray-400" />
                                            {/* Rayos del eje */}
                                            {[0, 45, 90, 135].map(deg => (
                                                <div key={deg} className="absolute w-full h-0.5 bg-gray-700" style={{ transform: `rotate(${deg}deg)` }} />
                                            ))}
                                        </div>
                                        
                                        {/* Etiqueta RFID (Simulada) */}
                                        <div className="absolute bottom-2 w-10 h-3 bg-white/80 rounded-[1px] opacity-80" />
                                    </motion.div>

                                    {/* Base del Feeder (Motor) */}
                                    <div className="absolute bottom-[-10px] w-18 h-10 bg-gray-800 rounded-t-lg border-t border-gray-600 flex justify-center pt-2 shadow-inner z-30">
                                        {/* LED Indicador */}
                                        <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-white shadow-[0_0_8px_white] animate-pulse' : 'bg-gray-600'}`} />
                                    </div>
                                    
                                    {/* Filamento saliendo (Solo activo) */}
                                    {i === 1 && (
                                        <motion.div 
                                            className="absolute bottom-[-80px] w-[2px] h-32 bg-[#00AE42] z-10"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, y: [0, 8, 0] }}
                                            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Hub Trasero (Salida de 4 a 1) */}
                        <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-24 h-12 bg-[#222] rounded-b-2xl border-x border-b border-gray-700 z-0 flex justify-center items-end pb-2 shadow-2xl">
                            <div className="w-4 h-4 bg-gray-800 rounded-full border border-gray-600 flex items-center justify-center">
                                <div className="w-2 h-2 bg-black rounded-full" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="text-center space-y-4 max-w-md">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-black tracking-tight text-white"
                        >
                            Impresión 3D <span className="text-[#00AE42]">Profesional.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 font-medium"
                        >
                            Registrate para acceder al catálogo completo de Grana3D. Insumos, repuestos y diseño a medida con envío a todo el país.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - REGISTER FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
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
                            <h1 className="text-3xl font-black tracking-tight text-white">Crear Cuenta</h1>
                        </div>
                        <p className="text-gray-500">Completá tus datos para empezar.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#00AE42] transition-colors">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                    placeholder="Juan Pérez"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#00AE42] transition-colors">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#00AE42] transition-colors">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                    placeholder="Mínimo 6 caracteres"
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

                        <div className="group">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-[#00AE42] transition-colors">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-[#00AE42] transition-colors" />
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                    placeholder="Repetir contraseña"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00AE42]/10 hover:scale-[1.02] active:scale-[0.98] mt-6"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Registrarme
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-gray-800 text-center">
                        <p className="text-gray-500 text-sm">
                            ¿Ya tenés una cuenta?{' '}
                            <Link href="/login" className="text-white font-bold hover:text-[#00AE42] transition-colors inline-block ml-1">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
