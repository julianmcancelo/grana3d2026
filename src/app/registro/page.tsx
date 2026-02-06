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
                        {/* AMS Unit (Sistema Multi-Material) */}
                        <div className="w-80 h-48 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl relative flex items-center justify-around px-4 overflow-hidden">
                            {/* Glass Lid Shine */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                            
                            {/* 4 Spools Rotating */}
                            {[0, 1, 2, 3].map((i) => (
                                <div key={i} className="relative w-14 h-32 flex flex-col items-center justify-center">
                                    {/* Spool */}
                                    <motion.div 
                                        className="w-14 h-14 rounded-full border-4 border-gray-700 bg-gray-900 flex items-center justify-center relative"
                                        animate={{ rotate: i === 1 ? 360 : 0 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className={`absolute inset-1 rounded-full border-[6px] ${
                                            i === 0 ? 'border-orange-500' : 
                                            i === 1 ? 'border-[#00AE42]' : 
                                            i === 2 ? 'border-blue-500' : 'border-white'
                                        } opacity-80`} />
                                        <div className="w-4 h-4 bg-gray-800 rounded-full" />
                                    </motion.div>
                                    
                                    {/* Filament Path */}
                                    <div className={`w-1 h-full mt-[-2px] ${
                                        i === 1 ? 'bg-[#00AE42] opacity-100' : 'bg-gray-800 opacity-30'
                                    }`} />
                                    
                                    {/* Active Indicator */}
                                    <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                                        i === 1 ? 'bg-[#00AE42] shadow-[0_0_5px_#00AE42]' : 'bg-gray-800'
                                    }`} />
                                </div>
                            ))}
                        </div>

                        {/* Feeding Tube Animation */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                            <motion.div 
                                className="absolute left-[38%] top-[60%] w-1 h-20 bg-[#00AE42]"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: [0, 40, 40, 0], opacity: [0, 1, 1, 0], top: ['60%', '60%', '100%', '100%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                    </motion.div>

                    <div className="text-center space-y-4 max-w-md">
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-black tracking-tight text-white"
                        >
                            Creá el <span className="text-[#00AE42]">Futuro.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 font-medium"
                        >
                            Sumate a la comunidad de makers y profesionales que eligen calidad industrial.
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
