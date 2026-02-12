"use client"
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, X } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'
import ProductCard from '@/components/ProductCard'
import StoreFilters from '@/components/tienda/StoreFilters'
import { useSearchParams } from 'next/navigation'

// Interfaces
interface Categoria { id: string; nombre: string; slug: string; descripcion: string; imagen?: string }
interface Producto {
    id: string; nombre: string; slug: string; precio: number; precioOferta: number | null;
    imagenes: string[]; categoria: { nombre: string; slug: string }; variantes: any;
    destacado: boolean; createdAt: string;
}

interface TiendaClientProps {
    categorias: Categoria[]
    productosDestacados: Producto[]
    todosProductos: Producto[]
    config: { modoProximamente: boolean; textoProximamente: string }
}

export default function TiendaClient({ categorias, productosDestacados, todosProductos, config }: TiendaClientProps) {
    const searchParams = useSearchParams()

    // Initial State from URL
    const initialCategory = searchParams.get('categoria')

    const [filtros, setFiltros] = useState({
        busqueda: '',
        categoria: initialCategory,
        precioMin: null as number | null,
        precioMax: null as number | null,
        orden: 'destacados' // destacados, menor_precio, mayor_precio, recientes
    })

    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    // Calcular precio máximo global para los filtros
    const precioMaximoGlobal = useMemo(() => {
        return Math.max(...todosProductos.map(p => p.precio), 0)
    }, [todosProductos])

    // Lógica de Filtrado y Ordenamiento
    const productosFiltrados = useMemo(() => {
        let result = [...todosProductos]

        // 1. Filtrar por Búsqueda
        if (filtros.busqueda) {
            const q = filtros.busqueda.toLowerCase()
            result = result.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                p.categoria.nombre.toLowerCase().includes(q)
            )
        }

        // 2. Filtrar por Categoría
        if (filtros.categoria) {
            result = result.filter(p => p.categoria.slug === filtros.categoria)
        }

        // 3. Filtrar por Precio
        if (filtros.precioMin !== null) {
            result = result.filter(p => (p.precioOferta || p.precio) >= filtros.precioMin!)
        }
        if (filtros.precioMax !== null) {
            result = result.filter(p => (p.precioOferta || p.precio) <= filtros.precioMax!)
        }

        // 4. Ordenar
        switch (filtros.orden) {
            case 'menor_precio':
                result.sort((a, b) => (a.precioOferta || a.precio) - (b.precioOferta || b.precio))
                break
            case 'mayor_precio':
                result.sort((a, b) => (b.precioOferta || b.precio) - (a.precioOferta || a.precio))
                break
            case 'recientes':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                break
            case 'destacados':
            default:
                // Primero destacados, luego por defecto
                result.sort((a, b) => (a.destacado === b.destacado ? 0 : a.destacado ? -1 : 1))
                break
        }

        return result
    }, [todosProductos, filtros])

    return (
        <div className="bg-white dark:bg-[#050505] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#00AE42] selection:text-white transition-colors duration-300">
            <Header />
            <CarritoDrawer />
            <ModalUsuario />

            {/* Header de Tienda - Minimalista Bambu Style */}
            <div className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-gray-800 pt-8 pb-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Tienda Grana3D
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xl text-sm md:text-base">
                                Componentes, impresoras y servicios de ingeniería 3D. <br className="hidden md:block" />Envios a todo el país y cuotas sin interés.
                            </p>
                        </div>

                        {/* Sort Dropdown (Desktop Only - Mobile is in filter bar) */}
                        <div className="hidden lg:block">
                            <select
                                value={filtros.orden}
                                onChange={(e) => setFiltros(prev => ({ ...prev, orden: e.target.value }))}
                                className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:border-[#00AE42] transition-colors cursor-pointer"
                            >
                                <option value="destacados">Destacados</option>
                                <option value="menor_precio">Menor Precio</option>
                                <option value="mayor_precio">Mayor Precio</option>
                                <option value="recientes">Más Recientes</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <StoreFilters
                        categorias={categorias}
                        filtros={filtros}
                        setFiltros={setFiltros}
                        totalProductos={productosFiltrados.length}
                        precioMaximoGlobal={precioMaximoGlobal}
                    />

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Results Count & Active Filters (Optional) */}
                        <div className="mb-4 text-sm text-gray-500 font-medium">
                            Mostrando {productosFiltrados.length} productos
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                            <AnimatePresence mode='popLayout'>
                                {productosFiltrados.map(p => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ProductCard producto={p} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {productosFiltrados.length === 0 && (
                            <div className="py-24 text-center bg-gray-50 dark:bg-[#111] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No encontramos productos</h3>
                                <p className="text-gray-500 text-sm mb-6">Probá con otros filtros o términos de búsqueda.</p>
                                <button
                                    onClick={() => setFiltros({ busqueda: '', categoria: null, precioMin: null, precioMax: null, orden: 'destacados' })}
                                    className="text-[#00AE42] font-bold hover:underline"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Compacto */}
            <footer className="bg-white dark:bg-[#111] border-t border-gray-200 dark:border-gray-800 py-12 mt-12 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                        <div className="w-6 h-6 bg-[#00AE42] rounded flex items-center justify-center text-white text-xs">G</div>
                        Grana3D
                    </div>
                    <div className="flex gap-6">
                        <a href="/terminos" className="hover:text-[#00AE42]">Términos</a>
                        <a href="/privacidad" className="hover:text-[#00AE42]">Privacidad</a>
                        <a href="/contacto" className="hover:text-[#00AE42]">Contacto</a>
                    </div>
                    <div>© 2026 Grana3D</div>
                </div>
            </footer>
        </div>
    )
}
