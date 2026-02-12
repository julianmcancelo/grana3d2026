"use client"
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    DollarSign, ShoppingBag, Package, TrendingUp, Users,
    ArrowUpRight, Clock, AlertTriangle, Loader2, Plus,
    ArrowRight, Truck, CreditCard, Briefcase, BarChart3,
    ShoppingCart, Eye, Star, Globe, Store, Instagram,
    Calendar, Zap, Target, Activity
} from 'lucide-react'
import api from '@/lib/api'

interface Stats {
    ventasTotales: number
    ventasMes: number
    ventasSemana: number
    ventasHoy: number
    ticketPromedio: number
    totalPedidos: number
    pedidosMes: number
    pedidosHoy: number
    pendientes: number
    enviados: number
    totalProductos: number
    productosActivos: number
    productosBajoStock: number
    totalUsuarios: number
    mayoristas: number
}

interface DashboardData {
    stats: Stats
    ventasPorMes: { mes: string; ventas: number; pedidos: number }[]
    topProductos: { nombre: string; cantidad: number; ventas: number }[]
    metodosPago: Record<string, { count: number; total: number }>
    origenes: Record<string, { count: number; total: number }>
    metodosEnvio: Record<string, number>
    ultimosPedidos: any[]
    productosBajoStockLista: any[]
}

const origenIcons: Record<string, any> = {
    WEB: Globe,
    MERCADOLIBRE: ShoppingCart,
    INSTAGRAM: Instagram,
    LOCAL: Store,
}

const origenColors: Record<string, string> = {
    WEB: '#00AE42',
    MERCADOLIBRE: '#FFE600',
    INSTAGRAM: '#E4405F',
    LOCAL: '#3B82F6',
}

const estadoColores: Record<string, { bg: string; text: string }> = {
    PENDIENTE: { bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
    CONFIRMADO: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
    PAGADO: { bg: 'bg-blue-400/10', text: 'text-blue-400' },
    EN_PROCESO: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
    ENVIADO: { bg: 'bg-teal-500/10', text: 'text-teal-500' },
    ENTREGADO: { bg: 'bg-green-500/10', text: 'text-green-500' },
    CANCELADO: { bg: 'bg-red-500/10', text: 'text-red-500' },
}

const pagoLabels: Record<string, string> = {
    TRANSFERENCIA: 'Transferencia',
    MERCADOPAGO: 'Mercado Pago',
    EFECTIVO: 'Efectivo',
    TARJETA: 'Tarjeta',
}

const pagoColors: Record<string, string> = {
    TRANSFERENCIA: '#00AE42',
    MERCADOPAGO: '#009ee3',
    EFECTIVO: '#F59E0B',
    TARJETA: '#8B5CF6',
}

function formatoPrecio(n: number) {
    return '$' + n.toLocaleString('es-AR')
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/admin/estadisticas')
            .then(res => setData(res.data))
            .catch(err => console.error('Error cargando dashboard:', err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#00AE42] mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">Cargando estadísticas...</p>
                </div>
            </div>
        )
    }

    if (!data) return <p className="text-gray-500 text-center p-12">Error cargando datos</p>

    const { stats, ventasPorMes, topProductos, metodosPago, origenes, ultimosPedidos, productosBajoStockLista } = data
    const maxVentaMes = Math.max(...ventasPorMes.map(v => v.ventas), 1)
    const maxTopProducto = Math.max(...topProductos.map(p => p.cantidad), 1)
    const totalPagoCount = Object.values(metodosPago).reduce((sum, v) => sum + v.count, 0) || 1

    // Calculate growth % (this month vs last month)
    const ventasMesAnterior = ventasPorMes.length >= 2 ? ventasPorMes[ventasPorMes.length - 2].ventas : 0
    const crecimiento = ventasMesAnterior > 0
        ? Math.round(((stats.ventasMes - ventasMesAnterior) / ventasMesAnterior) * 100)
        : 0

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/pedidos" className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4" /> Pedidos
                    </Link>
                    <Link href="/admin/productos?nuevo=true" className="px-4 py-2.5 bg-[#00AE42] hover:bg-[#008a34] text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-[#00AE42]/20 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Nuevo Producto
                    </Link>
                </div>
            </div>

            {/* ─── TOP STATS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Ventas del Mes"
                    value={formatoPrecio(stats.ventasMes)}
                    subValue={`${stats.pedidosMes} pedidos`}
                    icon={DollarSign}
                    color="#00AE42"
                    trend={crecimiento}
                    delay={0}
                />
                <StatCard
                    label="Ventas Hoy"
                    value={formatoPrecio(stats.ventasHoy)}
                    subValue={`${stats.pedidosHoy} pedidos`}
                    icon={Zap}
                    color="#F59E0B"
                    delay={0.05}
                />
                <StatCard
                    label="Ticket Promedio"
                    value={formatoPrecio(stats.ticketPromedio)}
                    subValue={`${stats.totalPedidos} pedidos totales`}
                    icon={Target}
                    color="#8B5CF6"
                    delay={0.1}
                />
                <StatCard
                    label="Ventas Totales"
                    value={formatoPrecio(stats.ventasTotales)}
                    subValue={`${stats.totalPedidos} pedidos`}
                    icon={TrendingUp}
                    color="#3B82F6"
                    delay={0.15}
                />
            </div>

            {/* ─── SECONDARY STATS ─── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <MiniStat icon={Clock} label="Pendientes" value={stats.pendientes} color="text-yellow-500" />
                <MiniStat icon={Truck} label="Enviados" value={stats.enviados} color="text-teal-400" />
                <MiniStat icon={Package} label="Productos" value={stats.productosActivos} color="text-purple-400" />
                <MiniStat icon={AlertTriangle} label="Stock Bajo" value={stats.productosBajoStock} color="text-red-400" />
                <MiniStat icon={Users} label="Clientes" value={stats.totalUsuarios} color="text-blue-400" />
                <MiniStat icon={Briefcase} label="Mayoristas" value={stats.mayoristas} color="text-amber-400" />
            </div>

            {/* ─── SALES CHART + TOP PRODUCTS ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[#00AE42]" /> Ventas Mensuales
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Últimos 12 meses</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Total acumulado</div>
                            <div className="font-bold text-[#00AE42]">{formatoPrecio(stats.ventasTotales)}</div>
                        </div>
                    </div>

                    <div className="flex items-end gap-1.5 h-48">
                        {ventasPorMes.map((m, i) => {
                            const height = maxVentaMes > 0 ? (m.ventas / maxVentaMes) * 100 : 0
                            const isCurrentMonth = i === ventasPorMes.length - 1
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-black border border-white/10 rounded-lg px-3 py-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                        <div className="font-bold text-white">{formatoPrecio(m.ventas)}</div>
                                        <div className="text-gray-400">{m.pedidos} pedidos</div>
                                    </div>
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(height, 2)}%` }}
                                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                                        className={`w-full rounded-t-md transition-colors cursor-pointer ${isCurrentMonth
                                            ? 'bg-[#00AE42] shadow-lg shadow-[#00AE42]/20'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    />
                                    <span className={`text-[10px] ${isCurrentMonth ? 'text-white font-bold' : 'text-gray-600'}`}>
                                        {m.mes.split(' ')[0]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Top Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6"
                >
                    <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-amber-400" /> Top Productos
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">Más vendidos por cantidad</p>

                    <div className="space-y-3">
                        {topProductos.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-8">Sin datos</p>
                        ) : (
                            topProductos.slice(0, 6).map((prod, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-400 truncate max-w-[70%] group-hover:text-white transition-colors">
                                            <span className="text-gray-600 font-mono text-xs mr-2">#{i + 1}</span>
                                            {prod.nombre}
                                        </span>
                                        <span className="font-bold text-white text-xs">{prod.cantidad} un.</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(prod.cantidad / maxTopProducto) * 100}%` }}
                                            transition={{ delay: 0.5 + i * 0.08, duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ─── PAYMENT METHODS + ORIGINS ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Payment Methods */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6"
                >
                    <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-blue-400" /> Métodos de Pago
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">Distribución de ventas</p>

                    {/* Stacked bar */}
                    <div className="w-full h-4 rounded-full overflow-hidden flex mb-4">
                        {Object.entries(metodosPago).map(([metodo, info]) => (
                            <div
                                key={metodo}
                                style={{
                                    width: `${(info.count / totalPagoCount) * 100}%`,
                                    backgroundColor: pagoColors[metodo] || '#666',
                                }}
                                className="h-full first:rounded-l-full last:rounded-r-full"
                                title={`${pagoLabels[metodo] || metodo}: ${info.count} pedidos`}
                            />
                        ))}
                    </div>

                    <div className="space-y-3">
                        {Object.entries(metodosPago).map(([metodo, info]) => (
                            <div key={metodo} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: pagoColors[metodo] || '#666' }}
                                    />
                                    <span className="text-sm text-gray-400">{pagoLabels[metodo] || metodo}</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-white">{info.count}</div>
                                    <div className="text-[10px] text-gray-500">{formatoPrecio(info.total)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Origins */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6"
                >
                    <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-teal-400" /> Canales de Venta
                    </h3>
                    <p className="text-xs text-gray-500 mb-5">Origen de los pedidos</p>

                    <div className="space-y-4">
                        {Object.entries(origenes).map(([origen, info]) => {
                            const Icon = origenIcons[origen] || Globe
                            const color = origenColors[origen] || '#666'
                            const pct = Math.round((info.count / (stats.totalPedidos || 1)) * 100)
                            return (
                                <div key={origen} className="group">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
                                                <Icon className="w-4 h-4" style={{ color }} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-white">{origen}</div>
                                                <div className="text-[10px] text-gray-500">{info.count} pedidos</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">{pct}%</div>
                                            <div className="text-[10px] text-gray-500">{formatoPrecio(info.total)}</div>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ delay: 0.6, duration: 0.5 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Quick Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between"
                >
                    <div>
                        <h3 className="font-bold text-white flex items-center gap-2 mb-1">
                            <BarChart3 className="w-4 h-4 text-purple-400" /> Resumen
                        </h3>
                        <p className="text-xs text-gray-500 mb-5">Métricas clave</p>
                    </div>

                    <div className="space-y-4">
                        <SummaryRow label="Ventas esta semana" value={formatoPrecio(stats.ventasSemana)} color="text-[#00AE42]" />
                        <SummaryRow label="Pedidos este mes" value={String(stats.pedidosMes)} color="text-blue-400" />
                        <SummaryRow label="Productos activos" value={String(stats.productosActivos)} color="text-purple-400" />
                        <SummaryRow label="Clientes registrados" value={String(stats.totalUsuarios)} color="text-amber-400" />
                        <SummaryRow label="Mayoristas activos" value={String(stats.mayoristas)} color="text-teal-400" />
                        <SummaryRow label="Stock bajo (<5)" value={String(stats.productosBajoStock)} color={stats.productosBajoStock > 0 ? "text-red-400" : "text-green-400"} />
                    </div>
                </motion.div>
            </div>

            {/* ─── RECENT ORDERS + LOW STOCK ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-gray-500" /> Últimos Pedidos
                        </h3>
                        <Link href="/admin/pedidos" className="text-[#00AE42] text-xs font-bold hover:underline flex items-center gap-1">
                            Ver todos <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {ultimosPedidos.length === 0 ? (
                            <p className="text-gray-500 text-center py-12 text-sm">No hay actividad reciente</p>
                        ) : (
                            ultimosPedidos.map((pedido: any) => {
                                const col = estadoColores[pedido.estado] || estadoColores.PENDIENTE
                                const OrigenIcon = origenIcons[pedido.origen] || Globe
                                return (
                                    <div key={pedido.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[#0a0a0a] border border-white/5 rounded-lg flex items-center justify-center font-mono text-xs text-gray-400 relative">
                                                #{pedido.numero}
                                                {pedido.origen && pedido.origen !== 'WEB' && (
                                                    <div
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                                        style={{ backgroundColor: origenColors[pedido.origen] }}
                                                    >
                                                        <OrigenIcon className="w-2.5 h-2.5 text-black" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-gray-200">{pedido.nombreCliente}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">
                                                    {new Date(pedido.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-3">
                                            <div>
                                                <div className="font-bold text-white text-sm">{formatoPrecio(pedido.total)}</div>
                                                <div className={`text-[10px] font-bold ${col.text}`}>
                                                    {pedido.estado}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </motion.div>

                {/* Low Stock */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" /> Stock Crítico
                        </h3>
                        <Link href="/admin/productos" className="text-[#00AE42] text-xs font-bold hover:underline flex items-center gap-1">
                            Gestionar <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-white/5">
                        {productosBajoStockLista.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2">
                                <CheckMark className="w-8 h-8 text-[#00AE42]/50" />
                                <p className="text-sm">Inventario saludable ✓</p>
                            </div>
                        ) : (
                            productosBajoStockLista.map((producto: any) => (
                                <div key={producto.id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="w-10 h-10 bg-[#0a0a0a] border border-white/5 rounded-lg shrink-0 overflow-hidden">
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
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// ─── Sub-components ───

function StatCard({ label, value, subValue, icon: Icon, color, trend, delay = 0 }: {
    label: string; value: string; subValue: string; icon: any; color: string; trend?: number; delay?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#111] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                </div>
                {typeof trend === 'number' && trend !== 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend > 0
                        ? 'text-[#00AE42] bg-[#00AE42]/10'
                        : 'text-red-400 bg-red-500/10'
                        }`}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <h3 className="text-2xl font-black text-white mb-0.5 tracking-tight">{value}</h3>
            <p className="text-gray-500 text-xs">{subValue}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wider mt-1 font-bold">{label}</p>
        </motion.div>
    )
}

function MiniStat({ icon: Icon, label, value, color }: {
    icon: any; label: string; value: number; color: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/5 rounded-xl p-3 text-center hover:border-white/10 transition-all"
        >
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <div className="text-lg font-bold text-white">{value}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">{label}</div>
        </motion.div>
    )
}

function SummaryRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-400">{label}</span>
            <span className={`font-bold text-sm ${color}`}>{value}</span>
        </div>
    )
}

function CheckMark({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
