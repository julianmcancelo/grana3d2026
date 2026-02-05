"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Loader2, Store, AlertTriangle, Check } from 'lucide-react'
import api from '@/lib/api'

interface Config {
    modoProximamente: boolean
    textoProximamente: string
    nombreTienda: string
    whatsapp: string
    email: string
    instagram: string
}

export default function ConfiguracionAdmin() {
    const [config, setConfig] = useState<Config>({
        modoProximamente: false,
        textoProximamente: '¡Estamos preparando algo increíble! Muy pronto podrás comprar online.',
        nombreTienda: 'Grana3D',
        whatsapp: '',
        email: '',
        instagram: ''
    })
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [guardado, setGuardado] = useState(false)

    useEffect(() => {
        cargarConfig()
    }, [])

    const cargarConfig = async () => {
        try {
            const { data } = await api.get('/admin/configuracion')
            if (data.config) {
                setConfig(prev => ({ ...prev, ...data.config }))
            }
        } catch (error) {
            console.error('Error cargando config:', error)
        } finally {
            setLoading(false)
        }
    }

    const guardarConfig = async () => {
        setGuardando(true)
        setGuardado(false)
        try {
            await api.post('/admin/configuracion', config)
            setGuardado(true)
            setTimeout(() => setGuardado(false), 2000)
        } catch (error) {
            console.error('Error guardando config:', error)
        } finally {
            setGuardando(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Configuración</h1>
                    <p className="text-gray-400">Ajustes generales de la tienda</p>
                </div>
                <button
                    onClick={guardarConfig}
                    disabled={guardando}
                    className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                    {guardando ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : guardado ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {guardado ? 'Guardado!' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Modo Próximamente */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Modo Próximamente</h2>
                            <p className="text-sm text-gray-400">Muestra un mensaje de "próximamente" en la tienda</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center gap-4 cursor-pointer p-4 bg-black/30 rounded-xl hover:bg-black/50 transition-colors">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={config.modoProximamente}
                                    onChange={(e) => setConfig({ ...config, modoProximamente: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-8 bg-gray-700 rounded-full peer-checked:bg-teal-500 transition-colors" />
                                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full peer-checked:translate-x-6 transition-transform" />
                            </div>
                            <div>
                                <div className="font-bold">Activar modo Próximamente</div>
                                <div className="text-sm text-gray-400">La tienda mostrará un mensaje en lugar de los productos</div>
                            </div>
                        </label>

                        {config.modoProximamente && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="overflow-hidden"
                            >
                                <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje a mostrar</label>
                                <textarea
                                    value={config.textoProximamente}
                                    onChange={(e) => setConfig({ ...config, textoProximamente: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500 resize-none"
                                    placeholder="¡Estamos preparando algo increíble!"
                                />
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Datos de la Tienda */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-900 border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-teal-500/10 rounded-xl">
                            <Store className="w-6 h-6 text-teal-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Datos de la Tienda</h2>
                            <p className="text-sm text-gray-400">Información de contacto y configuración básica</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de la tienda</label>
                            <input
                                type="text"
                                value={config.nombreTienda}
                                onChange={(e) => setConfig({ ...config, nombreTienda: e.target.value })}
                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={config.whatsapp}
                                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                                placeholder="+54 9 11 XXXX XXXX"
                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <input
                                type="email"
                                value={config.email}
                                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                placeholder="contacto@tienda.com"
                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Instagram</label>
                            <input
                                type="text"
                                value={config.instagram}
                                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                                placeholder="@tu_tienda"
                                className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
