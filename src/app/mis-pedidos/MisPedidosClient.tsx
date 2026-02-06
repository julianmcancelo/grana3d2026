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
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                                                            pedido.estado === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' :
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
                                            <input placeholder="Nombre (ej. Casa)" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.nombre} onChange={e => setNewAddress({...newAddress, nombre: e.target.value})} required />
                                            <input placeholder="Destinatario" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.destinatario} onChange={e => setNewAddress({...newAddress, destinatario: e.target.value})} required />
                                            <input placeholder="Calle" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.calle} onChange={e => setNewAddress({...newAddress, calle: e.target.value})} required />
                                            <input placeholder="Número" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.numero} onChange={e => setNewAddress({...newAddress, numero: e.target.value})} required />
                                            <input placeholder="Ciudad" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.ciudad} onChange={e => setNewAddress({...newAddress, ciudad: e.target.value})} required />
                                            <input placeholder="Provincia" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.provincia} onChange={e => setNewAddress({...newAddress, provincia: e.target.value})} required />
                                            <input placeholder="Código Postal" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.codigoPostal} onChange={e => setNewAddress({...newAddress, codigoPostal: e.target.value})} required />
                                            <input placeholder="Teléfono" className="px-4 py-2 bg-gray-50 dark:bg-[#222] rounded-lg border border-gray-200 dark:border-gray-700" value={newAddress.telefono} onChange={e => setNewAddress({...newAddress, telefono: e.target.value})} />
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

                                    {/* Sección de Beneficios (Mockup) */}
                                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="font-black text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                            <span className="text-[#00AE42]">★</span> Grana Club
                                        </h3>
                                        <div className="bg-gradient-to-br from-[#00AE42]/10 to-transparent p-6 rounded-2xl border border-[#00AE42]/20">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="font-bold text-gray-900 dark:text-white">Nivel: Maker</div>
                                                <div className="text-[#00AE42] font-black text-xl">0 Pts</div>
                                            </div>
                                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                                                <div className="w-[10%] h-full bg-[#00AE42]" />
                                            </div>
                                            <p className="text-xs text-gray-500">Te faltan 500 puntos para el nivel <span className="font-bold text-gray-700 dark:text-gray-300">Pro</span>.</p>
                                        </div>
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
