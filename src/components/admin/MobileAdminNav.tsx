"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Package, ShoppingBag, Users,
    Ticket, Megaphone, Image, Settings, LogOut, Zap,
    Shapes, LayoutGrid, Star, Mail, Layers, Briefcase, Database,
    Menu, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Productos', href: '/admin/productos' },
    { icon: Shapes, label: 'Categorías', href: '/admin/categorias' },
    { icon: Layers, label: 'Variantes', href: '/admin/variantes' },
    { icon: ShoppingBag, label: 'Pedidos', href: '/admin/pedidos' },
    { icon: Users, label: 'Usuarios', href: '/admin/usuarios' },
    { icon: Briefcase, label: 'Mayoristas', href: '/admin/mayoristas' },
    { icon: Ticket, label: 'Cupones', href: '/admin/cupones' },
    { icon: Zap, label: 'Novedades', href: '/admin/novedades' },
    { icon: Image, label: 'Banners', href: '/admin/banners' },
    { icon: Megaphone, label: 'Promo Banners', href: '/admin/promobanners' },
    { icon: Mail, label: 'Correos', href: '/admin/emails' },
    { icon: LayoutGrid, label: 'Homepage', href: '/admin/homepage' },
    { icon: Star, label: 'Reseñas', href: '/admin/resenas' },
    { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
    { icon: Database, label: 'Base de Datos', href: '/admin/database' },
]

export default function MobileAdminNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <div className="md:hidden sticky top-0 z-40 bg-[#111] border-b border-gray-800">
            {/* Top Bar */}
            <div className="p-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00AE42] rounded flex items-center justify-center font-bold text-white shadow-lg shadow-[#00AE42]/20">G</div>
                    <span className="text-lg font-black text-white tracking-tight">Grana3D</span>
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Backdrop & Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 h-screen w-screen"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[280px] bg-[#111] border-l border-gray-800 z-50 flex flex-col shadow-2xl h-screen"
                        >
                            <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                                <span className="font-bold text-white">Menú Admin</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-4 mt-2">Menú Principal</div>
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${isActive
                                                ? 'bg-[#00AE42]/10 text-[#00AE42] border border-[#00AE42]/20'
                                                : 'text-gray-400 hover:bg-[#222] hover:text-white border border-transparent'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-[#00AE42]' : 'text-gray-500'}`} />
                                            {item.label}
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="p-4 border-t border-gray-800">
                                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium">
                                    <LogOut className="w-4 h-4" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
