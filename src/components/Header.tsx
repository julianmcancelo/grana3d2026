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
            <div className="bg-black text-white text-sm hidden lg:block border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            Envío gratis en compras +$50.000
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-400">
                        {estaAutenticado ? (
                            <span>Hola, <span className="text-white font-medium">{usuario?.nombre}</span></span>
                        ) : (
                            <Link href="/login" className="hover:text-white transition-colors">
                                Iniciar Sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Header - Dark Glass */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-black border-b border-white/10'}`}>
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-16 lg:h-20">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <Logo className="w-10 h-10 text-white" showText={true} />
                        </Link>

                        {/* Search - Dark Input */}
                        <form className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    placeholder="¿Qué estás buscando?"
                                    className="w-full px-4 py-3 pl-4 pr-12 bg-white/10 border border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-500 transition-all"
                                />
                                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-teal-500 text-black rounded-full hover:bg-teal-400 transition-colors">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </form>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
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
                                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 transition-colors">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-black font-bold text-sm">
                                            {usuario?.nombre?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium max-w-[100px] truncate">{usuario?.nombre?.split(' ')[0]}</span>
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-lg transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Conectarse
                                    </Link>
                                )}

                                <AnimatePresence>
                                    {estaAutenticado && userMenuAbierto && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-xl border border-white/10 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 bg-black/20 border-b border-white/10">
                                                <p className="font-medium text-white">{usuario?.nombre}</p>
                                                <p className="text-sm text-gray-500 truncate">{usuario?.email}</p>
                                            </div>
                                            <div className="py-2">
                                                <Link href="/mis-pedidos" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-teal-400 hover:bg-white/5">
                                                    <Package className="w-4 h-4" /> Mis Pedidos
                                                </Link>
                                                <a href="#" className="flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-teal-400 hover:bg-white/5">
                                                    <Heart className="w-4 h-4" /> Favoritos
                                                </a>
                                                {esAdmin && (
                                                    <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-teal-400 hover:bg-white/5">
                                                        <Settings className="w-4 h-4" /> Panel Admin
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="py-2 border-t border-white/10">
                                                <button onClick={cerrarSesion} className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 w-full">
                                                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button className="hidden sm:flex p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
                                <Heart className="w-5 h-5" />
                            </button>

                            <ThemeToggle />

                            {/* Cart */}
                            <button
                                onClick={abrirCarrito}
                                className="relative p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cantidadTotal > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cantidadTotal > 9 ? '9+' : cantidadTotal}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={() => setMenuMovil(!menuMovil)}
                            >
                                {menuMovil ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Categories Nav - Dark */}
                <div className="hidden lg:block border-t border-white/5 bg-black/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4">
                        <nav className="flex items-center gap-1 py-2">
                            <Link href="/" className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${esActivo('/') ? "text-teal-400 bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                                Inicio
                            </Link>
                            <Link href="/tienda" className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${esActivo('/tienda') ? "text-teal-400 bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                                Tienda
                            </Link>

                            {categorias.slice(0, 5).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={`/tienda?categoria=${cat.slug}`}
                                    className="px-4 py-2 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    {cat.nombre}
                                </Link>
                            ))}

                            <Link href="#contacto" className="px-4 py-2 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-white/5">
                                Contacto
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
                            className="lg:hidden border-t border-white/10 overflow-hidden bg-black"
                        >
                            <nav className="px-4 py-4 space-y-1">
                                <Link href="/" className="block px-4 py-3 rounded-lg font-medium text-gray-300 hover:bg-white/5" onClick={() => setMenuMovil(false)}>Inicio</Link>
                                <Link href="/tienda" className="block px-4 py-3 rounded-lg font-medium text-gray-300 hover:bg-white/5" onClick={() => setMenuMovil(false)}>Tienda</Link>
                                {categorias.map((cat) => (
                                    <Link key={cat.id} href={`/tienda?categoria=${cat.slug}`} className="block px-4 py-2 text-gray-400 hover:text-white" onClick={() => setMenuMovil(false)}>
                                        {cat.nombre}
                                    </Link>
                                ))}
                                <div className="pt-4 border-t border-white/10">
                                    {estaAutenticado ? (
                                        <button onClick={() => { cerrarSesion(); setMenuMovil(false) }} className="flex items-center gap-2 px-4 py-3 text-red-400 w-full hover:bg-white/5">
                                            <LogOut className="w-4 h-4" /> Cerrar sesión
                                        </button>
                                    ) : (
                                        <Link href="/login" onClick={() => setMenuMovil(false)} className="block w-full px-4 py-3 rounded-xl text-black font-bold text-center bg-teal-500 hover:bg-teal-400">
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
