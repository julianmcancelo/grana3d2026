"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Shield, ShieldCheck,
    Mail, Calendar, Loader2, MoreVertical,
    UserCog, Trash2, X
} from 'lucide-react'
import api from '@/lib/api'

interface Usuario {
    id: string
    nombre: string
    email: string
    rol: 'ADMIN' | 'CLIENTE'
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

    const cambiarRol = async (usuario: Usuario) => {
        const nuevoRol = usuario.rol === 'ADMIN' ? 'CLIENTE' : 'ADMIN'
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

    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusqueda = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            u.email.toLowerCase().includes(busqueda.toLowerCase())
        const matchRol = !filtroRol || u.rol === filtroRol
        return matchBusqueda && matchRol
    })

    const admins = usuarios.filter(u => u.rol === 'ADMIN').length
    const clientes = usuarios.filter(u => u.rol === 'CLIENTE').length

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Usuarios</h1>
                    <p className="text-gray-400">{usuarios.length} usuarios registrados</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{usuarios.length}</p>
                            <p className="text-xs text-gray-400">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-teal-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{admins}</p>
                            <p className="text-xs text-gray-400">Admins</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-900 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{clientes}</p>
                            <p className="text-xs text-gray-400">Clientes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                    />
                </div>
                <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-teal-500"
                >
                    <option value="">Todos los roles</option>
                    <option value="ADMIN">Admins</option>
                    <option value="CLIENTE">Clientes</option>
                </select>
            </div>

            {/* Lista de usuarios */}
            <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                            <th className="px-6 py-4 font-medium">Usuario</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Rol</th>
                            <th className="px-6 py-4 font-medium">Pedidos</th>
                            <th className="px-6 py-4 font-medium">Registro</th>
                            <th className="px-6 py-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                                            {usuario.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white">{usuario.nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {usuario.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${usuario.rol === 'ADMIN'
                                            ? 'bg-teal-500/10 text-teal-500'
                                            : 'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {usuario.rol === 'ADMIN' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                        {usuario.rol}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-400">
                                    {usuario._count?.pedidos || 0}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(usuario.createdAt).toLocaleDateString('es-AR')}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="relative">
                                        <button
                                            onClick={() => setMenuAbierto(menuAbierto === usuario.id ? null : usuario.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>

                                        <AnimatePresence>
                                            {menuAbierto === usuario.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-10 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => cambiarRol(usuario)}
                                                        className="w-full px-4 py-3 text-left text-sm hover:bg-white/10 flex items-center gap-2 text-gray-300"
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                        Cambiar a {usuario.rol === 'ADMIN' ? 'Cliente' : 'Admin'}
                                                    </button>
                                                    <button
                                                        onClick={() => eliminarUsuario(usuario)}
                                                        className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/10 flex items-center gap-2 text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Eliminar usuario
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {usuariosFiltrados.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No se encontraron usuarios</p>
                    </div>
                )}
            </div>
        </div>
    )
}
