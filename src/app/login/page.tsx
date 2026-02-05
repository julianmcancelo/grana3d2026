"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, ArrowRight, Eye, EyeOff, Sparkles, Loader2, AlertCircle } from 'lucide-react'
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
                // Redirigir según rol idealmente, pero por ahora a home o tienda
                router.push('/')
            } else {
                // El error ya se muestra con SweetAlert en el context, pero podemos mostrar uno local si falla
                // setError('Credenciales inválidas')
            }
        } catch (err) {
            console.error(err)
            setError('Ocurrió un error inesperado')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex text-white">
            {/* Left Side - Visual Showcase (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 items-center justify-center">
                {/* Animated Background Gradients */}
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/40 via-gray-900 to-black z-0" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] z-0" />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center text-center p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-8"
                    >
                        <div className="w-64 h-64 bg-gradient-to-tr from-teal-500 to-purple-600 rounded-full blur-[60px] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        <img
                            src="https://images.unsplash.com/photo-1633412802994-5c058f151b66?q=80&w=1000&auto=format&fit=crop"
                            alt="3D Art"
                            className="w-80 h-80 object-cover rounded-3xl shadow-2xl border border-white/10 rotate-3 hover:rotate-6 transition-transform duration-700"
                        />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-400"
                    >
                        Transformando Ideas
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="text-gray-400 max-w-md text-lg"
                    >
                        Accedé a tu panel exclusivo y gestioná tus pedidos de impresión 3D a medida.
                    </motion.p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative">
                {/* Background Decor for Mobile */}
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <Link href="/" className="inline-flex items-center gap-2 text-teal-500 font-bold mb-8 hover:text-teal-400 transition-colors">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Volver al inicio
                        </Link>
                        <h1 className="text-4xl lg:text-5xl font-black mb-2 tracking-tight">Bienvenido</h1>
                        <p className="text-gray-400 text-lg">Inicia sesión para continuar</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Tu email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:bg-white/10 transition-all"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-teal-500 transition-colors" />
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    required
                                    placeholder="Tu contraseña"
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
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 border-2 border-gray-600 rounded bg-transparent peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all" />
                                    <svg className="absolute w-3 h-3 text-black pointer-events-none opacity-0 peer-checked:opacity-100 left-1 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">Recordarme</span>
                            </label>
                            <a href="#" className="text-teal-500 hover:text-teal-400 transition-colors font-medium">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-black font-bold text-lg rounded-xl hover:shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/10 text-center">
                        <p className="text-gray-400">
                            ¿No tenés una cuenta?{' '}
                            <Link href="/registro" className="text-white font-bold hover:text-teal-400 transition-colors inline-block ml-1">
                                Creá tu cuenta gratis
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
