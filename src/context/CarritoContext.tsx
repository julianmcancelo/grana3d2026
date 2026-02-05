"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ItemCarrito {
    id: string
    nombre: string
    precio: number
    cantidad: number
    imagen: string
    variante?: string
}

interface CarritoContextType {
    items: ItemCarrito[]
    cantidadTotal: number
    total: number
    estaAbierto: boolean
    agregarProducto: (producto: Omit<ItemCarrito, 'cantidad'> & { cantidad?: number }) => void
    eliminarProducto: (id: string, variante?: string) => void
    actualizarCantidad: (id: string, cantidad: number, variante?: string) => void
    vaciarCarrito: () => void
    abrirCarrito: () => void
    cerrarCarrito: () => void
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined)

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ItemCarrito[]>([])
    const [estaAbierto, setEstaAbierto] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('carrito')
        if (saved) setItems(JSON.parse(saved))
    }, [])

    useEffect(() => {
        if (mounted) localStorage.setItem('carrito', JSON.stringify(items))
    }, [items, mounted])

    const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0)
    const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)

    const agregarProducto = (producto: Omit<ItemCarrito, 'cantidad'> & { cantidad?: number }) => {
        setItems(prev => {
            const key = producto.variante ? `${producto.id}-${producto.variante}` : producto.id
            const existente = prev.find(i => (i.variante ? `${i.id}-${i.variante}` : i.id) === key)
            if (existente) {
                return prev.map(i =>
                    (i.variante ? `${i.id}-${i.variante}` : i.id) === key
                        ? { ...i, cantidad: i.cantidad + (producto.cantidad || 1) }
                        : i
                )
            }
            return [...prev, { ...producto, cantidad: producto.cantidad || 1 }]
        })
        setEstaAbierto(true) // Abrir el carrito automáticamente al agregar
    }

    const eliminarProducto = (id: string, variante?: string) => {
        const key = variante ? `${id}-${variante}` : id
        setItems(prev => prev.filter(i => (i.variante ? `${i.id}-${i.variante}` : i.id) !== key))
    }

    const actualizarCantidad = (id: string, cantidad: number, variante?: string) => {
        if (cantidad <= 0) return eliminarProducto(id, variante)
        const key = variante ? `${id}-${variante}` : id
        setItems(prev => prev.map(i =>
            (i.variante ? `${i.id}-${i.variante}` : i.id) === key ? { ...i, cantidad } : i
        ))
    }

    const vaciarCarrito = () => setItems([])
    const abrirCarrito = () => setEstaAbierto(true)
    const cerrarCarrito = () => setEstaAbierto(false)

    return (
        <CarritoContext.Provider value={{
            items, cantidadTotal, total, estaAbierto,
            agregarProducto, eliminarProducto, actualizarCantidad,
            vaciarCarrito, abrirCarrito, cerrarCarrito
        }}>
            {children}
        </CarritoContext.Provider>
    )
}

export const useCarrito = () => {
    const ctx = useContext(CarritoContext)
    if (!ctx) throw new Error('useCarrito must be used within CarritoProvider')
    return ctx
}
