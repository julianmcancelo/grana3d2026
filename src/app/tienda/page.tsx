"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import {
    ChevronRight, Phone, Mail, Truck, CreditCard, Shield,
    Package, Headphones, Sparkles, Star, ShoppingCart, Heart, Image as ImageIcon,
    Facebook, Instagram, MessageCircle, Search, Filter, User
} from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useCarrito } from '@/context/CarritoContext'
import api from '@/lib/api'

interface Categoria { id: string; nombre: string; slug: string; descripcion: string; imagen?: string }
interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string }
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const caracteristicas = [
    { icono: Truck, titulo: "Envío a Todo el País", desc: "Entrega rápida y segura" },
    { icono: CreditCard, titulo: "12 Cuotas Sin Interés", desc: "Todos los medios de pago" },
    { icono: Shield, titulo: "Compra Protegida", desc: "Garantía de satisfacción" },
    { icono: Headphones, titulo: "Soporte Experto", desc: "Asesoramiento técnico" },
]

function ProductCard({ producto }: { producto: Producto }) {
    const { agregarProducto } = useCarrito()
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    return (
        <motion.div variants={fadeInUp} className="group bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 hover:border-teal-500 hover:dark:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300">
            <Link href={`/producto/${producto.slug}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {tieneOferta && (
                        <div className="absolute top-2 left-2 z-10 bg-teal-500 text-white dark:text-black text-xs font-bold px-2 py-1 rounded">
                            {descuento}% OFF
                        </div>
                    )}
                    {producto.imagenes[0] ? (
                        <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-700" /></div>
                    )}

                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur text-gray-700 dark:text-white rounded-full hover:bg-teal-500 hover:text-white dark:hover:text-black transition-colors shadow-sm">
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {producto.categoria && <span className="text-xs text-teal-600 dark:text-teal-400 uppercase tracking-wider font-bold">{producto.categoria.nombre}</span>}
                    <h3 className="text-gray-900 dark:text-white font-bold mt-1 line-clamp-2 text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{producto.nombre}</h3>

                    <div className="mt-3 flex items-baseline gap-2">
                        {tieneOferta ? (
                            <>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">${producto.precioOferta?.toLocaleString('es-AR')}</span>
                                <span className="text-sm text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                            </>
                        ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">${producto.precio.toLocaleString('es-AR')}</span>
                        )}
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        12 cuotas de <span className="text-gray-900 dark:text-white font-bold">${Math.round(precio / 12).toLocaleString('es-AR')}</span>
                    </p>
                </div>
            </Link>

            <div className="px-4 pb-4">
                <button onClick={() => agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '' })}
                    className="w-full py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-teal-500 hover:text-white dark:hover:text-black hover:border-teal-500 transition-all text-sm flex items-center justify-center gap-2 group/btn">
                    <ShoppingCart className="w-4 h-4 group-hover/btn:fill-current" /> Agregar
                </button>
            </div>
        </motion.div>
    )
}

function CategoryCard({ categoria, index }: { categoria: Categoria; index: number }) {
    // Generate a consistent gradient based on index
    const gradients = [
        "from-teal-500/10 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20",
        "from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20",
        "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20",
        "from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20",
    ]
    const gradient = gradients[index % gradients.length]

    return (
        <motion.div variants={fadeInUp}>
            <Link href={`/tienda?categoria=${categoria.slug}`}>
                <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} border border-gray-200 dark:border-white/10 p-6 hover:border-teal-500 hover:dark:border-teal-500/50 transition-all group cursor-pointer h-full shadow-sm dark:shadow-none`}>
                    <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm z-0 group-hover:bg-white/20 dark:group-hover:bg-black/20 transition-colors" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center mb-4 text-gray-900 dark:text-white group-hover:scale-110 transition-transform duration-300 shadow-sm dark:shadow-none">
                            <Package className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{categoria.nombre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{categoria.descripcion || 'Explorar productos'}</p>

                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-sm font-bold group-hover:translate-x-2 transition-transform">
                            Ver catálogo <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

export default function Tienda() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [productosDestacados, setProductosDestacados] = useState<Producto[]>([])
    const [todosProductos, setTodosProductos] = useState<Producto[]>([])
    const [loading, setLoading] = useState(true)
    const [modoProximamente, setModoProximamente] = useState(false)
    const [textoProximamente, setTextoProximamente] = useState('')

    useEffect(() => {
        const cargar = async () => {
            try {
                // Cargar config primero
                const configRes = await api.get('/config')
                if (configRes.data.modoProximamente) {
                    setModoProximamente(true)
                    setTextoProximamente(configRes.data.textoProximamente || '¡Próximamente!')
                    setLoading(false)
                    return // No cargar productos si está en modo proximamente
                }

                const [catRes, destRes, prodRes] = await Promise.all([
                    api.get('/categorias'),
                    api.get('/productos?destacados=true&limite=4'),
                    api.get('/productos?limite=8')
                ])
                const extract = (d: any) => Array.isArray(d) ? d : d?.data || d?.productos || d?.categorias || []
                setCategorias(extract(catRes.data))
                setProductosDestacados(extract(destRes.data))
                setTodosProductos(extract(prodRes.data))
            } catch (e) { console.error(e) } finally { setLoading(false) }
        }
        cargar()
    }, [])

    // Modo Próximamente - pantalla completa
    if (modoProximamente && !loading) {
        return (
            <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
                <Header />
                <div className="min-h-[80vh] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-2xl"
                    >
                        <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Sparkles className="w-12 h-12 text-teal-500" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white">
                            ¡Muy <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Pronto</span>!
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                            {textoProximamente}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href="https://wa.me/5491112345678" target="_blank" className="px-8 py-4 bg-teal-500 text-white dark:text-black font-bold rounded-full hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                                <MessageCircle className="w-5 h-5" /> Consultanos
                            </a>
                            <a href="https://instagram.com/grana3d" target="_blank" className="px-8 py-4 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                                <Instagram className="w-5 h-5" /> Seguinos
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />


            {/* Hero Banner */}
            <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent dark:from-teal-900/20 dark:to-black z-0" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                        <div className="text-center lg:text-left max-w-2xl">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="inline-block py-1 px-3 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-sm font-bold mb-6">
                                    NUEVA COLECCIÓN 2026
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
                                    Tienda <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-400 dark:to-emerald-500">Oficial</span>
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                    Explorá nuestra selección de productos impresos en 3D con materiales de ingeniería y acabados profesionales.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                    <Link href="#productos" className="px-8 py-4 bg-teal-500 text-white dark:text-black font-bold rounded-full hover:bg-teal-600 dark:hover:bg-teal-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 dark:shadow-none">
                                        Ver Catálogo <ChevronRight className="w-5 h-5" />
                                    </Link>
                                    <div className="flex items-center gap-4 px-6 py-4 bg-white/50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 backdrop-blur-sm">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-black flex items-center justify-center text-xs">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-bold text-gray-900 dark:text-white">+500</span> <span className="text-gray-500 dark:text-gray-400">clientes felices</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Hero Stats */}
                        <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-md">
                            {[
                                { val: "12", label: "Cuotas sin interés", sub: "Con todos los bancos" },
                                { val: "24h", label: "Envío express", sub: "A todo el país" },
                                { val: "+1k", label: "Diseños únicos", sub: "Catálogo exclusivo" },
                                { val: "100%", label: "Garantía total", sub: "Compra protegida" }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none"
                                >
                                    <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">{stat.val}</div>
                                    <div className="text-teal-600 dark:text-teal-400 font-bold text-sm mb-1">{stat.label}</div>
                                    <div className="text-gray-500 text-xs">{stat.sub}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="border-y border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-white/10">
                        {caracteristicas.map((c, i) => (
                            <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-8 px-4 text-center sm:text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-500">
                                    <c.icono className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-1">{c.titulo}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            {categorias.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                            <div className="flex items-end justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Explorá por Categorías</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Encontrá exactamente lo que buscás</p>
                                </div>
                                <Link href="/tienda" className="hidden sm:flex items-center gap-2 text-teal-600 dark:text-teal-500 font-bold hover:text-teal-500 dark:hover:text-teal-400 transition-colors">
                                    Ver todas <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <motion.div variants={staggerContainer} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {categorias.slice(0, 6).map((cat, i) => <CategoryCard key={cat.id} categoria={cat} index={i} />)}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {productosDestacados.length > 0 && (
                <section className="py-20 bg-gray-100 dark:bg-gray-900/30">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
                                <div>
                                    <span className="text-teal-600 dark:text-teal-500 font-bold tracking-wider text-sm uppercase mb-2 block">Tendencias</span>
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Lo más vendido</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm dark:shadow-none border border-gray-200 dark:border-transparent">Semana</button>
                                    <button className="px-4 py-2 rounded-full bg-transparent text-gray-500 text-sm font-medium hover:text-gray-900 dark:hover:text-white transition-colors">Mes</button>
                                </div>
                            </div>
                            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {productosDestacados.map((p) => <ProductCard key={p.id} producto={p} />)}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Promo Banners */}
            <section className="py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 p-8 md:p-12 border border-white/10 group shadow-lg">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded bg-white/10 text-xs font-bold text-indigo-300 mb-4">OFERTA LIMITADA</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Kit Gamer Pro</h3>
                                <p className="text-indigo-200 mb-6 max-w-xs">Soportes de auriculares, gestión de cables y accesorios RGB.</p>
                                <button className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors">Ver Colección</button>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800 to-gray-900 p-8 md:p-12 border border-white/10 group shadow-lg">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded bg-white/10 text-xs font-bold text-teal-300 mb-4">SERVICIO</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Impresión a Demanda</h3>
                                <p className="text-gray-400 mb-6 max-w-xs">¿Tenés un archivo STL? Nosotros lo hacemos realidad con calidad industrial.</p>
                                <button className="px-6 py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-500 transition-colors">Cotizar Ahora</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* All Products */}
            <section id="productos" className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo Completo</h2>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm font-medium text-gray-700 dark:text-white">
                                <Filter className="w-4 h-4" /> Filtros
                            </button>
                        </div>

                        <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {loading ? (
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-white/5">
                                        <div className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                                            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                ))
                            ) : todosProductos.length > 0 ? (
                                todosProductos.map((p) => <ProductCard key={p.id} producto={p} />)
                            ) : (
                                <div className="col-span-full py-24 text-center border border-dashed border-gray-300 dark:border-white/10 rounded-3xl bg-gray-50 dark:bg-white/5">
                                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Próximamente</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Estamos preparando productos increíbles para vos.</p>
                                </div>
                            )}
                        </motion.div>

                        {todosProductos.length > 0 && (
                            <div className="mt-16 text-center">
                                <button className="px-8 py-4 border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white font-bold transition-all">
                                    Cargar más productos
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Contact CTA */}
            <section id="contacto" className="py-20 border-t border-gray-200 dark:border-white/10 bg-gray-900 dark:bg-gradient-to-b dark:from-black dark:to-gray-900">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative rounded-3xl overflow-hidden bg-teal-600 p-10 md:p-16 text-center shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">¿Tenés una idea loca?</h2>
                            <p className="text-teal-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                                No te limites al catálogo. Diseñamos piezas a medida, repuestos inconseguibles y prototipos funcionales.
                            </p>
                            <a href="https://wa.me/5491112345678" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                                <MessageCircle className="w-5 h-5" /> Hablar con un Humano
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-black pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black">G</div>
                                <span className="text-xl font-bold text-white">Grana3D</span>
                            </div>
                            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                                Ingeniería aplicada a la impresión 3D. Calidad, resistencia y diseño en cada capa.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-black transition-all">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-teal-500 hover:text-black transition-all">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">Navegación</h4>
                            <ul className="space-y-4 text-gray-500 text-sm">
                                <li><Link href="/" className="hover:text-teal-500 transition-colors">Inicio</Link></li>
                                <li><Link href="/tienda" className="hover:text-teal-500 transition-colors">Tienda</Link></li>
                                <li><Link href="/contacto" className="hover:text-teal-500 transition-colors">Presupuestos</Link></li>
                                <li><Link href="/faq" className="hover:text-teal-500 transition-colors">Preguntas Frecuentes</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">Legales</h4>
                            <ul className="space-y-4 text-gray-500 text-sm">
                                <li><a href="#" className="hover:text-teal-500 transition-colors">Términos y Condiciones</a></li>
                                <li><a href="#" className="hover:text-teal-500 transition-colors">Política de Privacidad</a></li>
                                <li><a href="#" className="hover:text-teal-500 transition-colors">Arrepentimiento de Compra</a></li>
                                <li><a href="#" className="hover:text-teal-500 transition-colors">Garantía</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6">Contacto</h4>
                            <ul className="space-y-4 text-gray-500 text-sm">
                                <li className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-teal-500" />
                                    <span>hola@grana3d.com.ar</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-teal-500" />
                                    <span>+54 9 11 1234-5678</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-teal-500" />
                                    <span>Envíos a todo el país</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                        <div>
                            © 2026 Grana3D. Todos los derechos reservados.
                        </div>
                        <div className="flex gap-4">
                            <span>Hecho en Buenos Aires 🇦🇷</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <motion.a
                href="https://wa.me/5491112345678"
                target="_blank"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.5)] text-white hover:brightness-110 transition-all"
            >
                <MessageCircle className="w-7 h-7 fill-current" />
            </motion.a>
        </div>
    )
}
