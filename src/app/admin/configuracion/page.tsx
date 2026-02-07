"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Loader2, Store, AlertTriangle, Check, Mail, Send } from 'lucide-react'
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
    const [testEmail, setTestEmail] = useState('')
    const [sendingTest, setSendingTest] = useState<string | null>(null)

    useEffect(() => {
        cargarConfig()
    }, [])

    const cargarConfig = async () => {
        try {
            const { data } = await api.get('/admin/configuracion')
            if (data.config) {
                // Ensure boolean conversion if necessary
                const modo = typeof data.config.modoProximamente === 'string'
                    ? data.config.modoProximamente === 'true'
                    : data.config.modoProximamente

                setConfig(prev => ({ ...prev, ...data.config, modoProximamente: modo }))
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

    const handleTestEmail = async (type: string) => {
        if (!testEmail) return
        setSendingTest(type)
        try {
            await api.get(`/test-email?to=${testEmail}&type=${type}`)
            alert('Correo de prueba enviado con éxito')
        } catch (error) {
            console.error('Error enviando correo de prueba:', error)
            alert('Error al enviar el correo de prueba')
        } finally {
            setSendingTest(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#00AE42]" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-white tracking-tight">Configuración</h1>
                    <p className="text-gray-500 text-sm">Control general del sistema.</p>
                </div>
                <button
                    onClick={guardarConfig}
                    disabled={guardando}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00AE42] hover:bg-[#008a34] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-[#00AE42]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {guardando ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : guardado ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {guardado ? 'Guardado' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="space-y-6">
                {/* MANTENIMIENTO CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Estado de la Tienda</h2>
                            <p className="text-sm text-gray-500">Control de acceso público y modo mantenimiento.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                            <div>
                                <div className="font-bold text-white mb-1">Modo Mantenimiento</div>
                                <div className="text-sm text-gray-500">Si está activo, los clientes verán la pantalla de espera.</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={config.modoProximamente}
                                    onChange={(e) => setConfig({ ...config, modoProximamente: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00AE42] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#00AE42]"></div>
                            </label>
                        </div>

                        <motion.div
                            initial={false}
                            animate={{ height: config.modoProximamente ? 'auto' : 0, opacity: config.modoProximamente ? 1 : 0 }}
                            className="overflow-hidden"
                        >
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Mensaje de Espera</label>
                            <textarea
                                value={config.textoProximamente}
                                onChange={(e) => setConfig({ ...config, textoProximamente: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#00AE42] resize-none transition-colors"
                                placeholder="Escribí un mensaje copado..."
                            />
                        </motion.div>
                    </div>
                </motion.div>

                {/* DATOS CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                        <div className="p-3 bg-[#00AE42]/10 rounded-lg">
                            <Store className="w-6 h-6 text-[#00AE42]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Información Pública</h2>
                            <p className="text-sm text-gray-500">Datos de contacto visibles en el footer.</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre de la tienda</label>
                            <input
                                type="text"
                                value={config.nombreTienda}
                                onChange={(e) => setConfig({ ...config, nombreTienda: e.target.value })}
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#00AE42] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">WhatsApp</label>
                            <input
                                type="tel"
                                value={config.whatsapp}
                                onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                                placeholder="+54 9 11..."
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#00AE42] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email de Contacto</label>
                            <input
                                type="email"
                                value={config.email}
                                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                                placeholder="hola@..."
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#00AE42] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instagram</label>
                            <input
                                type="text"
                                value={config.instagram}
                                onChange={(e) => setConfig({ ...config, instagram: e.target.value })}
                                placeholder="@usuario"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#00AE42] transition-colors"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* TEST EMAIL CARD */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-800 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Mail className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Prueba de Correos</h2>
                            <p className="text-sm text-gray-500">Verifica que los correos lleguen correctamente.</p>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email de Pruebas</label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleTestEmail('welcome')}
                                disabled={!testEmail || !!sendingTest}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {sendingTest === 'welcome' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-blue-500" />}
                                Bienvenida
                            </button>
                            <button
                                onClick={() => handleTestEmail('order_transfer')}
                                disabled={!testEmail || !!sendingTest}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {sendingTest === 'order_transfer' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-green-500" />}
                                Pedido (Transferencia)
                            </button>
                            <button
                                onClick={() => handleTestEmail('order_cash')}
                                disabled={!testEmail || !!sendingTest}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {sendingTest === 'order_cash' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-orange-500" />}
                                Pedido (Efectivo)
                            </button>
                            <button
                                onClick={() => handleTestEmail('order_mp')}
                                disabled={!testEmail || !!sendingTest}
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-50"
                            >
                                {sendingTest === 'order_mp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-sky-500" />}
                                Pedido (MercadoPago)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
