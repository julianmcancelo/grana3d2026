"use client"
import { useState } from 'react'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import {
    ChevronRight, Phone, Mail, Truck, CreditCard, Shield,
    Package, Headphones, Sparkles, Star, ShoppingCart, Heart, Image as ImageIcon,
    Facebook, Instagram, MessageCircle, Filter, User
} from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useCarrito } from '@/context/CarritoContext'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'

// Interfaces
interface Categoria { id: string; nombre: string; slug: string; descripcion: string; imagen?: string }
interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string } | null
}

interface TiendaClientProps {
    categorias: Categoria[]
    productosDestacados: Producto[]
    todosProductos: Producto[]
    config: { modoProximamente: boolean; textoProximamente: string }
}

const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

function ProductCard({ producto }: { producto: Producto }) {
    const { agregarProducto } = useCarrito()
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    return (
        <motion.div variants={fadeInUp} className="group relative bg-white dark:bg-[#111] rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5 transition-all duration-500">
            <Link href={`/producto/${producto.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-[#1a1a1a]">
                {tieneOferta && (
                    <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/90 backdrop-blur text-black dark:text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full uppercase">
                        {descuento}% OFF
                    </div>
                )}
                {producto.imagenes[0] ? (
                    <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-gray-300 dark:text-gray-700" /></div>
                )}

                {/* Quick Action Overlay */}
                <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                    <button 
                        onClick={(e) => {
                            e.preventDefault()
                            agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '' })
                        }}
                        className="w-full py-3 bg-white dark:bg-black text-black dark:text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-teal-500 hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4" /> Agregar
                    </button>
                </div>
            </Link>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    {producto.categoria && (
                        <span className="text-[10px] font-bold tracking-widest uppercase text-teal-600 dark:text-teal-400">
                            {producto.categoria.nombre}
                        </span>
                    )}
                </div>
                
                <Link href={`/producto/${producto.slug}`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {producto.nombre}
                    </h3>
                </Link>

                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-gray-900 dark:text-white">${precio.toLocaleString('es-AR')}</span>
                    {tieneOferta && (
                        <span className="text-sm text-gray-400 line-through decoration-2">${producto.precio.toLocaleString('es-AR')}</span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function CategoryCard({ categoria, index }: { categoria: Categoria; index: number }) {
    return (
        <motion.div variants={fadeInUp} className="h-full">
            <Link href={`/tienda?categoria=${categoria.slug}`} className="block h-full group relative overflow-hidden rounded-[2rem] bg-gray-100 dark:bg-[#111] p-8 transition-all hover:bg-teal-500 hover:dark:bg-teal-600">
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <Package className="w-6 h-6 text-black dark:text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-white mb-2 transition-colors">
                            {categoria.nombre}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors line-clamp-2">
                            {categoria.descripcion || 'Explorar colección'}
                        </p>
                    </div>
                    
                    <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white group-hover:text-white group-hover:translate-x-2 transition-all">
                        Ver productos <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
                
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
            </Link>
        </motion.div>
    )
}

export default function TiendaClient({ categorias, productosDestacados, todosProductos, config }: TiendaClientProps) {
    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    return (
        <div className="bg-[#FAFAFA] dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent dark:from-teal-900/20" />
                
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left">
                            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                                <span className="inline-block py-1 px-3 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs font-black tracking-widest uppercase mb-6">
                                    Tienda Oficial
                                </span>
                                <h1 className="text-5xl lg:text-8xl font-black mb-8 leading-[0.9] tracking-tight text-gray-900 dark:text-white">
                                    Diseño <br/>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">Materializado.</span>
                                </h1>
                                <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    Impresión 3D de alta fidelidad. Desde prototipos funcionales hasta piezas de diseño final.
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <Link href="#productos" className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl shadow-teal-500/10">
                                        Ver Catálogo
                                    </Link>
                                    <a href="https://wa.me/5491112345678" target="_blank" className="px-8 py-4 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-full hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                                        Cotizar Diseño
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                        
                        <div className="flex-1 w-full max-w-md hidden lg:block">
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="relative aspect-square"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full blur-[100px] opacity-20 animate-pulse" />
                                {/* Abstract decorative 3D shape representation could go here */}
                                <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 rounded-[3rem] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                                    <div className="text-center p-8">
                                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-emerald-600 mb-2">3D</div>
                                        <div className="text-sm font-bold uppercase tracking-[0.5em] text-gray-400">Engineering</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categorías */}
            {categorias.length > 0 && (
                <section className="py-20 lg:py-32">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <h2 className="text-3xl font-black mb-2 dark:text-white">Colecciones</h2>
                                <p className="text-gray-500">Explorá por categoría</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                            {categorias.slice(0, 4).map((cat, i) => (
                                <CategoryCard key={cat.id} categoria={cat} index={i} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Destacados */}
            {productosDestacados.length > 0 && (
                <section className="py-20 bg-white dark:bg-[#0A0A0A]">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="mb-12 text-center">
                            <span className="text-teal-500 font-bold tracking-widest text-xs uppercase mb-2 block">Tendencias</span>
                            <h2 className="text-4xl lg:text-5xl font-black dark:text-white">Lo más buscado</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {productosDestacados.map((p) => <ProductCard key={p.id} producto={p} />)}
                        </div>
                    </div>
                </section>
            )}

            {/* Todos los productos */}
            <section id="productos" className="py-20 lg:py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                        <h2 className="text-3xl font-black dark:text-white">Catálogo Completo</h2>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-gray-50 transition-colors font-bold text-sm">
                            <Filter className="w-4 h-4" /> Filtros
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {todosProductos.map((p) => <ProductCard key={p.id} producto={p} />)}
                    </div>
                    
                    {todosProductos.length === 0 && (
                         <div className="text-center py-20 bg-gray-100 dark:bg-white/5 rounded-[2rem]">
                            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-bold dark:text-white">Sin productos aún</h3>
                            <p className="text-gray-500">Estamos cargando el stock.</p>
                         </div>
                    )}
                </div>
            </section>

            {/* Footer Simple */}
            <footer className="py-12 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-black text-center">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-black text-xl mb-6">G</div>
                    <p className="text-gray-500 text-sm">© 2026 Grana3D. Buenos Aires, Argentina.</p>
                </div>
            </footer>

            {/* Float Button */}
            <a href="https://wa.me/5491112345678" target="_blank" className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50">
                <MessageCircle className="w-8 h-8 fill-current" />
            </a>
        </div>
    )
}
