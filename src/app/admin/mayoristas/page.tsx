"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Package, Search, CheckCircle, XCircle, Clock,
    MoreVertical, Shield, UserCog, Calendar, AlertCircle,
    BarChart3, Users, Filter, X, Plus
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Usuario {
    id: string
    nombre: string
    email: string
    rol: 'ADMIN' | 'CLIENTE' | 'MAYORISTA'
    estadoMayorista?: 'PENDIENTE' | 'VIGENTE' | 'VENCIDO'
    unidadesMesActual?: number
    fechaVencimientoMayorista?: string
    createdAt: string
}

const formatoEstado = (estado: string) => {
    const map: Record<string, string> = {
        PENDIENTE: 'Pendiente',
        VIGENTE: 'Vigente',
        VENCIDO: 'Vencido'
    }
    return map[estado] || estado
}

const colorEstado = (estado: string) => {
    const map: Record<string, string> = {
        PENDIENTE: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        VIGENTE: 'text-green-500 bg-green-500/10 border-green-500/20',
        VENCIDO: 'text-red-500 bg-red-500/10 border-red-500/20'
    }
    return map[estado] || 'text-gray-500 bg-gray-500/10 border-gray-500/20'
}

export default function MayoristasAdmin() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [todos, setTodos] = useState<Usuario[]>([]) // Todos los usuarios para buscador
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState<string>('')
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
    const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)
    const [modalNuevo, setModalNuevo] = useState(false)
    const [busquedaNuevo, setBusquedaNuevo] = useState('')

    useEffect(() => {
        cargarMayoristas()
    }, [])

    const cargarMayoristas = async () => {
        try {
            const { data } = await api.get('/admin/usuarios')
            const allUsers = data.usuarios || data || []
            setTodos(allUsers)
            const mayoristas = allUsers.filter((u: Usuario) => u.rol === 'MAYORISTA')
            setUsuarios(mayoristas)
        } catch (error) {
            console.error('Error cargando mayoristas:', error)
        } finally {
            setLoading(false)
        }
    }

    const guardarCambios = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!usuarioEditar) return

        const formData = new FormData(e.target as HTMLFormElement)
        const datos = {
            estadoMayorista: formData.get('estadoMayorista'),
            unidadesMesActual: Number(formData.get('unidadesMesActual')),
            fechaVencimientoMayorista: formData.get('fechaVencimientoMayorista') ? new Date(formData.get('fechaVencimientoMayorista') as string).toISOString() : null,
            rol: 'MAYORISTA'
        }

        try {
            await api.put(`/admin/usuarios/${usuarioEditar.id}`, datos)
            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                background: '#1a1a1a', color: '#fff',
                toast: true, position: 'top-end', timer: 3000, showConfirmButton: false
            })
            setUsuarioEditar(null)
            cargarMayoristas()
        } catch (error) {
            console.error(error)
            Swal.fire({ icon: 'error', title: 'Error al actualizar', background: '#1a1a1a', color: '#fff' })
        }
    }

    const convertirAMayorista = async (usuario: Usuario) => {
        const result = await Swal.fire({
            title: '¿Convertir a Mayorista?',
            text: `El usuario ${usuario.nombre} pasará a tener rol MAYORISTA y sus compras sumarán cupo.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, convertir',
            background: '#1a1a1a', color: '#fff'
        })

        if (result.isConfirmed) {
            try {
                // Seteamos fecha vencimiento al 10 del mes siguiente
                const now = new Date()
                const nextMonth10th = new Date(now.getFullYear(), now.getMonth() + 1, 10)

                await api.put(`/admin/usuarios/${usuario.id}`, {
                    rol: 'MAYORISTA',
                    estadoMayorista: 'PENDIENTE', // Arranca pendiente hasta que compre
                    unidadesMesActual: 0,
                    fechaVencimientoMayorista: nextMonth10th.toISOString()
                })

                Swal.fire({
                    icon: 'success',
                    title: '¡Usuario convertido!',
                    toast: true, position: 'top-end', timer: 3000, showConfirmButton: false,
                    background: '#1a1a1a', color: '#fff'
                })
                setModalNuevo(false)
                cargarMayoristas()
            } catch (error) {
                console.error(error)
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo convertir al usuario', background: '#1a1a1a', color: '#fff' })
            }
        }
    }

    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email.toLowerCase().includes(busqueda.toLowerCase())
        const matchEstado = !filtroEstado || u.estadoMayorista === filtroEstado
        return matchBusqueda && matchEstado
    })

    const candidatos = todos
        .filter(u => u.rol !== 'MAYORISTA')
        .filter(u =>
            u.nombre.toLowerCase().includes(busquedaNuevo.toLowerCase()) ||
            u.email.toLowerCase().includes(busquedaNuevo.toLowerCase())
        )
        .slice(0, 5) // Limit results

    const stats = {
        total: usuarios.length,
        pendientes: usuarios.filter(u => u.estadoMayorista === 'PENDIENTE').length,
        vencidos: usuarios.filter(u => u.estadoMayorista === 'VENCIDO').length,
        activos: usuarios.filter(u => u.estadoMayorista === 'VIGENTE').length
    }

    return (
        <div className="p-6 md:p-10 space-y-8 min-h-screen bg-black text-white">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-500" />
                        Gestión Mayoristas
                    </h1>
                    <p className="text-gray-400">Control total de cuentas mayoristas, cupos y vencimientos.</p>
                </div>
                <button
                    onClick={() => { setBusquedaNuevo(''); setModalNuevo(true) }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Mayorista
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Mayoristas</div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{stats.activos}</div>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vigentes</div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{stats.pendientes}</div>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pendientes</div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{stats.vencidos}</div>
                        <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Vencidos</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar mayorista por nombre o email..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition-all text-white"
                    />
                </div>
                <select
                    value={filtroEstado}
                    onChange={e => setFiltroEstado(e.target.value)}
                    className="bg-[#111] border border-white/10 rounded-xl px-4 outline-none focus:border-blue-500 text-white"
                >
                    <option value="">Todos los estados</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="VIGENTE">Vigente</option>
                    <option value="VENCIDO">Vencido</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/5">
                            <th className="px-6 py-4">Mayorista</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4">Cupo Mensual</th>
                            <th className="px-6 py-4">Vencimiento</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {usuariosFiltrados.map(user => (
                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{user.nombre}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${colorEstado(user.estadoMayorista || 'PENDIENTE')}`}>
                                        {formatoEstado(user.estadoMayorista || 'PENDIENTE')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-300">
                                    {user.unidadesMesActual || 0} un.
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400">
                                    {user.fechaVencimientoMayorista
                                        ? new Date(user.fechaVencimientoMayorista).toLocaleDateString('es-AR')
                                        : '-'
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => setUsuarioEditar(user)}
                                        className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors group relative"
                                        title="Editar Mayorista"
                                    >
                                        <UserCog className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usuariosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No se encontraron mayoristas
                    </div>
                )}
            </div>

            {/* Modal Editar */}
            <AnimatePresence>
                {usuarioEditar && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#111] border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-500" />
                                    Editar Mayorista: {usuarioEditar.nombre}
                                </h3>
                                <button onClick={() => setUsuarioEditar(null)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={guardarCambios} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                                    <select
                                        name="estadoMayorista"
                                        defaultValue={usuarioEditar.estadoMayorista || 'PENDIENTE'}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                    >
                                        <option value="PENDIENTE">Pendiente</option>
                                        <option value="VIGENTE">Vigente</option>
                                        <option value="VENCIDO">Vencido</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Unidades Mes Actual</label>
                                    <input
                                        type="number"
                                        name="unidadesMesActual"
                                        defaultValue={usuarioEditar.unidadesMesActual || 0}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Fecha Vencimiento</label>
                                    <input
                                        type="date"
                                        name="fechaVencimientoMayorista"
                                        defaultValue={usuarioEditar.fechaVencimientoMayorista ? new Date(usuarioEditar.fechaVencimientoMayorista).toISOString().split('T')[0] : ''}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setUsuarioEditar(null)}
                                        className="px-4 py-2 text-gray-400 hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Nuevo Mayorista */}
            <AnimatePresence>
                {modalNuevo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-[#111] border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-500" />
                                    Agregar Nuevo Mayorista
                                </h3>
                                <button onClick={() => setModalNuevo(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                                    <input
                                        autoFocus
                                        placeholder="Buscar usuario no mayorista..."
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                                        value={busquedaNuevo}
                                        onChange={e => setBusquedaNuevo(e.target.value)}
                                    />
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {busquedaNuevo.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm py-4">Escribí para buscar usuarios...</p>
                                    ) : candidatos.length === 0 ? (
                                        <p className="text-center text-gray-500 text-sm py-4">No se encontraron usuarios.</p>
                                    ) : (
                                        candidatos.map(u => (
                                            <div key={u.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                                                <div>
                                                    <div className="font-bold text-white">{u.nombre}</div>
                                                    <div className="text-xs text-gray-400">{u.email}</div>
                                                    <div className="text-xs text-blue-400 font-mono mt-0.5">{u.rol}</div>
                                                </div>
                                                <button
                                                    onClick={() => convertirAMayorista(u)}
                                                    className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-600/30"
                                                >
                                                    Convertir
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
