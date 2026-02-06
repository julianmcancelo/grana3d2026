"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Box, ArrowLeft, Check } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function LoginPage() {
    const router = useRouter()
    const { login } = useUsuario()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

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
            
            {/* LEFT SIDE - BAMBU AESTHETIC VISUAL */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0a0a0a] items-center justify-center border-r border-gray-900">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                
                {/* Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00AE42]/5 rounded-full blur-[120px]" />

                {/* Animated Filament Spool (Carrete girando) */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div 
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="relative w-80 h-80 mb-12"
                    >
                        {/* Spool Body */}
                        <div className="absolute inset-0 rounded-full border-[16px] border-gray-800 bg-[#111] shadow-2xl flex items-center justify-center">
                            {/* Filament Strands */}
                            <div className="absolute inset-2 rounded-full border-[24px] border-[#00AE42]/20 border-t-[#00AE42] border-r-[#00AE42]/80 border-b-[#00AE42]/40 border-l-[#00AE42]/10" />
                            
                            {/* Spool Center Label */}
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative shadow-inner overflow-hidden">
                                <div className="absolute inset-0 bg-gray-100 opacity-50" />
                                <div className="relative z-10 flex flex-col items-center">
                                    <Box className="w-8 h-8 text-black mb-1" />
                                    <span className="text-[10px] font-black text-black tracking-widest uppercase">GRANA3D</span>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">PLA MATTE</span>
                                </div>
                                {/* Barcode Lines */}
                                <div className="absolute bottom-4 flex gap-0.5 h-3 opacity-30">
                                    {[...Array(10)].map((_,i) => <div key={i} className="w-0.5 bg-black" style={{ height: Math.random() * 10 + 2 }} />)}
                                </div>
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
                            Ingeniería <span className="text-[#00AE42]">Avanzada.</span>
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-500 font-medium"
                        >
                            Accedé a tu panel de control y gestioná tus proyectos de impresión 3D con precisión industrial.
                        </motion.p>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
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
