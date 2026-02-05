"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Calendar, Clock, ArrowRight, Truck, CheckCircle, AlertCircle } from 'lucide-react'

// Interfaces (tipado)
interface Pedido {
    id: string
    numero: number
    createdAt: string
    total: number
    estado: string
    items: any[]
}

export default function MisPedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const obtenerPedidos = async () => {
            // Verificar si hay usuario logueado
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch('/api/pedidos/mis-pedidos', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (!res.ok) {
                    if (res.status === 401) {
                        router.push('/auth/login')
                        return
                    }
                    throw new Error('Error al cargar pedidos')
                }

                const data = await res.json()
                setPedidos(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }

        obtenerPedidos()
    }, [router])

    if (cargando) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-7 h-7 text-teal-600" />
                        Mis Pedidos
                    </h1>
                    <Link href="/" className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        Volver a la Tienda
                    </Link>
                </div>

                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Aún no tenés pedidos</h2>
                        <p className="text-gray-500 mb-8">¡Explorá nuestra tienda y encontrá lo que buscás!</p>
                        <Link href="/" className="inline-flex items-center justify-center px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors">
                            Ir a Comprar
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido) => (
                            <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-bold text-gray-900">Pedido #{pedido.numero}</span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                    pedido.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    pedido.estado === 'PAGADO' || pedido.estado === 'CONFIRMADO' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    pedido.estado === 'ENVIADO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                    {pedido.estado}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {new Date(pedido.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900">${pedido.total.toLocaleString('es-AR')}</div>
                                            <div className="text-xs text-gray-500">{pedido.items.length} productos</div>
                                        </div>
                                    </div>

                                    {/* Preview de Items (solo los primeros 2) */}
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                        <div className="space-y-2 mb-4">
                                            {pedido.items.slice(0, 2).map((item: any, i) => (
                                                <div key={i} className="flex justify-between text-sm">
                                                    <span className="text-gray-600 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        {item.nombre} <span className="text-gray-400">x{item.cantidad}</span>
                                                    </span>
                                                    <span className="font-medium text-gray-900">${(item.subtotal || 0).toLocaleString('es-AR')}</span>
                                                </div>
                                            ))}
                                            {pedido.items.length > 2 && (
                                                <div className="text-xs text-gray-400 pl-3.5">
                                                    + {pedido.items.length - 2} productos más...
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-end">
                                            <Link href={`/pedidos/${pedido.id}`} className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
                                                Ver detalle completo <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
