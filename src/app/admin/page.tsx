"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    DollarSign, ShoppingBag, Package, TrendingUp,
    ArrowUpRight, Clock, AlertTriangle, Loader2, Plus,
    ArrowRight
} from 'lucide-react'
import api from '@/lib/api'

interface DashboardData {
    totalVentas: number
    totalPedidos: number
    totalProductos: number
    pedidosPendientes: number
    ultimosPedidos: any[]
    productosBajoStock: any[]
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            const [pedidosRes, productosRes] = await Promise.all([
                api.get('/admin/pedidos'),
                api.get('/productos?limit=100')
            ])

            const pedidos = pedidosRes.data.pedidos || []
            const productos = productosRes.data.productos || productosRes.data || []

            setData({
                totalVentas: pedidos
                    .filter((p: any) => p.estado !== 'CANCELADO')
                    .reduce((acc: number, p: any) => acc + (p.total || 0), 0),
                totalPedidos: pedidos.length,
                totalProductos: productos.length,
                pedidosPendientes: pedidos.filter((p: any) => p.estado === 'PENDIENTE').length,
                ultimosPedidos: pedidos.slice(0, 5),
                productosBajoStock: productos.filter((p: any) => p.stock < 5).slice(0, 5)
            })
        } catch (error) {
            console.error('Error cargando dashboard:', error)
            setData({
                totalVentas: 0,
                totalPedidos: 0,
                totalProductos: 0,
                pedidosPendientes: 0,
                ultimosPedidos: [],
                productosBajoStock: []
            })
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-[#00AE42]" />
            </div>
        )
    }

    const stats = [
        { label: 'Ventas Totales', value: `$${(data?.totalVentas || 0).toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-[#00AE42]', bg: 'bg-[#00AE42]/10', border: 'border-[#00AE42]/20' },
        { label: 'Pedidos Totales', value: data?.totalPedidos || 0, icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Productos Activos', value: data?.totalProductos || 0, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
        { label: 'Pendientes', value: data?.pedidosPendientes || 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black mb-1 text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 text-sm">Visión general del rendimiento.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/productos?nuevo=true" className="px-4 py-2.5 bg-[#00AE42] hover:bg-[#008a34] text-white rounded-lg text-sm font-bold transition-all shadow-lg hover:shadow-[#00AE42]/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-[#111] border ${stat.border} p-6 rounded-xl hover:bg-[#161616] transition-colors`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            {i === 0 && <span className="text-xs font-bold text-[#00AE42] bg-[#00AE42]/10 px-2 py-1 rounded">+12%</span>}
                        </div>
                        <h3 className="text-2xl font-bold mb-1 text-white">{stat.value}</h3>
                        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Últimos Pedidos */}
                <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gray-500" /> Últimos Pedidos
                        </h3>
                        <Link href="/admin/pedidos" className="text-[#00AE42] text-xs font-bold hover:underline flex items-center gap-1">
                            Ver todos <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-2">
                        {data?.ultimosPedidos.length === 0 ? (
                            <p className="text-gray-500 text-center py-12 text-sm">No hay actividad reciente</p>
                        ) : (
                            <div className="space-y-1">
                                {data?.ultimosPedidos.map((pedido: any) => (
                                    <div key={pedido.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#222] rounded-md flex items-center justify-center font-mono text-xs text-gray-400 border border-gray-800 group-hover:border-gray-700">
                                                #{pedido.numero}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-gray-200">{pedido.nombreCliente}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">
                                                    {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-white text-sm">${pedido.total?.toLocaleString('es-AR')}</div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wide ${pedido.estado === 'PENDIENTE' ? 'bg-orange-500/10 text-orange-500' :
                                                    pedido.estado === 'ENTREGADO' ? 'bg-[#00AE42]/10 text-[#00AE42]' :
                                                        'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {pedido.estado}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Productos con Stock Bajo */}
                <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Stock Crítico
                        </h3>
                        <Link href="/admin/productos" className="text-[#00AE42] text-xs font-bold hover:underline flex items-center gap-1">
                            Gestionar <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-2">
                        {data?.productosBajoStock.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                                <Check className="w-8 h-8 text-[#00AE42]/50" />
                                <p className="text-sm">Inventario saludable</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {data?.productosBajoStock.map((producto: any) => (
                                    <div key={producto.id} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors group">
                                        <div className="w-10 h-10 bg-[#222] rounded-md shrink-0 overflow-hidden border border-gray-800">
                                            {producto.imagen ? (
                                                <img src={producto.imagen} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-200 truncate">{producto.nombre}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{producto.categoria?.nombre || 'General'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-sm ${producto.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                                {producto.stock} un.
                                            </div>
                                            <div className="text-[10px] text-gray-600">Restante</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Check({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
