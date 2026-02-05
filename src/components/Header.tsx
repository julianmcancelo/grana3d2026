"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, Search, Menu, X, User, Heart,
    LogOut, ChevronDown, Package, Settings
} from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'
import { useUsuario } from '@/context/UsuarioContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import Logo from '@/components/Logo'

import api from '@/lib/api'

interface Categoria {
    id: string
    nombre: string
    slug: string
}

export default function Header() {
    const [menuMovil, setMenuMovil] = useState(false)
    const [submenuAbierto, setSubmenuAbierto] = useState<string | null>(null)
    const [userMenuAbierto, setUserMenuAbierto] = useState(false)
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [scrolled, setScrolled] = useState(false)

    const pathname = usePathname()
    const { cantidadTotal, abrirCarrito } = useCarrito()
    const { usuario, estaAutenticado, esAdmin, abrirModal, cerrarSesion } = useUsuario()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        api.get('/categorias').then(res => setCategorias(res.data)).catch(() => { })
    }, [])

    const esActivo = (href: string) => pathname === href

    return (
        <>
            {/* Top Bar - Black */}
            <div className="bg-[#111] text-white text-[11px] font-medium hidden lg:block border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AE42] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AE42]"></span>
                            </span>
                            ENVÍO GRATIS EN COMPRAS +$50.000
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        {estaAutenticado ? (
                            <span>HOLA, <span className="text-white font-bold uppercase">{usuario?.nombre}</span></span>
                        ) : (
                            <Link href="/login" className="hover:text-[#00AE42] transition-colors uppercase">
                                Iniciar Sesión / Registrarse
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#111]/95 backdrop-blur-md border-b border-gray-800 shadow-xl' : 'bg-[#111] border-b border-gray-800'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 lg:h-20">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0 group">
                            <Logo className="w-10 h-10 text-white group-hover:text-[#00AE42] transition-colors" showText={true} />
                        </Link>

                        {/* Search - Bambu Style Input */}
                        <form className="hidden md:flex flex-1 max-w-xl mx-12">
                            <div className="relative w-full group">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="Buscar productos..."
                                    className="w-full px-4 py-2.5 pl-4 pr-10 bg-[#222] border border-gray-700 rounded-lg focus:outline-none focus:border-[#00AE42] focus:bg-[#2a2a2a] text-white placeholder-gray-500 transition-all text-sm"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00AE42] transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                                <Search className="w-5 h-5" />
                            </button>

                            {/* User Desktop */}
                            <div
                                className="relative hidden lg:block"
                                onMouseEnter={() => estaAutenticado && setUserMenuAbierto(true)}
                                onMouseLeave={() => setUserMenuAbierto(false)}
                            >
                                {estaAutenticado ? (
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#00AE42] bg-[#00AE42]/10 hover:bg-[#00AE42]/20 transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-[#00AE42] flex items-center justify-center text-black font-bold text-sm">
                                            {usuario?.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold max-w-[100px] truncate uppercase">{usuario?.nombre?.split(' ')[0]}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                        title="Cuenta"
                                    >
                                        <User className="w-5 h-5" />
                                    </Link>
                                )}

                                <AnimatePresence>
                                    {estaAutenticado && userMenuAbierto && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1a] rounded-lg shadow-2xl border border-gray-800 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-black/20 border-b border-gray-800">
                                                <p className="font-bold text-white text-sm">{usuario?.nombre}</p>
                                                <p className="text-xs text-gray-500 truncate">{usuario?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/mis-pedidos" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-[#00AE42] hover:bg-white/5">
                                                    <Package className="w-4 h-4" /> Mis Pedidos
                                                </Link>
                                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-[#00AE42] hover:bg-white/5">
                                                    <Heart className="w-4 h-4" /> Favoritos
                                                </a>
                                                {esAdmin && (
                                                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#00AE42] hover:bg-white/5">
                                                        <Settings className="w-4 h-4" /> Panel Admin
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="py-2 border-t border-gray-800">
                                                <button onClick={cerrarSesion} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full">
                                                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button className="hidden sm:flex p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                                <Heart className="w-5 h-5" />
                            </button>

                            <ThemeToggle />

                            {/* Cart */}
                            <button
                                onClick={abrirCarrito}
                                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 group"
                            >
                                <ShoppingCart className="w-5 h-5 group-hover:text-[#00AE42] transition-colors" />
                                {cantidadTotal > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00AE42] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cantidadTotal > 9 ? '9+' : cantidadTotal}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={() => setMenuMovil(!menuMovil)}
                            >
                                {menuMovil ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Nav - Bambu Clean Bar */}
                <div className="hidden lg:block bg-[#1a1a1a] border-b border-gray-800">
                    <div className="max-w-7xl mx-auto px-4">
                        <nav className="flex items-center gap-6 py-0 h-10 text-[13px] font-bold uppercase tracking-wide">
                            <Link href="/" className={`h-full flex items-center border-b-2 transition-all ${esActivo('/') ? "border-[#00AE42] text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
                                Inicio
                            </Link>
                            <Link href="/tienda" className={`h-full flex items-center border-b-2 transition-all ${esActivo('/tienda') ? "border-[#00AE42] text-white" : "border-transparent text-gray-400 hover:text-white"}`}>
                                Tienda
                            </Link>

                            <div className="w-px h-4 bg-gray-700 mx-2" />

                            {categorias.slice(0, 5).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/tienda?categoria=${cat.slug}`}
                                    className="h-full flex items-center border-b-2 border-transparent text-gray-400 hover:text-white hover:border-gray-600 transition-all"
                                >
                                    {cat.nombre}
                                </Link>
                            ))}
                            
                            <div className="flex-1" />

                            <Link href="#contacto" className="h-full flex items-center border-b-2 border-transparent text-gray-400 hover:text-[#00AE42] transition-all">
                                Soporte
                            </Link>
                        </nav>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                <AnimatePresence>
                    {menuMovil && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="lg:hidden border-t border-gray-800 overflow-hidden bg-[#111]"
                        >
                            <nav className="px-4 py-4 space-y-1">
                                <Link href="/" className="block px-4 py-3 rounded-lg font-bold text-gray-300 hover:bg-white/5 uppercase text-sm" onClick={() => setMenuMovil(false)}>Inicio</Link>
                                <Link href="/tienda" className="block px-4 py-3 rounded-lg font-bold text-gray-300 hover:bg-white/5 uppercase text-sm" onClick={() => setMenuMovil(false)}>Tienda</Link>
                                {categorias.map((cat) => (
                                    <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`} className="block px-4 py-2 text-sm text-gray-400 hover:text-white font-medium" onClick={() => setMenuMovil(false)}>
                                        {cat.nombre}
                                    </Link>
                                ))}
                                <div className="pt-4 mt-4 border-t border-gray-800">
                                    {estaAutenticado ? (
                                        <button onClick={() => { cerrarSesion(); setMenuMovil(false) }} className="flex items-center gap-2 px-4 py-3 text-red-400 w-full hover:bg-white/5 font-bold text-sm uppercase">
                                            <LogOut className="w-4 h-4" /> Cerrar sesión
                                        </button>
                                    ) : (
                                        <Link href="/login" onClick={() => setMenuMovil(false)} className="block w-full px-4 py-3 rounded-lg text-white font-bold text-center bg-[#00AE42] hover:bg-[#008a34] uppercase text-sm">
                                            Iniciar Sesión
                                        </Link>
                                    )}
                                </div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>
        </>
    )
}
