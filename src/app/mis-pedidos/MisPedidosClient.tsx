"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Calendar, Clock, ArrowRight, Truck, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'

// Interfaces (tipado)
interface Pedido {
    id: string
    numero: number
    createdAt: string
    total: number
    estado: string
    items: any[]
}

export default function MisPedidosClient() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const obtenerPedidos = async () => {
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

    return (
        <div className="bg-[#f5f5f7] dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#00AE42] selection:text-white pb-20">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
                        <Package className="w-8 h-8 text-[#00AE42]" />
                        Mis Pedidos
                    </h1>
                    <Link href="/" className="text-[#00AE42] hover:text-[#008a34] font-bold text-sm transition-colors">
                        Volver a la Tienda
                    </Link>
                </div>

                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#00AE42] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Cargando tus compras...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{error}</span>
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-800">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-[#222] rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aún no tenés pedidos</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">¡Explorá nuestra tienda y encontrá productos de ingeniería increíbles!</p>
                        <Link href="/tienda" className="inline-flex items-center justify-center px-8 py-3 bg-[#00AE42] text-white font-bold rounded-xl hover:bg-[#008a34] transition-colors shadow-lg hover:shadow-[#00AE42]/20">
                            Ir a la Tienda
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido) => (
                            <div key={pedido.id} className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-[#00AE42]/30 transition-all group">
                                <div className="p-6">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Pedido #{pedido.numero}</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                    pedido.estado === 'PENDIENTE' ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800' :
                                                    pedido.estado === 'PAGADO' || pedido.estado === 'CONFIRMADO' ? 'bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                    pedido.estado === 'ENVIADO' ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                    'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                                                }`}>
                                                    {pedido.estado}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(pedido.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black text-gray-900 dark:text-white">${pedido.total.toLocaleString('es-AR')}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{pedido.items.length} productos</div>
                                        </div>
                                    </div>

                                    {/* Preview de Items */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <div className="space-y-3 mb-4">
                                            {pedido.items.slice(0, 2).map((item: any, i) => (
                                                <div key={i} className="flex justify-between text-sm items-center">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-3">
                                                        <span className="w-2 h-2 rounded-full bg-[#00AE42]"></span>
                                                        {item.nombre} <span className="text-gray-400">x{item.cantidad}</span>
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">${(item.subtotal || 0).toLocaleString('es-AR')}</span>
                                                </div>
                                            ))}
                                            {pedido.items.length > 2 && (
                                                <div className="text-xs font-bold text-gray-400 pl-5">
                                                    + {pedido.items.length - 2} productos más...
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-end">
                                            <Link href={`/pedidos/${pedido.id}`} className="text-[#00AE42] hover:text-[#008a34] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
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
