"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowRight, Eye, EyeOff, Mail, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function RegisterPage() {
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

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
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
            setError('Ocurrió un error inesperado al registrarte')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex text-white font-sans">
            {/* Left Side - Visual Showcase (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 items-center justify-center">
                {/* Animated Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-gray-900 to-black z-0" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[100px] z-0" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full blur-[40px] opacity-30 animate-pulse" />
                        <img
                            src="https://images.unsplash.com/photo-1617791160536-598cf32026fb?q=80&w=1000&auto=format&fit=crop"
                            alt="3D Process"
                            className="w-96 h-96 object-cover rounded-3xl shadow-2xl border border-white/10 rotate-[-3deg] hover:rotate-0 transition-transform duration-700 relative z-10"
                        />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                    >
                        Empezá tu Viaje
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-gray-400 max-w-md text-lg"
                    >
                        Unite a miles de creadores y llevá tus impresiones al siguiente nivel con Grana3D.
                    </motion.p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative bg-black">
                {/* Background Decor for Mobile */}
                <div className="lg:hidden absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-teal-500 font-bold mb-8 hover:text-teal-400 transition-colors">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Volver al inicio
                        </Link>
                        <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">Crear Cuenta</h1>
                        <p className="text-gray-400 text-lg">Completá tus datos para registrarte</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Nombre */}
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="Nombre completo"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white/10 transition-all"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type="email"
                                required
                                placeholder="Tu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white/10 transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                required
                                placeholder="Contraseña (mín 6 caracteres)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white/10 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Confirm Password */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                required
                                placeholder="Confirmar contraseña"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white/10 transition-all"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-black font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Crear Cuenta
                                    <Sparkles className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400">
                            ¿Ya tenés una cuenta?{' '}
                            <Link href="/login" className="text-white font-bold hover:text-teal-400 transition-colors inline-block ml-1">
                                Iniciar Sesión
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
