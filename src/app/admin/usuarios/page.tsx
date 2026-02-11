"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Shield, ShieldCheck,
    Mail, Calendar, Loader2, MoreVertical,
    UserCog, Trash2, X, Package
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
    _count?: {
        pedidos: number
    }
}

export default function UsuariosAdmin() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [filtroRol, setFiltroRol] = useState<string>('')
    const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
    const [usuarioEditar, setUsuarioEditar] = useState<Usuario | null>(null)

    useEffect(() => {
        cargarUsuarios()
    }, [])

    const cargarUsuarios = async () => {
        try {
            const { data } = await api.get('/admin/usuarios')
            setUsuarios(data.usuarios || data || [])
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        } finally {
            setLoading(false)
        }
    }

    const guardarCambiosMayorista = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!usuarioEditar) return

        const formData = new FormData(e.target as HTMLFormElement)
        const datos = {
            estadoMayorista: formData.get('estadoMayorista'),
            unidadesMesActual: formData.get('unidadesMesActual'),
            fechaVencimientoMayorista: formData.get('fechaVencimientoMayorista'),
            rol: usuarioEditar.rol
        }

        try {
            await api.put(`/admin/usuarios/${usuarioEditar.id}`, datos)
            Swal.fire({
                icon: 'success',
                title: 'Actualizado',
                text: 'Datos de mayorista actualizados correctamente',
                background: '#1a1a1a',
                color: '#fff'
            })
            setUsuarioEditar(null)
            cargarUsuarios()
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el usuario'
            })
        }
    }

    const cambiarRol = async (usuario: Usuario, nuevoRol: string) => {
        if (!confirm(`¿Cambiar rol de ${usuario.nombre} a ${nuevoRol}?`)) return

        try {
            await api.put(`/admin/usuarios/${usuario.id}`, { rol: nuevoRol })
            cargarUsuarios()
        } catch (error) {
            console.error('Error cambiando rol:', error)
        }
        setMenuAbierto(null)
    }

    const eliminarUsuario = async (usuario: Usuario) => {
        if (!confirm(`¿Eliminar usuario ${usuario.nombre}? Esta acción no se puede deshacer.`)) return

        try {
            await api.delete(`/admin/usuarios/${usuario.id}`)
            cargarUsuarios()
        } catch (error) {
            console.error('Error eliminando usuario:', error)
        }
        setMenuAbierto(null)
    }

    const usuariosFiltrados = usuarios.filter(usuario => {
        const matchBusqueda = usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            usuario.email.toLowerCase().includes(busqueda.toLowerCase())
        const matchRol = filtroRol ? usuario.rol === filtroRol : true
        return matchBusqueda && matchRol
    })

    return (
        <div className="p-6 md:p-10 space-y-8 min-h-screen bg-black text-white selection:bg-purple-900/50">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-500" />
                        Usuarios
                    </h1>
                    <p className="text-gray-400">Gestión de usuarios, roles y permisos de mayorista.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-900 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase">Total</div>
                            <div className="font-mono font-bold">{usuarios.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                </div>
                <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 outline-none cursor-pointer"
                >
                    <option value="">Todos los roles</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="MAYORISTA">Mayorista</option>
                </select>
            </div>

            {/* Modal Editar Mayorista */}
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
                                    <Package className="w-5 h-5 text-purple-500" />
                                    Gestionar Mayorista: {usuarioEditar.nombre}
                                </h3>
                                <button onClick={() => setUsuarioEditar(null)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={guardarCambiosMayorista} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                                    <select
                                        name="estadoMayorista"
                                        defaultValue={usuarioEditar.estadoMayorista || 'PENDIENTE'}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                                    >
                                        <option value="PENDIENTE">PENDIENTE</option>
                                        <option value="VIGENTE">VIGENTE</option>
                                        <option value="VENCIDO">VENCIDO</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Unidades Mes Actual</label>
                                    <input
                                        type="number"
                                        name="unidadesMesActual"
                                        defaultValue={usuarioEditar.unidadesMesActual || 0}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Fecha Vencimiento</label>
                                    <input
                                        type="date"
                                        name="fechaVencimientoMayorista"
                                        defaultValue={usuarioEditar.fechaVencimientoMayorista ? new Date(usuarioEditar.fechaVencimientoMayorista).toISOString().split('T')[0] : ''}
                                        className="w-full bg-[#222] border border-gray-700 rounded-lg p-2.5 text-white focus:border-purple-500 outline-none"
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
                                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Table Section */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
                        <p>Cargando usuarios...</p>
                    </div>
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No se encontraron usuarios</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 text-left text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/5">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Fecha Reg.</th>
                                    <th className="px-6 py-4">Mayorista</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold">
                                                    {usuario.nombre.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                                        {usuario.nombre}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" /> {usuario.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${usuario.rol === 'ADMIN'
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                : usuario.rol === 'MAYORISTA'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                                                }`}>
                                                {usuario.rol === 'ADMIN' && <ShieldCheck className="w-3 h-3 mr-1" />}
                                                {usuario.rol}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(usuario.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {usuario.rol === 'MAYORISTA' ? (
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${usuario.estadoMayorista === 'VIGENTE' ? 'text-green-400' :
                                                        usuario.estadoMayorista === 'VENCIDO' ? 'text-red-400' : 'text-yellow-400'
                                                        }`}>
                                                        {usuario.estadoMayorista || 'PENDIENTE'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{usuario.unidadesMesActual || 0} un.</span>
                                                    {usuario.fechaVencimientoMayorista && (
                                                        <span className="text-[10px] text-gray-600">
                                                            Vence: {new Date(usuario.fechaVencimientoMayorista).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end relative">
                                                <button
                                                    onClick={() => setMenuAbierto(menuAbierto === usuario.id ? null : usuario.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>

                                                <AnimatePresence>
                                                    {menuAbierto === usuario.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                                        >
                                                            <div className="p-1">
                                                                <button
                                                                    onClick={() => cambiarRol(usuario, 'ADMIN')}
                                                                    className="w-full px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 text-gray-300 hover:bg-white/5 hover:text-purple-400"
                                                                >
                                                                    <Shield className="w-3 h-3" /> Hacer Admin
                                                                </button>
                                                                <button
                                                                    onClick={() => cambiarRol(usuario, 'MAYORISTA')}
                                                                    className="w-full px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 text-gray-300 hover:bg-white/5 hover:text-blue-400"
                                                                >
                                                                    <Package className="w-3 h-3" /> Hacer Mayorista
                                                                </button>
                                                                <button
                                                                    onClick={() => cambiarRol(usuario, 'CLIENTE')}
                                                                    className="w-full px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 text-gray-300 hover:bg-white/5 hover:text-green-400"
                                                                >
                                                                    <Users className="w-3 h-3" /> Hacer Cliente
                                                                </button>

                                                                {usuario.rol === 'MAYORISTA' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setUsuarioEditar(usuario)
                                                                            setMenuAbierto(null)
                                                                        }}
                                                                        className="w-full px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 text-gray-300 hover:bg-white/5 hover:text-yellow-400"
                                                                    >
                                                                        <UserCog className="w-3 h-3" /> Editar Datos Mayorista
                                                                    </button>
                                                                )}

                                                                <div className="my-1 border-t border-white/10" />
                                                                <button
                                                                    onClick={() => eliminarUsuario(usuario)}
                                                                    className="w-full px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 text-red-400 hover:bg-red-500/10"
                                                                >
                                                                    <Trash2 className="w-3 h-3" /> Eliminar
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
