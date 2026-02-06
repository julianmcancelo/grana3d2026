"use client"
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import {
    ChevronRight, ShoppingCart, Image as ImageIcon,
    Filter, Package, Grid, List
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

const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
}

function ProductCard({ producto }: { producto: Producto }) {
    const { agregarProducto } = useCarrito()
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    return (
        <motion.div 
            variants={fadeIn} 
            className="group relative bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#00AE42] dark:hover:border-[#00AE42] transition-all duration-300"
        >
            <Link href={`/producto/${producto.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50 dark:bg-[#111]">
                {tieneOferta && (
                    <div className="absolute top-2 left-2 z-10 bg-[#00AE42] text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide">
                        -{descuento}%
                    </div>
                )}
                {producto.imagenes[0] ? (
                    <Image 
                        src={producto.imagenes[0]} 
                        alt={producto.nombre} 
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
                        <ImageIcon className="w-12 h-12" />
                    </div>
                )}
                
                {/* Botón flotante al hacer hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex justify-center">
                     <button 
                        onClick={(e) => {
                            e.preventDefault()
                            agregarProducto({ id: producto.id, nombre: producto.nombre, precio, imagen: producto.imagenes[0] || '' })
                        }}
                        className="w-full py-2 bg-[#00AE42] text-white font-bold text-sm rounded-lg shadow-lg hover:bg-[#008a34] transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" /> Agregar
                    </button>
                </div>
            </Link>

            <div className="p-4">
                <div className="text-[10px] font-bold text-[#00AE42] uppercase tracking-wider mb-1">
                    {producto.categoria?.nombre || 'General'}
                </div>
                
                <Link href={`/producto/${producto.slug}`}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[40px] leading-snug group-hover:text-[#00AE42] transition-colors">
                        {producto.nombre}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">${precio.toLocaleString('es-AR')}</span>
                    {tieneOferta && (
                        <span className="text-xs text-gray-400 line-through">${producto.precio.toLocaleString('es-AR')}</span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function CategoryPill({ categoria }: { categoria: Categoria }) {
    return (
        <Link 
            href={`/tienda?categoria=${categoria.slug}`} 
            className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-[#00AE42] hover:text-[#00AE42] transition-all group"
        >
            <div className="w-8 h-8 bg-gray-100 dark:bg-[#111] rounded-md flex items-center justify-center text-gray-500 group-hover:text-[#00AE42] transition-colors">
                <Package className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-200 group-hover:text-[#00AE42]">{categoria.nombre}</span>
        </Link>
    )
}

export default function TiendaClient({ categorias, productosDestacados, todosProductos, config }: TiendaClientProps) {
    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    return (
        <div className="bg-transparent min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#00AE42] selection:text-white">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            {/* Header de Tienda - Minimalista Bambu Style */}
            <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 pt-32 pb-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Tienda Grana3D
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xl">
                                Componentes, impresoras y servicios de ingeniería 3D. Calidad profesional garantizada.
                            </p>
                        </div>
                        <div className="flex gap-2">
                             <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-sm font-bold flex items-center gap-2 hover:border-[#00AE42] hover:text-[#00AE42] transition-colors">
                                <Filter className="w-4 h-4" /> Filtros
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-12">
                {/* Categorías Rápidas */}
                {categorias.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-6">
                             <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categorías</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {categorias.map(cat => <CategoryPill key={cat.id} categoria={cat} />)}
                        </div>
                    </section>
                )}

                {/* Destacados */}
                {productosDestacados.length > 0 && (
                    <section className="mb-16">
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Destacados</h2>
                            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {productosDestacados.map(p => <ProductCard key={p.id} producto={p} />)}
                        </div>
                    </section>
                )}

                {/* Todos los Productos */}
                <section id="productos">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Catálogo Completo</h2>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {todosProductos.map(p => <ProductCard key={p.id} producto={p} />)}
                    </div>

                    {todosProductos.length === 0 && (
                         <div className="py-24 text-center bg-white dark:bg-[#111] rounded-xl border border-gray-200 dark:border-gray-800">
                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No hay productos disponibles</h3>
                            <p className="text-gray-500 text-sm">Estamos actualizando el inventario.</p>
                         </div>
                    )}
                </section>
            </main>

            {/* Footer Compacto */}
            <footer className="bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 py-12 mt-12">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <div className="w-6 h-6 bg-[#00AE42] rounded flex items-center justify-center text-white text-xs">G</div>
                        Grana3D
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-[#00AE42]">Términos</a>
                        <a href="#" className="hover:text-[#00AE42]">Privacidad</a>
                        <a href="#" className="hover:text-[#00AE42]">Contacto</a>
                    </div>
                    <div>© 2026 Grana3D</div>
                </div>
            </footer>
        </div>
    )
}
