"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function ModalUsuario() {
    const { modalAbierto, tipoModal, cerrarModal, abrirModal, login, registro } = useUsuario()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [nombre, setNombre] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')

    // Limpiar formulario al cerrar o cambiar tipo
    useEffect(() => {
        setEmail('')
        setPassword('')
        setNombre('')
        setConfirmPassword('')
        setError('')
        setMostrarPassword(false)
    }, [modalAbierto, tipoModal])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validaciones
        if (!email || !password) {
            setError('Completá todos los campos')
            return
        }

        if (tipoModal === 'registro') {
            if (!nombre) {
                setError('Ingresá tu nombre')
                return
            }
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres')
                return
            }
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden')
                return
            }
        }

        setEnviando(true)

        try {
            if (tipoModal === 'login') {
                await login(email, password)
            } else {
                await registro(nombre, email, password)
            }
        } catch (err) {
            // El error ya se maneja en el context con SweetAlert
        } finally {
            setEnviando(false)
        }
    }

    const cambiarTipo = () => {
        abrirModal(tipoModal === 'login' ? 'registro' : 'login')
    }

    return (
        <AnimatePresence>
            {modalAbierto && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={cerrarModal}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl shadow-2xl overflow-hidden">

                            {/* Fondo decorativo */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            {/* Contenido */}
                            <div className="relative z-10 p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 text-teal-400 text-sm font-bold mb-1">
                                            <Sparkles className="w-4 h-4" />
                                            {tipoModal === 'login' ? 'BIENVENIDO' : 'ÚNETE'}
                                        </div>
                                        <h2 className="text-3xl font-black text-white">
                                            {tipoModal === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                        </h2>
                                    </div>
                                    <button
                                        onClick={cerrarModal}
                                        className="p-2 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Formulario */}
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {tipoModal === 'registro' && (
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type="text"
                                                placeholder="Tu nombre"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    )}

                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all"
                                        />
                                    </div>

                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            placeholder="Contraseña"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {tipoModal === 'registro' && (
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <input
                                                type={mostrarPassword ? 'text' : 'password'}
                                                placeholder="Confirmar contraseña"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all"
                                            />
                                        </div>
                                    )}

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Botón Submit */}
                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white dark:text-black font-bold text-lg rounded-xl hover:from-teal-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 group"
                                    >
                                        {enviando ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {tipoModal === 'login' ? 'Entrar' : 'Crear Cuenta'}
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Separador */}
                                <div className="relative my-8">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-4 bg-gray-900 text-gray-500 text-sm">o</span>
                                    </div>
                                </div>

                                {/* Cambiar tipo */}
                                <div className="text-center">
                                    <p className="text-gray-400">
                                        {tipoModal === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}
                                        <button
                                            onClick={cambiarTipo}
                                            className="ml-2 text-teal-400 hover:text-teal-300 font-bold transition-colors"
                                        >
                                            {tipoModal === 'login' ? 'Crear una' : 'Iniciar sesión'}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
