"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ItemCarrito {
    id: string
    nombre: string
    precio: number
    cantidad: number
    imagen: string
    variante?: string
    categoria?: { nombre: string; slug: string }
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
    cupon: { codigo: string; descuento: number; tipo: string } | null
    aplicarCupon: (codigo: string) => Promise<boolean>
    removerCupon: () => void
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined)

export function CarritoProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ItemCarrito[]>([])
    const [estaAbierto, setEstaAbierto] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [cupon, setCupon] = useState<{ codigo: string; descuento: number; tipo: string } | null>(null)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('carrito')
        const savedCupon = localStorage.getItem('cupon')
        if (saved) setItems(JSON.parse(saved))
        if (savedCupon) setCupon(JSON.parse(savedCupon))
    }, [])

    useEffect(() => {
        if (mounted) localStorage.setItem('carrito', JSON.stringify(items))
    }, [items, mounted])

    useEffect(() => {
        if (mounted) {
            if (cupon) localStorage.setItem('cupon', JSON.stringify(cupon))
            else localStorage.removeItem('cupon')
        }
    }, [cupon, mounted])

    const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0)
    const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
    const total = cupon ? (cupon.tipo === 'PORCENTAJE' ? subtotal * (1 - cupon.descuento / 100) : subtotal - cupon.descuento) : subtotal

    const agregarProducto = (producto: Omit<ItemCarrito, 'cantidad'> & { cantidad?: number }) => {
        setItems(prev => {
            const key = producto.variante ? `${producto.id}-${producto.variante}` : producto.id
            const existente = prev.find(i => (i.variante ? `${i.id}-${i.variante}` : i.id) === key)
            if (existente) {
                return prev.map(i => (i.variante ? `${i.id}-${i.variante}` : i.id) === key
                    ? { ...i, cantidad: i.cantidad + (producto.cantidad || 1) }
                    : i
                )
            }
            return [...prev, { ...producto, cantidad: producto.cantidad || 1 }]
        })
        setEstaAbierto(true)
    }

    const eliminarProducto = (id: string, variante?: string) => {
        setItems(prev => prev.filter(i => i.id !== id || i.variante !== variante))
    }

    const actualizarCantidad = (id: string, cantidad: number, variante?: string) => {
        if (cantidad < 1) return eliminarProducto(id, variante)
        setItems(prev => prev.map(i => (i.id === id && i.variante === variante) ? { ...i, cantidad } : i))
    }

    const vaciarCarrito = () => {
        setItems([])
        setCupon(null)
    }

    const aplicarCupon = async (codigo: string) => {
        try {
            // Aquí iría la llamada real a la API, simularemos por ahora o llamaremos a un helper
            // En una app real, importamos api de lib/api
            const res = await fetch('/api/cupones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, total: subtotal, items })
            })
            const data = await res.json()

            if (res.ok && data.valido) {
                setCupon({ codigo, descuento: data.descuento, tipo: data.tipo })
                return true
            }
            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }

    const removerCupon = () => setCupon(null)

    const abrirCarrito = () => setEstaAbierto(true)
    const cerrarCarrito = () => setEstaAbierto(false)

    return (
        <CarritoContext.Provider value={{
            items, cantidadTotal, total, estaAbierto,
            agregarProducto, eliminarProducto, actualizarCantidad, vaciarCarrito,
            abrirCarrito, cerrarCarrito, cupon, aplicarCupon, removerCupon
        }}>
            {children}
        </CarritoContext.Provider>
    )
}

export const useCarrito = () => {
    const context = useContext(CarritoContext)
    if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
    return context
}
