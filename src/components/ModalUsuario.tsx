"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Box } from 'lucide-react'
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto">

                            {/* Decorative Top Bar */}
                            <div className="h-1.5 w-full bg-[#00AE42]" />

                            {/* Contenido */}
                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#00AE42] rounded-lg flex items-center justify-center text-black">
                                            <Box className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white leading-none">
                                                {tipoModal === 'login' ? 'Bienvenido' : 'Crear Cuenta'}
                                            </h2>
                                            <p className="text-gray-500 text-xs mt-1 font-medium tracking-wide">GRANA3D ID</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={cerrarModal}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Formulario */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {tipoModal === 'registro' && (
                                        <div className="group">
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#00AE42] transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre Completo"
                                                    value={nombre}
                                                    onChange={(e) => setNombre(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="group">
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#00AE42] transition-colors" />
                                            <input
                                                type="email"
                                                placeholder="Correo electrónico"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#00AE42] transition-colors" />
                                            <input
                                                type={mostrarPassword ? 'text' : 'password'}
                                                placeholder="Contraseña"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-12 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
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

                                    {tipoModal === 'registro' && (
                                        <div className="group">
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#00AE42] transition-colors" />
                                                <input
                                                    type={mostrarPassword ? 'text' : 'password'}
                                                    placeholder="Confirmar contraseña"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00AE42] focus:bg-[#222] transition-all font-medium text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Error */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-xs font-bold text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Botón Submit */}
                                    <button
                                        type="submit"
                                        disabled={enviando}
                                        className="w-full py-4 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00AE42]/10 mt-4 group"
                                    >
                                        {enviando ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {tipoModal === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                {/* Footer */}
                                <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                                    <p className="text-gray-500 text-sm">
                                        {tipoModal === 'login' ? '¿Nuevo en Grana3D?' : '¿Ya tenés cuenta?'}
                                        <button
                                            onClick={cambiarTipo}
                                            className="ml-2 text-[#00AE42] hover:underline font-bold transition-colors"
                                        >
                                            {tipoModal === 'login' ? 'Crear cuenta' : 'Ingresar'}
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
