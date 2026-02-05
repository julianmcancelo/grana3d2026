"use client"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useUsuario } from '@/context/UsuarioContext'

export default function ModalUsuario() {
    const { modalAbierto, tipoModal, cerrarModal, abrirModal, login, registro } = useUsuario()

    const [error, setError] = useState('')
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [enviando, setEnviando] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setEnviando(true)
        try {
            if (tipoModal === 'login') {
                await login(email, password)
            } else {
                await registro(nombre, email, password)
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || err?.message || 'Error inesperado')
        } finally {
            setEnviando(false)
        }
    }

    const limpiar = () => {
        setNombre('')
        setEmail('')
        setPassword('')
        setError('')
    }

    return (
        <AnimatePresence>
            {modalAbierto && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { cerrarModal(); limpiar() }}
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {tipoModal === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                </h2>
                                <button onClick={() => { cerrarModal(); limpiar() }} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        {error}
                                    </div>
                                )}

                                {tipoModal === 'registro' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={nombre}
                                                onChange={(e) => setNombre(e.target.value)}
                                                placeholder="Tu nombre"
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@email.com"
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={mostrarPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarPassword(!mostrarPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={enviando}
                                    className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {enviando ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : tipoModal === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                                </button>
                            </form>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
                                {tipoModal === 'login' ? (
                                    <p className="text-gray-600 text-sm">
                                        ¿No tenés cuenta?{' '}
                                        <button onClick={() => { abrirModal('registro'); limpiar() }} className="text-teal-600 font-medium hover:underline">
                                            Registrate
                                        </button>
                                    </p>
                                ) : (
                                    <p className="text-gray-600 text-sm">
                                        ¿Ya tenés cuenta?{' '}
                                        <button onClick={() => { abrirModal('login'); limpiar() }} className="text-teal-600 font-medium hover:underline">
                                            Iniciá sesión
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
