"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, Package, ShoppingBag, Users, 
    Ticket, Megaphone, Image, Settings, LogOut, Zap
} from 'lucide-react'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Productos', href: '/admin/productos' },
    { icon: ShoppingBag, label: 'Pedidos', href: '/admin/pedidos' },
    { icon: Users, label: 'Usuarios', href: '/admin/usuarios' },
    { icon: Ticket, label: 'Cupones', href: '/admin/cupones' },
    { icon: Zap, label: 'Novedades', href: '/admin/novedades' },
    { icon: Image, label: 'Banners', href: '/admin/banners' },
    { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-black border-r border-white/10 hidden md:flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-white/10">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black">G</div>
                    <span className="text-lg font-bold text-white">Grana3D <span className="text-teal-500 text-xs">Admin</span></span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-teal-500/10 text-teal-500 font-bold' 
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-teal-500' : 'text-gray-500 group-hover:text-white'}`} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span>Salir</span>
                </button>
            </div>
        </aside>
    )
}
