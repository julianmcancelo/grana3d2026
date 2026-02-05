"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    DollarSign, ShoppingBag, Package, TrendingUp,
    ArrowUpRight, Clock, AlertTriangle, Loader2, Plus
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
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    const stats = [
        { label: 'Ventas Totales', value: `$${(data?.totalVentas || 0).toLocaleString('es-AR')}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
        { label: 'Pedidos', value: data?.totalPedidos || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Productos', value: data?.totalProductos || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Pendientes', value: data?.pedidosPendientes || 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-gray-400">Resumen de actividad de la tienda</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/productos" className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-black rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
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
                        className="bg-gray-900 border border-white/10 p-6 rounded-2xl"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Últimos Pedidos */}
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Últimos Pedidos</h3>
                        <Link href="/admin/pedidos" className="text-teal-500 text-sm hover:underline">Ver todos</Link>
                    </div>
                    <div className="space-y-4">
                        {data?.ultimosPedidos.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hay pedidos todavía</p>
                        ) : (
                            data?.ultimosPedidos.map((pedido: any) => (
                                <div key={pedido.id} className="flex items-center justify-between p-4 bg-black/20 rounded-xl hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center font-bold text-gray-500">#{pedido.numero}</div>
                                        <div>
                                            <div className="font-bold">{pedido.nombreCliente}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(pedido.createdAt).toLocaleDateString('es-AR')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-teal-400">${pedido.total?.toLocaleString('es-AR')}</div>
                                        <div className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 ${pedido.estado === 'PENDIENTE' ? 'bg-yellow-500/10 text-yellow-500' :
                                                pedido.estado === 'ENTREGADO' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-blue-500/10 text-blue-500'
                                            }`}>
                                            {pedido.estado}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Productos con Stock Bajo */}
                <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                            Stock Bajo
                        </h3>
                        <Link href="/admin/productos" className="text-teal-500 text-sm hover:underline">Ver todos</Link>
                    </div>
                    <div className="space-y-4">
                        {data?.productosBajoStock.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No hay productos con stock bajo</p>
                        ) : (
                            data?.productosBajoStock.map((producto: any) => (
                                <div key={producto.id} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl">
                                    <div className="w-12 h-12 bg-gray-800 rounded-lg shrink-0 overflow-hidden">
                                        {producto.imagen ? (
                                            <img src={producto.imagen} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold truncate">{producto.nombre}</div>
                                        <div className="text-xs text-gray-500">{producto.categoria?.nombre || 'Sin categoría'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${producto.stock === 0 ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {producto.stock} un.
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
