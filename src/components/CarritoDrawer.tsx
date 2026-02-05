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
                        className="fixed inset-0 bg-black/50 z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-gray-900" />
                                <h2 className="text-lg font-bold text-gray-900">
                                    Tu Carrito ({items.length})
                                </h2>
                            </div>
                            <button
                                onClick={cerrarCarrito}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                                    <p className="text-gray-500 text-center mb-6">Explorá nuestra tienda y encontrá productos increíbles</p>
                                    <Link
                                        href="/tienda"
                                        onClick={cerrarCarrito}
                                        className="px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors"
                                    >
                                        Ver Productos
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {items.map((item) => (
                                        <div key={item.id + (item.variante || '')} className="p-4 flex gap-4">
                                            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                {item.imagen ? (
                                                    <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.nombre}</h4>
                                                {item.variante && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{item.variante}</p>
                                                )}
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    ${item.precio.toLocaleString('es-AR')}
                                                </p>

                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.cantidad - 1, item.variante)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium text-gray-900">{item.cantidad}</span>
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.cantidad + 1, item.variante)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => eliminarProducto(item.id, item.variante)}
                                                        className="p-2 text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-xl font-bold text-gray-900">
                                        ${total.toLocaleString('es-AR')}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">Los costos de envío se calculan en el checkout</p>

                                <Link
                                    href="/checkout"
                                    onClick={cerrarCarrito}
                                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-colors"
                                >
                                    Finalizar Compra <ArrowRight className="w-4 h-4" />
                                </Link>

                                <button
                                    onClick={() => { vaciarCarrito(); cerrarCarrito(); }}
                                    className="w-full py-3 text-gray-500 text-sm hover:text-red-500 mt-2"
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
