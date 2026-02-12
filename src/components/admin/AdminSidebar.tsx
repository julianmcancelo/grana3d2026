"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard, Package, ShoppingBag, Users,
    Ticket, Megaphone, Image, Settings, LogOut, Zap,
    Shapes, LayoutGrid, Star, Mail, Layers, Briefcase, Database
} from 'lucide-react'

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

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-[#111] border-r border-gray-800 hidden md:flex flex-col h-screen sticky top-0 font-sans">
            <div className="p-6 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00AE42] rounded flex items-center justify-center font-bold text-white shadow-lg shadow-[#00AE42]/20">G</div>
                    <span className="text-lg font-black text-white tracking-tight">Grana3D <span className="text-[#00AE42] text-[10px] uppercase tracking-widest block font-normal">Admin</span></span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 px-4 mt-2">Menú Principal</div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive
                                ? 'bg-[#00AE42]/10 text-[#00AE42] border border-[#00AE42]/20'
                                : 'text-gray-400 hover:bg-[#222] hover:text-white border border-transparent'
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-[#00AE42]' : 'text-gray-500'}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    )
}
