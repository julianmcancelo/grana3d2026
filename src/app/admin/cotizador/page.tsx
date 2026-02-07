"use client"
import { useState, useEffect } from 'react'
import { Plus, Trash2, Download, Send, Search, FileText, Calculator, User, Phone, Mail } from 'lucide-react'
import api from '@/lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ItemCotizacion {
    id: string
    nombre: string
    cantidad: number
    precioUnitario: number
    total: number
}

interface Producto {
    id: string
    nombre: string
    precio: number
}

export default function CotizadorAdmin() {
    const [cliente, setCliente] = useState({ nombre: '', telefono: '', email: '', cuit: '' })
    const [items, setItems] = useState<ItemCotizacion[]>([])
    const [productos, setProductos] = useState<Producto[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [nota, setNota] = useState('')
    
    // Cargar productos para el buscador
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const { data } = await api.get('/productos?limit=1000') // Traer todos para el buscador local rápido
                setProductos(data.productos || data)
            } catch (error) {
                console.error("Error cargando productos", error)
            }
        }
        cargarProductos()
    }, [])

    const agregarItemManual = () => {
        const id = Math.random().toString(36).substr(2, 9)
        setItems([...items, { id, nombre: '', cantidad: 1, precioUnitario: 0, total: 0 }])
    }

    const agregarProductoCatalogo = (prod: Producto) => {
        const itemExistente = items.find(i => i.id === prod.id)
        if (itemExistente) {
            actualizarItem(prod.id, 'cantidad', itemExistente.cantidad + 1)
        } else {
            setItems([...items, {
                id: prod.id,
                nombre: prod.nombre,
                cantidad: 1,
                precioUnitario: prod.precio,
                total: prod.precio
            }])
        }
        setBusqueda('') // Limpiar búsqueda
    }

    const actualizarItem = (id: string, campo: keyof ItemCotizacion, valor: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item
            const nuevoItem = { ...item, [campo]: valor }
            nuevoItem.total = nuevoItem.cantidad * nuevoItem.precioUnitario
            return nuevoItem
        }))
    }

    const eliminarItem = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const calcularTotal = () => items.reduce((acc, item) => acc + item.total, 0)

    const generarPDF = async () => {
        const doc = new jsPDF()
        
        // --- CONFIGURACIÓN ---
        const colorPrimario = [20, 184, 166] as [number, number, number] // Teal 500
        const colorSecundario = [31, 41, 55] as [number, number, number] // Gray 800
        const logoUrl = '/uploads/logo.png' // TODO: Reemplazar por logo real si existe

        // --- HEADER ---
        // Fondo Header
        doc.setFillColor(...colorSecundario)
        doc.rect(0, 0, 210, 40, 'F')
        
        // Título Empresa
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("Grana3D", 14, 20)
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Soluciones de Impresión & Ingeniería", 14, 26)

        // Info Documento (Derecha Header)
        doc.setFontSize(20)
        doc.setTextColor(...colorPrimario)
        doc.text("PRESUPUESTO", 196, 20, { align: 'right' })
        
        doc.setFontSize(10)
        doc.setTextColor(200, 200, 200)
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 196, 28, { align: 'right' })
        doc.text(`Válido hasta: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')}`, 196, 34, { align: 'right' })

        // --- INFO CLIENTE Y EMPRESA (Dos columnas) ---
        const startY = 55
        
        // Columna Izquierda: Cliente
        doc.setTextColor(20, 184, 166)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("PRESUPUESTADO A:", 14, startY)
        
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(cliente.nombre || "Consumidor Final", 14, startY + 6)
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(80)
        if (cliente.telefono) doc.text(cliente.telefono, 14, startY + 12)
        if (cliente.email) doc.text(cliente.email, 14, startY + 17)
        if (cliente.cuit) doc.text(`CUIT/DNI: ${cliente.cuit}`, 14, startY + 22)

        // Columna Derecha: Emisor
        doc.setTextColor(20, 184, 166)
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("EMITIDO POR:", 196, startY, { align: 'right' })
        
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text("Grana3D Argentina", 196, startY + 6, { align: 'right' })
        
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(80)
        doc.text("Web: www.grana3d.com.ar", 196, startY + 12, { align: 'right' })
        doc.text("Instagram: @grana.3d", 196, startY + 17, { align: 'right' })

        // --- TABLA DE ITEMS ---
        autoTable(doc, {
            startY: startY + 35,
            head: [['DESCRIPCIÓN', 'CANT.', 'PRECIO UNIT.', 'SUBTOTAL']],
            body: items.map(i => [
                i.nombre,
                i.cantidad,
                `$${i.precioUnitario.toLocaleString('es-AR')}`,
                `$${i.total.toLocaleString('es-AR')}`
            ]),
            theme: 'plain', // Estilo limpio y moderno
            styles: {
                fontSize: 10,
                cellPadding: 3,
                textColor: [50, 50, 50]
            },
            headStyles: {
                fillColor: [240, 240, 240],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                lineWidth: { bottom: 0.5 },
                lineColor: [200, 200, 200]
            },
            columnStyles: {
                0: { cellWidth: 'auto' }, // Descripción
                1: { cellWidth: 20, halign: 'center' }, // Cant
                2: { cellWidth: 35, halign: 'right' }, // Precio
                3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' } // Total
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            margin: { top: 20 }
        })

        // --- TOTALES ---
        const finalY = (doc as any).lastAutoTable.finalY + 10
        
        // Línea divisoria
        doc.setDrawColor(200, 200, 200)
        doc.line(120, finalY, 196, finalY)

        // Total
        doc.setFontSize(16)
        doc.setTextColor(...colorPrimario)
        doc.setFont("helvetica", "bold")
        doc.text(`TOTAL: $${calcularTotal().toLocaleString('es-AR')}`, 196, finalY + 10, { align: 'right' })

        // --- NOTAS Y CONDICIONES ---
        if (nota) {
            const notaY = finalY + 30
            doc.setFillColor(245, 245, 245)
            doc.roundedRect(14, notaY, 182, 25, 2, 2, 'F')
            
            doc.setFontSize(9)
            doc.setTextColor(20, 184, 166)
            doc.setFont("helvetica", "bold")
            doc.text("NOTAS / CONDICIONES:", 18, notaY + 6)
            
            doc.setFontSize(9)
            doc.setTextColor(80)
            doc.setFont("helvetica", "normal")
            doc.text(nota, 18, notaY + 12, { maxWidth: 170 })
        }

        // --- FOOTER ---
        const pageHeight = doc.internal.pageSize.height
        
        // Barra inferior color
        doc.setFillColor(...colorPrimario)
        doc.rect(0, pageHeight - 10, 210, 10, 'F')
        
        doc.setFontSize(8)
        doc.setTextColor(255, 255, 255)
        doc.text("Gracias por confiar en Grana3D - Tecnología e Innovación", 105, pageHeight - 4, { align: 'center' })

        // Guardar
        const fileName = `Presupuesto_${cliente.nombre.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`
        doc.save(fileName)
    }

    const enviarWhatsapp = () => {
        if (!cliente.telefono) return alert("Ingresá un teléfono")
        
        let mensaje = `*Hola ${cliente.nombre}!* 👋\nAcá te paso el presupuesto que armamos en Grana3D:\n\n`
        items.forEach(i => {
            mensaje += `▪️ ${i.cantidad}x ${i.nombre}: $${i.total.toLocaleString('es-AR')}\n`
        })
        mensaje += `\n*TOTAL: $${calcularTotal().toLocaleString('es-AR')}*\n\n`
        if (nota) mensaje += `_Nota: ${nota}_\n\n`
        mensaje += `Quedo atento! Saludos.`

        const url = `https://wa.me/${cliente.telefono.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje)}`
        window.open(url, '_blank')
    }

    // Filtrar productos
    const productosFiltrados = busqueda 
        ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
        : []

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-2">
                        <Calculator className="w-8 h-8 text-teal-500" /> Cotizador
                    </h1>
                    <p className="text-gray-400">Armá presupuestos rápidos para imprimir o enviar</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={enviarWhatsapp} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Send className="w-4 h-4" /> WhatsApp
                    </button>
                    <button onClick={generarPDF} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" /> PDF
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Panel Izquierdo: Cliente + Buscador */}
                <div className="md:col-span-1 space-y-6">
                    {/* Datos Cliente */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-teal-500" /> Cliente
                        </h3>
                        <input 
                            type="text" placeholder="Nombre completo" 
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                            value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})}
                        />
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="text" placeholder="Teléfono (549...)" 
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white focus:border-teal-500 outline-none"
                                value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})}
                            />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                            <input 
                                type="email" placeholder="Email (opcional)" 
                                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white focus:border-teal-500 outline-none"
                                value={cliente.email} onChange={e => setCliente({...cliente, email: e.target.value})}
                            />
                        </div>
                        <input 
                            type="text" placeholder="CUIT / DNI (opcional)" 
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                            value={cliente.cuit} onChange={e => setCliente({...cliente, cuit: e.target.value})}
                        />
                    </div>

                    {/* Agregar Productos */}
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                            <Search className="w-4 h-4 text-teal-500" /> Agregar Items
                        </h3>
                        
                        <div className="relative mb-4">
                            <input 
                                type="text" 
                                placeholder="Buscar en catálogo..." 
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-teal-500 outline-none"
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                            />
                            {busqueda && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                    {productosFiltrados.map(p => (
                                        <button 
                                            key={p.id}
                                            onClick={() => agregarProductoCatalogo(p)}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex justify-between"
                                        >
                                            <span className="text-white text-sm">{p.nombre}</span>
                                            <span className="text-teal-400 font-bold text-sm">${p.precio}</span>
                                        </button>
                                    ))}
                                    {productosFiltrados.length === 0 && (
                                        <div className="p-3 text-gray-500 text-xs text-center">No encontrado</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={agregarItemManual}
                            className="w-full py-2 border border-dashed border-white/20 hover:border-teal-500/50 hover:text-teal-400 text-gray-400 rounded-lg transition-colors text-sm font-bold flex justify-center items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Item Manual / Servicio
                        </button>
                    </div>
                </div>

                {/* Panel Derecho: Lista de Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
                        {/* Header Papel */}
                        <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
                            <div className="font-bold text-lg">Presupuesto</div>
                            <div className="text-sm opacity-80">{new Date().toLocaleDateString()}</div>
                        </div>

                        <div className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-[#111] text-gray-500 uppercase font-bold text-xs">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-1/2">Descripción</th>
                                        <th className="px-4 py-3 text-center w-20">Cant.</th>
                                        <th className="px-4 py-3 text-right">Precio Unit.</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#222]">
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="text" 
                                                    value={item.nombre}
                                                    onChange={(e) => actualizarItem(item.id, 'nombre', e.target.value)}
                                                    className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                                                    placeholder="Descripción del item"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <input 
                                                    type="number" 
                                                    value={item.cantidad}
                                                    onChange={(e) => actualizarItem(item.id, 'cantidad', parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-transparent outline-none text-center text-gray-900 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end items-center gap-1">
                                                    <span className="text-gray-400">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.precioUnitario}
                                                        onChange={(e) => actualizarItem(item.id, 'precioUnitario', parseFloat(e.target.value) || 0)}
                                                        className="w-24 bg-transparent outline-none text-right text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                                                ${item.total.toLocaleString('es-AR')}
                                            </td>
                                            <td className="px-2 text-center">
                                                <button onClick={() => eliminarItem(item.id)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-400">
                                                Agregá productos desde el buscador o creá items manuales.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-[#111] border-t border-gray-200 dark:border-gray-800">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-4 text-right font-bold text-lg text-gray-900 dark:text-white">TOTAL</td>
                                        <td className="px-4 py-4 text-right font-black text-xl text-teal-600">
                                            ${calcularTotal().toLocaleString('es-AR')}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Notas internas o para el cliente
                        </label>
                        <textarea 
                            value={nota}
                            onChange={e => setNota(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-teal-500 outline-none h-24 resize-none"
                            placeholder="Ej: Pago en efectivo 10% de descuento. Entrega en 48hs..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
