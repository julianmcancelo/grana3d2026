"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Calendar, Clock, ArrowRight, MapPin, User, LogOut, Plus, Trash2, Home, ShoppingBag, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useUsuario } from '@/context/UsuarioContext'
import api from '@/lib/api'

// Interfaces
interface Pedido {
    id: string
    numero: number
    createdAt: string
    total: number
    estado: string
    items: any[]
}

interface Direccion {
    id: string
    nombre: string
    destinatario: string
    calle: string
    numero: string
    ciudad: string
    provincia: string
    codigoPostal: string
    telefono: string
}

export default function MisPedidosClient() {
    const { usuario, cerrarSesion, estaAutenticado } = useUsuario()
    const router = useRouter()

    const [activeTab, setActiveTab] = useState<'pedidos' | 'direcciones' | 'perfil'>('pedidos')
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [direcciones, setDirecciones] = useState<Direccion[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Estado para nueva dirección
    const [showNewAddress, setShowNewAddress] = useState(false)
    const [newAddress, setNewAddress] = useState({
        nombre: 'Casa',
        destinatario: '',
        calle: '',
        numero: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        telefono: ''
    })

    useEffect(() => {
        if (!estaAutenticado) {
            // router.push('/') // Opcional: redirigir si no está logueado
        } else {
            fetchData()
        }
    }, [estaAutenticado])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [resPedidos, resDirecciones] = await Promise.all([
                api.get('/pedidos/mis-pedidos'),
                api.get('/usuario/direcciones')
            ])
            setPedidos(resPedidos.data)
            setDirecciones(resDirecciones.data)
        } catch (err) {
            console.error(err)
            // setError('Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/usuario/direcciones', newAddress)
            setShowNewAddress(false)
            setNewAddress({ nombre: 'Casa', destinatario: '', calle: '', numero: '', ciudad: '', provincia: '', codigoPostal: '', telefono: '' })
            fetchData() // Recargar
        } catch (err) {
            alert('Error al guardar dirección')
        }
    }

    if (!estaAutenticado) return null // O un loader

    return (
        <div className="bg-gray-50 dark:bg-[#050505] min-h-screen font-sans text-gray-900 dark:text-white">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            <div className="max-w-6xl mx-auto px-4 py-12">

                {/* Header Profile */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-[#00AE42] rounded-full flex items-center justify-center text-3xl font-black text-white">
                            {usuario?.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Hola, {usuario?.nombre}</h1>
                            <p className="text-gray-500 dark:text-gray-400">{usuario?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={cerrarSesion}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>

                <div className="grid md:grid-cols-12 gap-8">
                    {/* Sidebar Nav */}
                    <div className="md:col-span-3">
                        <nav className="space-y-2 sticky top-24">
                            <button
                                onClick={() => setActiveTab('pedidos')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'pedidos' ? 'bg-[#00AE42] text-white shadow-lg shadow-[#00AE42]/20' : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
                            >
                                <Package className="w-5 h-5" /> Mis Pedidos
                            </button>
                            <button
                                onClick={() => setActiveTab('direcciones')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'direcciones' ? 'bg-[#00AE42] text-white shadow-lg shadow-[#00AE42]/20' : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
                            >
                                <MapPin className="w-5 h-5" /> Mis Direcciones
                            </button>
                            <button
                                onClick={() => setActiveTab('perfil')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'perfil' ? 'bg-[#00AE42] text-white shadow-lg shadow-[#00AE42]/20' : 'bg-white dark:bg-[#111] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'}`}
                            >
                                <User className="w-5 h-5" /> Mi Perfil
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-9">

                        {/* TAB: PEDIDOS */}
                        {activeTab === 'pedidos' && (
                            <div className="space-y-6">
                                {/* Estado Mayorista Resumen */}
                                {usuario?.rol === 'MAYORISTA' && (
                                    <div className="bg-gradient-to-r from-purple-900 to-black p-6 rounded-2xl border border-purple-500/30 text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-purple-900/20">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400">
                                                <Package className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Estado Mayorista: <span className={usuario.estadoMayorista === 'VIGENTE' ? 'text-green-400' : 'text-red-400'}>{usuario.estadoMayorista}</span></h3>
                                                <p className="text-sm text-gray-400">
                                                    Cupo actual: <strong className="text-white">{usuario.unidadesMesActual || 0} / 75 unidades</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('perfil')}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold transition-colors"
                                        >
                                            Ver Detalles
                                        </button>
                                    </div>
                                )}

                                <h2 className="text-2xl font-bold mb-6">Historial de Compras</h2>
                                {pedidos.length === 0 ? (
                                    <div className="bg-white dark:bg-[#111] p-12 rounded-2xl text-center border border-gray-200 dark:border-gray-800">
                                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 mb-6">Aún no realizaste ninguna compra.</p>
                                        <Link href="/tienda" className="inline-block px-6 py-2 bg-[#00AE42] text-white rounded-lg font-bold">Ir a la Tienda</Link>
                                    </div>
                                ) : (
                                    pedidos.map((pedido) => (
                                        <div key={pedido.id} className="bg-white dark:bg-[#111] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-black text-lg">#{pedido.numero}</span>
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${pedido.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' :
                                                            pedido.estado === 'ENVIADO' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>{pedido.estado}</span>
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> {new Date(pedido.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-xl">${pedido.total.toLocaleString('es-AR')}</div>
                                                    <div className="text-xs text-gray-500">{pedido.items.length} items</div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-[#161616] rounded-xl p-4 mb-4 space-y-2">
                                                {pedido.items.map((item: any, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.nombre} x{item.cantidad}</span>
                                                        <span className="font-bold">${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* TAB: DIRECCIONES */}
                        {activeTab === 'direcciones' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Mis Direcciones</h2>
                                    <button
                                        onClick={() => setShowNewAddress(!showNewAddress)}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#00AE42] text-white font-bold rounded-lg hover:bg-[#008a34]"
                                    >
                                        <Plus className="w-4 h-4" /> Nueva Dirección
                                    </button>
                                </div>

                                {showNewAddress && (
                                    <form onSubmit={handleSaveAddress} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 mb-8 animate-in fade-in slide-in-from-top-4">
                                        <h3 className="font-bold mb-4">Agregar Dirección</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input placeholder="Nombre (ej. Casa)" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.nombre} onChange={e => setNewAddress({ ...newAddress, nombre: e.target.value })} required />
                                            <input placeholder="Destinatario" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.destinatario} onChange={e => setNewAddress({ ...newAddress, destinatario: e.target.value })} required />
                                            <input placeholder="Calle" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.calle} onChange={e => setNewAddress({ ...newAddress, calle: e.target.value })} required />
                                            <input placeholder="Número" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.numero} onChange={e => setNewAddress({ ...newAddress, numero: e.target.value })} required />
                                            <input placeholder="Ciudad" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.ciudad} onChange={e => setNewAddress({ ...newAddress, ciudad: e.target.value })} required />
                                            <input placeholder="Provincia" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.provincia} onChange={e => setNewAddress({ ...newAddress, provincia: e.target.value })} required />
                                            <input placeholder="Código Postal" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.codigoPostal} onChange={e => setNewAddress({ ...newAddress, codigoPostal: e.target.value })} required />
                                            <input placeholder="Teléfono" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.telefono} onChange={e => setNewAddress({ ...newAddress, telefono: e.target.value })} />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowNewAddress(false)} className="px-4 py-2 text-gray-500 hover:text-gray-900">Cancelar</button>
                                            <button type="submit" className="px-6 py-2 bg-[#00AE42] text-white font-bold rounded-lg hover:bg-[#008a34]">Guardar</button>
                                        </div>
                                    </form>
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    {direcciones.map(dir => (
                                        <div key={dir.id} className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 relative group">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Home className="w-4 h-4 text-[#00AE42]" />
                                                <span className="font-bold text-lg">{dir.nombre}</span>
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{dir.calle} {dir.numero}</p>
                                            <p className="text-gray-500 text-xs uppercase">{dir.ciudad}, {dir.provincia} (CP {dir.codigoPostal})</p>
                                            <p className="text-gray-500 text-xs mt-2">Recibe: {dir.destinatario}</p>

                                            <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB: PERFIL */}
                        {activeTab === 'perfil' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Mi Perfil</h2>
                                <div className="bg-white dark:bg-[#111] p-8 rounded-2xl border border-gray-200 dark:border-gray-800 max-w-lg">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                                            <div className="font-medium text-lg">{usuario?.nombre}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                            <div className="font-medium text-lg">{usuario?.email}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
                                            <div className="inline-block px-3 py-1 bg-[#00AE42]/10 text-[#00AE42] font-bold rounded-lg text-sm mt-1">
                                                {usuario?.rol}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sección de Estado Mayorista */}
                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <Package className="w-5 h-5 text-purple-500" /> Estado Mayorista
                                        </h3>

                                        {usuario?.rol === 'MAYORISTA' ? (
                                            <div className="bg-gradient-to-br from-purple-900/20 to-transparent p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Package className="w-24 h-24 text-purple-500" />
                                                </div>

                                                <div className="flex justify-between items-center mb-6 relative z-10">
                                                    <div>
                                                        <div className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-1">Tu Estado</div>
                                                        <div className={`text-2xl font-black ${usuario.estadoMayorista === 'VIGENTE' ? 'text-white' : 'text-red-500'}`}>
                                                            {usuario.estadoMayorista}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vence el</div>
                                                        <div className="font-bold text-white">
                                                            {usuario.fechaVencimientoMayorista ? new Date(usuario.fechaVencimientoMayorista).toLocaleDateString() : '-'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative z-10">
                                                    <div className="flex justify-between text-sm mb-2">
                                                        <span className="text-gray-400">Cupo Mensual</span>
                                                        <span className="text-white font-bold">{usuario.unidadesMesActual || 0} / 75 un.</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className="h-full bg-purple-500 relative transition-all duration-1000"
                                                            style={{ width: `${Math.min(100, ((usuario.unidadesMesActual || 0) / 75) * 100)}%` }}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {(usuario.unidadesMesActual || 0) >= 75
                                                            ? '¡Objetivo cumplido! Tu membresía se renovará automáticamente.'
                                                            : `Te faltan ${75 - (usuario.unidadesMesActual || 0)} unidades para mantener el beneficio.`}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 dark:bg-[#161616] p-6 rounded-2xl border border-gray-200 dark:border-gray-800">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-[#222] rounded-xl flex items-center justify-center">
                                                        <User className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white">Cuenta Cliente</h4>
                                                        <p className="text-xs text-gray-500">¿Querés acceder a precios mayoristas?</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    Realizá una compra inicial de <strong className="text-gray-900 dark:text-white">150 unidades</strong> de insumos para desbloquear automáticamente los beneficios.
                                                </p>
                                                <Link href="/mayoristas" className="block w-full py-2 bg-black dark:bg-white text-white dark:text-black text-center font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
                                                    Ver Requisitos
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
