"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, Check, X, Filter } from 'lucide-react'

interface Categoria {
    id: string
    nombre: string
    slug: string
}

interface StoreFiltersProps {
    categorias: Categoria[]
    filtros: {
        busqueda: string
        categoria: string | null
        precioMin: number | null
        precioMax: number | null
        orden: string
    }
    setFiltros: (filtros: any) => void
    totalProductos: number
    precioMaximoGlobal: number
}

export default function StoreFilters({ categorias, filtros, setFiltros, totalProductos, precioMaximoGlobal }: StoreFiltersProps) {
    const [busqueda, setBusqueda] = useState(filtros.busqueda)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            setFiltros((prev: any) => ({ ...prev, busqueda }))
        }, 500)
        return () => clearTimeout(timeout)
    }, [busqueda, setFiltros])

    const handleCategoriaChange = (slug: string | null) => {
        setFiltros((prev: any) => ({ ...prev, categoria: prev.categoria === slug ? null : slug }))
    }

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFiltros((prev: any) => ({ ...prev, orden: e.target.value }))
    }

    const clearFilters = () => {
        setBusqueda('')
        setFiltros({
            busqueda: '',
            categoria: null,
            precioMin: null,
            precioMax: null,
            orden: 'destacados'
        })
    }

    const hasActiveFilters = filtros.busqueda || filtros.categoria || filtros.precioMin || filtros.precioMax

    const FilterContent = () => (
        <div className="space-y-8">
            {/* Search */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Buscar</h3>
                <div className="relative">
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-[#00AE42] focus:ring-1 focus:ring-[#00AE42] transition-all text-sm"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                    Categorías
                    {filtros.categoria && (
                        <button onClick={() => handleCategoriaChange(null)} className="text-xs text-red-500 hover:text-red-600">Limpiar</button>
                    )}
                </h3>
                <div className="space-y-2">
                    {categorias.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoriaChange(cat.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${filtros.categoria === cat.slug
                                ? 'bg-[#00AE42]/10 text-[#00AE42] font-bold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {cat.nombre}
                            {filtros.categoria === cat.slug && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range (Simplified) */}
            {/* <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Precio</h3>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm"
                        value={filtros.precioMin || ''}
                        onChange={(e) => setFiltros((prev: any) => ({ ...prev, precioMin: e.target.value ? Number(e.target.value) : null }))}
                    />
                    <span className="text-gray-400">-</span>
                    <input
                        type="number"
                        placeholder="Max"
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-lg text-sm"
                        value={filtros.precioMax || ''}
                        onChange={(e) => setFiltros((prev: any) => ({ ...prev, precioMax: e.target.value ? Number(e.target.value) : null }))}
                    />
                </div>
            </div> */}

            {hasActiveFilters && (
                <button
                    onClick={clearFilters}
                    className="w-full py-2 text-sm text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                >
                    Limpiar Filtros
                </button>
            )}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-32 h-fit">
                <FilterContent />
            </aside>

            {/* Mobile Header (Sticky Filter Bar) */}
            <div className="lg:hidden sticky top-[72px] z-30 bg-white/80 dark:bg-[#111]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 mb-6 -mx-4 px-4 flex items-center justify-between gap-4">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold shadow-sm"
                >
                    <Filter className="w-4 h-4" /> Filtros {hasActiveFilters && <span className="w-2 h-2 bg-[#00AE42] rounded-full" />}
                </button>
                <div className="flex-1">
                    <select
                        value={filtros.orden}
                        onChange={handleSortChange}
                        className="w-full px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none"
                    >
                        <option value="destacados">Destacados</option>
                        <option value="menor_precio">Menor Precio</option>
                        <option value="mayor_precio">Mayor Precio</option>
                        <option value="recientes">Más Recientes</option>
                    </select>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[300px] bg-white dark:bg-[#111] z-50 lg:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                <h2 className="font-bold text-lg">Filtrar Productos</h2>
                                <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <FilterContent />
                            </div>
                            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="w-full py-3 bg-[#00AE42] text-white font-bold rounded-lg hover:bg-[#008a34] transition-colors"
                                >
                                    Ver {totalProductos} Resultados
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
