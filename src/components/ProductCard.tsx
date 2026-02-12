"use client"
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Image as ImageIcon, Star } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'

interface Producto {
    id: string
    nombre: string
    slug: string
    precio: number
    precioOferta?: number | null
    imagen?: string
    imagenes: string[]
    categoria: { nombre: string; slug: string }
    variantes?: any
    destacado?: boolean
    createdAt?: string
    updatedAt?: string
}

interface ProductCardProps {
    producto: Producto
    compact?: boolean
}

export default function ProductCard({ producto, compact = false }: ProductCardProps) {
    const { agregarProducto } = useCarrito()
    const [activeImage, setActiveImage] = useState<string | null>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Fallbacks
    const mainImage = activeImage || (producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0] : producto.imagen)
    const precio = producto.precioOferta || producto.precio
    const tieneOferta = producto.precioOferta && producto.precioOferta < producto.precio
    const descuento = tieneOferta ? Math.round((1 - producto.precioOferta! / producto.precio) * 100) : 0

    // Variant Logic
    const variantGroups = producto.variantes?.groups || [] as any[]
    const hasVariants = variantGroups.length > 0

    // Collect distinct variant images
    const variantImages = new Set<string>()
    if (producto.imagenes && producto.imagenes.length > 0) {
        producto.imagenes.forEach(img => variantImages.add(img)) // Add standard gallery
    }
    if (hasVariants) {
        variantGroups.forEach((g: any) => {
            g.opciones.forEach((o: any) => {
                if (o.imagen) variantImages.add(o.imagen)
            })
        })
    }
    const gallery = Array.from(variantImages).slice(0, 5) // Limit to 5 thumbnails

    // Price Calculation
    let minPrice = precio
    if (hasVariants) {
        let totalMinExtra = 0
        variantGroups.forEach((g: any) => {
            if (g.opciones.length > 0) {
                const minExtra = Math.min(...g.opciones.map((o: any) => parseFloat(o.precioExtra) || 0))
                totalMinExtra += minExtra
            }
        })
        minPrice = precio + totalMinExtra
    }

    // Format plural
    const formatPlural = (name: string) => {
        if (name.toLowerCase() === 'tamaño') return 'Tamaños'
        if (name.endsWith('s')) return name
        return name + 's'
    }

    return (
        <div
            className={`group bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-[#00AE42] dark:hover:border-[#00AE42] hover:shadow-xl hover:shadow-[#00AE42]/10 transition-all duration-300 flex flex-col h-full ${compact ? 'text-sm' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/producto/${producto.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-[#111]">
                {tieneOferta && (
                    <span className="absolute top-3 left-3 z-20 px-2 py-1 bg-[#00AE42] text-white text-[10px] font-bold rounded-sm uppercase tracking-wide">
                        -{descuento}%
                    </span>
                )}

                {/* Badge Nuevo */}
                {!tieneOferta && producto.createdAt && new Date(producto.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                    <span className="absolute top-3 left-3 z-20 px-2 py-1 bg-black/80 text-white text-[10px] font-bold rounded-sm uppercase tracking-wide backdrop-blur-sm">
                        Nuevo
                    </span>
                )}

                {mainImage ? (
                    <img
                        src={mainImage}
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111]">
                        <ImageIcon className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                    </div>
                )}

                {/* Overlay actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 z-20">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            // Logic for wishlist could go here
                        }}
                        className="p-2 bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg hover:bg-[#00AE42] hover:text-white transition-colors shadow-lg"
                    >
                        <Heart className="w-4 h-4" />
                    </button>
                </div>
            </Link>

            <div className={`flex-1 flex flex-col ${compact ? 'p-3' : 'p-5'}`}>
                {/* Category & Rating */}
                <div className="flex items-center justify-between mb-2">
                    <Link href={`/tienda?categoria=${producto.categoria.slug}`} className="text-[10px] font-bold text-[#00AE42] uppercase tracking-wider hover:underline">
                        {producto.categoria.nombre}
                    </Link>
                    {!compact && (
                        <div className="flex text-yellow-500 gap-0.5">
                            {[...Array(5)].map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                        </div>
                    )}
                </div>

                <Link href={`/producto/${producto.slug}`}>
                    <h3 className={`font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2 group-hover:text-[#00AE42] transition-colors ${compact ? 'text-sm' : 'text-lg'}`}>
                        {producto.nombre}
                    </h3>
                </Link>

                {/* Variant Thumbnails Gallery */}
                {!compact && gallery.length > 1 && (
                    <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide py-1 h-10">
                        {gallery.map((img, i) => (
                            <button
                                key={i}
                                onMouseEnter={() => setActiveImage(img)}
                                className={`w-8 h-8 rounded-md overflow-hidden border transition-all shrink-0 ${activeImage === img ? 'border-[#00AE42] ring-1 ring-[#00AE42]' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                            >
                                <img src={img} alt="variant" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {/* Variant Badges */}
                {hasVariants && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {variantGroups.slice(0, 2).map((g: any) => (
                            <span key={g.id} className="text-[9px] text-gray-500 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded uppercase font-medium">
                                {g.opciones.length} {formatPlural(g.nombre)}
                            </span>
                        ))}
                        {variantGroups.length > 2 && <span className="text-[9px] text-gray-500">+</span>}
                    </div>
                )}

                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        {hasVariants && minPrice !== precio && (
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Desde</span>
                        )}
                        <div className="flex items-baseline gap-2">
                            <span className={`font-black text-gray-900 dark:text-white ${compact ? 'text-lg' : 'text-xl'}`}>
                                ${minPrice.toLocaleString('es-AR')}
                            </span>
                            {tieneOferta && (
                                <span className="text-xs text-gray-400 line-through decoration-red-500/50">
                                    ${producto.precio.toLocaleString('es-AR')}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            agregarProducto({
                                id: producto.id,
                                nombre: producto.nombre,
                                precio: minPrice,
                                imagen: mainImage || '',
                                categoria: producto.categoria
                            })
                        }}
                        className={`bg-[#1a1a1a] dark:bg-white text-white dark:text-black rounded-xl hover:bg-[#00AE42] dark:hover:bg-[#00AE42] hover:text-white dark:hover:text-white transition-all shadow-lg hover:shadow-[#00AE42]/20 flex items-center justify-center ${compact ? 'p-2' : 'p-3'}`}
                    >
                        <ShoppingCart className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </button>
                </div>
            </div>
        </div>
    )
}
