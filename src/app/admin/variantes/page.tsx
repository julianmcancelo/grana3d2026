"use client"
import { useState, useEffect } from 'react'
import { Search, Loader2, Save, Package, Layers, ChevronRight, AlertCircle, Check } from 'lucide-react'
import api from '@/lib/api'
import VariantsManager from '@/components/admin/VariantsManager'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

interface Product {
    id: string
    nombre: string
    imagen: string | null
    variantes: any
    stock: number
    precio: number
}

export default function VariantsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [saving, setSaving] = useState(false)
    const [localVariants, setLocalVariants] = useState<any[]>([])

    useEffect(() => {
        loadProducts()
    }, [])

    const loadProducts = async () => {
        try {
            const { data } = await api.get('/productos')
            setProducts(data.productos || [])
            setLoading(false)
        } catch (error) {
            console.error('Error loading products', error)
            setLoading(false)
        }
    }

    const handleSelectProduct = (product: Product) => {
        if (localVariants.length > 0 && JSON.stringify(localVariants) !== JSON.stringify(selectedProduct?.variantes?.groups || [])) {
            // Optional: Warn about unsaved changes if we were stringent, 
            // but for now let's just switch to keep flow fast or maybe adding a small check could be nice.
            // For simplicity/speed, we switch.
        }
        setSelectedProduct(product)
        // Ensure regular structure
        const currentVariants = product.variantes?.groups || []
        setLocalVariants(currentVariants)
    }

    const handleSave = async () => {
        if (!selectedProduct) return
        setSaving(true)
        try {
            // Save ONLY variants updates
            const payload = {
                variantes: {
                    groups: localVariants
                }
            }

            await api.put(`/admin/productos/${selectedProduct.id}`, payload)

            // Update local state list
            setProducts(products.map(p =>
                p.id === selectedProduct.id
                    ? { ...p, variantes: { groups: localVariants } }
                    : p
            ))

            Swal.fire({
                icon: 'success',
                title: 'Variantes Guardadas',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 2000,
                background: '#1f2937', color: '#fff'
            })
        } catch (error) {
            console.error(error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron guardar los cambios'
            })
        } finally {
            setSaving(false)
        }
    }

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#111]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-[#050505] overflow-hidden rounded-2xl border border-gray-800">
            {/* Sidebar: Lista de Productos */}
            <aside className="w-80 md:w-96 border-r border-gray-800 flex flex-col bg-[#0a0a0a]">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-teal-400" />
                        Gestión de Variantes
                    </h1>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#161616] border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-teal-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredProducts.map(product => {
                        const isSelected = selectedProduct?.id === product.id
                        const variantCount = product.variantes?.groups?.length || 0

                        return (
                            <button
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isSelected
                                    ? 'bg-teal-500/10 border border-teal-500/30'
                                    : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden shrink-0 border border-gray-700">
                                    {product.imagen ? (
                                        <img src={product.imagen} alt={product.nombre} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                            <Package className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-medium truncate ${isSelected ? 'text-teal-400' : 'text-gray-300'}`}>
                                        {product.nombre}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>${product.precio.toLocaleString('es-AR')}</span>
                                        <span>•</span>
                                        <span className={variantCount > 0 ? 'text-teal-500/80' : ''}>
                                            {variantCount} grupo{variantCount !== 1 && 's'}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && <ChevronRight className="w-4 h-4 text-teal-500" />}
                            </button>
                        )
                    })}
                </div>
            </aside>

            {/* Main Area: Editor */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505]">
                {selectedProduct ? (
                    <>
                        {/* Header del Editor */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#0a0a0a]">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    {selectedProduct.nombre}
                                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs font-normal border border-gray-700">
                                        ID: {selectedProduct.id.slice(-6)}
                                    </span>
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">Configurá talles, colores y precios extra para este producto.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Guardar Cambios
                            </button>
                        </div>

                        {/* Contenido Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="max-w-4xl mx-auto">
                                <VariantsManager
                                    variantes={localVariants}
                                    onChange={setLocalVariants}
                                    basePrice={selectedProduct.precio}
                                />

                                <div className="mt-8 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex gap-3 text-yellow-500/80 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold mb-1">Importante</p>
                                        <p>Los cambios impactan inmediatamente en la tienda al guardar. Si eliminás variantes que ya fueron vendidas, no afectará a los pedidos pasados, pero sí a la visualización actual.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
                        <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-6 border border-gray-800">
                            <Layers className="w-10 h-10 opacity-20" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">Seleccioná un producto</h3>
                        <p className="max-w-md text-center text-gray-500">
                            Elegí un producto de la lista lateral para administrar sus variantes, talles y opciones personalizadas.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
