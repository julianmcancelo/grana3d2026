"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCarrito } from '@/context/CarritoContext'
import Link from 'next/link'

export default function CarritoDrawer() {
    const {
        items,
        estaAbierto,
        cerrarCarrito,
        actualizarCantidad,
        eliminarProducto,
        total,
        vaciarCarrito
    } = useCarrito()

    return (
        <AnimatePresence>
            {estaAbierto && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={cerrarCarrito}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#111] shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-800"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
                            <div className="flex items-center gap-3">
                                <div className="bg-[#00AE42]/10 p-2 rounded-lg">
                                    <ShoppingBag className="w-5 h-5 text-[#00AE42]" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                                    Tu Carrito <span className="text-gray-500 font-normal ml-1">({items.length})</span>
                                </h2>
                            </div>
                            <button
                                onClick={cerrarCarrito}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto bg-[#F9F9F9] dark:bg-[#0a0a0a]">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                                    <div className="w-24 h-24 bg-gray-200 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Tu carrito está vacío</h3>
                                    <p className="text-gray-500 text-center mb-8 max-w-xs">Explorá nuestra tienda y encontrá productos de ingeniería increíbles</p>
                                    <Link
                                        href="/tienda"
                                        onClick={cerrarCarrito}
                                        className="px-8 py-3 bg-[#00AE42] text-white font-bold rounded-lg hover:bg-[#008a34] transition-colors shadow-lg hover:shadow-[#00AE42]/20"
                                    >
                                        Ir a la Tienda
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id + (item.variante || '')} className="p-4 bg-white dark:bg-[#161616] rounded-xl border border-gray-100 dark:border-gray-800 flex gap-4 shadow-sm">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-lg overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                                                {item.imagen ? (
                                                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.nombre}</h4>
                                                    {item.variante && (
                                                        <p className="text-xs text-gray-500 mt-0.5 font-medium">{item.variante}</p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-sm font-black text-gray-900 dark:text-white">
                                                        ${item.precio.toLocaleString('es-AR')}
                                                    </p>

                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center bg-gray-100 dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg h-8">
                                                            <button
                                                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1, item.variante)}
                                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">{item.cantidad}</span>
                                                            <button
                                                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1, item.variante)}
                                                                className="w-8 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => eliminarProducto(item.id, item.variante)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-6 bg-white dark:bg-[#111]">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-gray-500 font-medium">Subtotal</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        ${total.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                
                                <Link
                                    href="/checkout"
                                    onClick={cerrarCarrito}
                                    className="flex items-center justify-center gap-2 w-full py-4 bg-[#00AE42] text-white font-bold rounded-xl hover:bg-[#008a34] transition-all shadow-lg hover:shadow-[#00AE42]/20 mb-3"
                                >
                                    Iniciar Compra <ArrowRight className="w-5 h-5" />
                                </Link>

                                <button
                                    onClick={() => { vaciarCarrito(); cerrarCarrito(); }}
                                    className="w-full text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                                >
                                    Vaciar Carrito
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
