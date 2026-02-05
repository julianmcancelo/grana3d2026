"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Truck, Store, CreditCard, Banknote, Landmark, Check, AlertCircle, ShoppingCart, Ticket } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'

interface FormData {
    nombre: string
    apellido: string
    email: string
    telefono: string
    dni: string
    direccion: string
    ciudad: string
    provincia: string
    codigoPostal: string
    metodoEnvio: 'RETIRO_LOCAL' | 'CORREO_ARGENTINO' | 'ANDREANI' | 'ENVIO_PROPIO'
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'TARJETA'
}

const initialForm: FormData = {
    nombre: '', apellido: '', email: '', telefono: '', dni: '',
    direccion: '', ciudad: '', provincia: '', codigoPostal: '',
    metodoEnvio: 'RETIRO_LOCAL',
    metodoPago: 'EFECTIVO'
}

import CuponInput from '@/components/CuponInput'

export default function CheckoutPage() {
    const { items, total: subtotalCarrito, vaciarCarrito } = useCarrito()
    const router = useRouter()

    // Estados del formulario
    const [form, setForm] = useState<FormData>(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Estados del cupón
    const [descuentoCupon, setDescuentoCupon] = useState(0)
    const [codigoCupon, setCodigoCupon] = useState<string | null>(null)

    // Calculamos el total final dinámicamente
    const totalConDescuento = subtotalCarrito - descuentoCupon
    // Si paga con transferencia, aplicamos el 10% SOBRE el total ya descontado
    const totalFinal = form.metodoPago === 'TRANSFERENCIA' ? totalConDescuento * 0.9 : totalConDescuento

    // Handler para el componente hijo
    const handleAplicarCupon = (descuento: number, codigo: string | null) => {
        setDescuentoCupon(descuento)
        setCodigoCupon(codigo)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ id: i.id, cantidad: i.cantidad, variante: i.variante })),
                    cliente: {
                        nombre: form.nombre,
                        apellido: form.apellido,
                        email: form.email,
                        telefono: form.telefono,
                        dni: form.dni,
                        direccion: form.metodoEnvio !== 'RETIRO_LOCAL' ? form.direccion : undefined,
                        ciudad: form.metodoEnvio !== 'RETIRO_LOCAL' ? form.ciudad : undefined,
                        provincia: form.metodoEnvio !== 'RETIRO_LOCAL' ? form.provincia : undefined,
                        codigoPostal: form.metodoEnvio !== 'RETIRO_LOCAL' ? form.codigoPostal : undefined
                    },
                    cuponCodigo: codigoCupon, // Enviamos el cupón al backend
                    metodoPago: form.metodoPago,
                    metodoEnvio: form.metodoEnvio
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido')

            vaciarCarrito()

            // Si hay URL de pago (Mercado Pago), redirigimos ahí
            if (data.urlPago) {
                window.location.href = data.urlPago
                return
            }

            // Si no, vamos a la página de éxito
            router.push(`/checkout/success/${data.pedido.id}`)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h1>
                    <p className="text-gray-500 mb-8">Agregá productos para comenzar el proceso de compra.</p>
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-8">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 text-sm font-medium">
                        <ChevronLeft className="w-4 h-4" /> Volver
                    </Link>
                    <span className="text-gray-300">|</span>
                    <h1 className="text-2xl font-bold text-gray-900">Finalizar Compra</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Columna Izquierda: Formulario */}
                    <div className="lg:col-span-7 space-y-6">
                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">

                            {/* Datos de Contacto */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">1</div>
                                    Datos de Contacto
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Nombre *</label>
                                        <input required name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Apellido</label>
                                        <input name="apellido" value={form.apellido} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700">Email *</label>
                                        <input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Teléfono *</label>
                                        <input required type="tel" name="telefono" value={form.telefono} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">DNI / CUIL</label>
                                        <input name="dni" value={form.dni} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all" />
                                    </div>
                                </div>
                            </section>

                            {/* Método de Envío */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">2</div>
                                    Método de Envío
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${form.metodoEnvio === 'RETIRO_LOCAL' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="metodoEnvio" value="RETIRO_LOCAL" checked={form.metodoEnvio === 'RETIRO_LOCAL'} onChange={handleChange as any} className="hidden" />
                                        <Store className={`w-6 h-6 ${form.metodoEnvio === 'RETIRO_LOCAL' ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <div>
                                            <div className="font-medium text-gray-900">Retiro en Local</div>
                                            <div className="text-xs text-gray-500">Gratis - Zona Centro</div>
                                        </div>
                                    </label>
                                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-3 transition-all ${form.metodoEnvio === 'CORREO_ARGENTINO' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="metodoEnvio" value="CORREO_ARGENTINO" checked={form.metodoEnvio === 'CORREO_ARGENTINO'} onChange={handleChange as any} className="hidden" />
                                        <Truck className={`w-6 h-6 ${form.metodoEnvio === 'CORREO_ARGENTINO' ? 'text-teal-600' : 'text-gray-400'}`} />
                                        <div>
                                            <div className="font-medium text-gray-900">Envío a Domicilio</div>
                                            <div className="text-xs text-gray-500">Correo Argentino / Andreani</div>
                                        </div>
                                    </label>
                                </div>

                                <AnimatePresence>
                                    {form.metodoEnvio !== 'RETIRO_LOCAL' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">Dirección *</label>
                                                <input required name="direccion" value={form.direccion} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" placeholder="Calle y número" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-700">Ciudad *</label>
                                                    <input required name="ciudad" value={form.ciudad} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-700">Provincia *</label>
                                                    <input required name="provincia" value={form.provincia} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium text-gray-700">Código Postal *</label>
                                                    <input required name="codigoPostal" value={form.codigoPostal} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </section>

                            {/* Método de Pago */}
                            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold">3</div>
                                    Método de Pago
                                </h2>
                                <div className="space-y-3">
                                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-all ${form.metodoPago === 'EFECTIVO' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="metodoPago" value="EFECTIVO" checked={form.metodoPago === 'EFECTIVO'} onChange={handleChange as any} className="hidden" />
                                        <Banknote className="w-6 h-6 text-green-600" />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Efectivo contra entrega</div>
                                            <div className="text-xs text-gray-500">Pagás al recibir o retirar</div>
                                        </div>
                                    </label>
                                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-all ${form.metodoPago === 'TRANSFERENCIA' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="metodoPago" value="TRANSFERENCIA" checked={form.metodoPago === 'TRANSFERENCIA'} onChange={handleChange as any} className="hidden" />
                                        <Landmark className="w-6 h-6 text-blue-600" />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Transferencia Bancaria</div>
                                            <div className="text-xs text-gray-500">10% de descuento adicional</div>
                                        </div>
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">-10%</span>
                                    </label>
                                    <label className={`cursor-pointer border p-4 rounded-xl flex items-center gap-4 transition-all ${form.metodoPago === 'MERCADOPAGO' ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input type="radio" name="metodoPago" value="MERCADOPAGO" checked={form.metodoPago === 'MERCADOPAGO'} onChange={handleChange as any} className="hidden" />
                                        <CreditCard className="w-6 h-6 text-cyan-500" />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Mercado Pago</div>
                                            <div className="text-xs text-gray-500">Tarjetas de crédito, débito, dinero en cuenta</div>
                                        </div>
                                    </label>
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Columna Derecha: Resumen */}
                    <div className="lg:col-span-5 space-y-6">
                        <CuponInput total={subtotalCarrito} onAplicar={handleAplicarCupon} />

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {item.imagen ? (
                                                <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sin foto</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-gray-900 truncate">{item.nombre}</h3>
                                            <p className="text-xs text-gray-500">Cantidad: {item.cantidad}</p>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${subtotalCarrito.toLocaleString('es-AR')}</span>
                                </div>

                                {descuentoCupon > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span className="flex items-center gap-1"><Ticket className="w-3 h-3" /> Cupón ({codigoCupon})</span>
                                        <span>-${descuentoCupon.toLocaleString('es-AR')}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Envío</span>
                                    <span>{form.metodoEnvio === 'RETIRO_LOCAL' ? 'Gratis' : 'A convenir'}</span>
                                </div>
                                {form.metodoPago === 'TRANSFERENCIA' && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Descuento Transferencia (10%)</span>
                                        <span>-${(totalConDescuento * 0.1).toLocaleString('es-AR')}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-bold text-teal-600">
                                        ${totalFinal.toLocaleString('es-AR')}
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                form="checkout-form"
                                disabled={loading}
                                className="w-full mt-6 bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" /> Confirmar Compra
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-400 mt-4">
                                Al confirmar, aceptás nuestros términos y condiciones.
                                Tus datos están protegidos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
