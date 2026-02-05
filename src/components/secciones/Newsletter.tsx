"use client"
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Sparkles, Check, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface NewsletterProps {
    titulo?: string
    subtitulo?: string
}

export default function Newsletter({ titulo, subtitulo }: NewsletterProps) {
    const [email, setEmail] = useState('')
    const [nombre, setNombre] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await api.post('/newsletter', { email, nombre })
            setSuccess(true)
            setEmail('')
            setNombre('')
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al suscribir')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="py-16 md:py-20 bg-gradient-to-br from-teal-600 to-emerald-700 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <Sparkles className="w-12 h-12 text-white/80 mx-auto mb-6" />

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
                        {titulo || '¡No te pierdas nada!'}
                    </h2>

                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                        {subtitulo || 'Suscribite a nuestro newsletter y recibí ofertas exclusivas, novedades y descuentos especiales.'}
                    </p>

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-bold"
                        >
                            <Check className="w-6 h-6" />
                            ¡Gracias por suscribirte!
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Tu email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/20 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-all disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Suscribirme
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <p className="mt-3 text-red-200 text-sm">{error}</p>
                            )}

                            <p className="mt-4 text-sm text-white/60">
                                🔒 Sin spam. Podés cancelar en cualquier momento.
                            </p>
                        </form>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
