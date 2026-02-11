"use client"
import { useState, useEffect } from 'react'
import { Plus, Trash2, Download, Send, Search, FileText, Calculator, User, Phone, Mail, Save, FolderOpen, X } from 'lucide-react'
import api from '@/lib/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Swal from 'sweetalert2'

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

interface PresupuestoGuardado {
    id: string
    clienteNombre: string
    total: number
    fecha: string
    items: ItemCotizacion[]
    clienteEmail?: string
    clienteTelefono?: string
    clienteCuit?: string
    nota?: string
    createdAt: string
}

export default function CotizadorAdmin() {
    const [cliente, setCliente] = useState({ nombre: '', telefono: '', email: '', cuit: '' })
    const [items, setItems] = useState<ItemCotizacion[]>([])
    const [productos, setProductos] = useState<Producto[]>([])
    const [busqueda, setBusqueda] = useState('')
    const [nota, setNota] = useState('')

    // Estado para persistencia
    const [presupuestos, setPresupuestos] = useState<PresupuestoGuardado[]>([])
    const [modalCargarOpen, setModalCargarOpen] = useState(false)
    const [loadingPresupuestos, setLoadingPresupuestos] = useState(false)
    const [guardando, setGuardando] = useState(false)

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

    const cargarHistorialPresupuestos = async () => {
        setLoadingPresupuestos(true)
        try {
            const { data } = await api.get('/admin/presupuestos')
            setPresupuestos(data.presupuestos)
        } catch (error) {
            console.error("Error cargando presupuestos", error)
            alert('Error al cargar historial')
        } finally {
            setLoadingPresupuestos(false)
        }
    }

    const guardarPresupuesto = async () => {
        if (items.length === 0) {
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Agregá al menos un item para guardar.', background: '#1f2937', color: '#fff' })
            return
        }
        setGuardando(true)
        try {
            const total = items.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0)
            await api.post('/admin/presupuestos', {
                cliente,
                items,
                total,
                nota
            })

            cargarHistorialPresupuestos() // Recargar lista

            Swal.fire({
                icon: 'success',
                title: '¡Presupuesto Guardado!',
                text: '¿Qué te gustaría hacer ahora?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Enviar por WhatsApp',
                denyButtonText: 'Descargar PDF',
                cancelButtonText: 'Cerrar',
                confirmButtonColor: '#00AE42',
                denyButtonColor: '#3B82F6',
                background: '#1f2937',
                color: '#fff'
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarWhatsapp()
                } else if (result.isDenied) {
                    generarPDF()
                }
            })

        } catch (error: any) {
            console.error("Error guardando", error)
            Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.details || 'Error al guardar el presupuesto', background: '#1f2937', color: '#fff' })
        } finally {
            setGuardando(false)
        }
    }

    const cargarPresupuesto = (p: PresupuestoGuardado) => {
        setCliente({
            nombre: p.clienteNombre || '',
            email: p.clienteEmail || '',
            telefono: p.clienteTelefono || '',
            cuit: p.clienteCuit || ''
        })
        // Asegurar que los items tengan la estructura correcta
        const itemsMapeados = (p.items as any[]).map(i => ({
            id: i.id || Math.random().toString(36).substr(2, 9),
            nombre: i.nombre,
            cantidad: i.cantidad,
            precioUnitario: i.precioUnitario,
            total: i.cantidad * i.precioUnitario
        }))
        setItems(itemsMapeados)
        setNota(p.nota || '')
        setModalCargarOpen(false)
    }

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

        // --- HEADER ---
        doc.setFillColor(...colorSecundario)
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text("Grana3D", 14, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text("Soluciones de Impresión & Ingeniería", 14, 26)

        // Info Cliente
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Presupuesto para:", 14, 50)
        doc.setFont("helvetica", "normal")
        doc.text(cliente.nombre || "Consumidor Final", 14, 56)
        if (cliente.email) doc.text(cliente.email, 14, 62)

        // Fecha
        const fecha = new Date().toLocaleDateString('es-AR')
        doc.text(`Fecha: ${fecha}`, 150, 50)

        // Tabla
        const tableBody = items.map(item => [
            item.nombre,
            item.cantidad.toString(),
            `$ ${item.precioUnitario.toLocaleString('es-AR')}`,
            `$ ${item.total.toLocaleString('es-AR')}`
        ])

        autoTable(doc, {
            startY: 70,
            head: [['Producto/Servicio', 'Cant.', 'Precio Unit.', 'Total']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: colorPrimario },
            styles: { fontSize: 10 },
        })

        // Total
        const total = calcularTotal()
        const finalY = (doc as any).lastAutoTable.finalY || 150

        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`TOTAL: $ ${total.toLocaleString('es-AR')}`, 140, finalY + 15)

        if (nota) {
            doc.setFontSize(10)
            doc.setFont("helvetica", "italic")
            doc.text(`Nota: ${nota}`, 14, finalY + 25)
        }

        doc.save(`presupuesto_${cliente.nombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`)
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

    // --- SMART PARSER LOGIC ---
    const [modalParserOpen, setModalParserOpen] = useState(false)
    const [textoPegado, setTextoPegado] = useState('')

    const procesarTextoWhatsapp = () => {
        const lineas = textoPegado.split(/\n/)
        const nuevosItems: ItemCotizacion[] = []

        lineas.forEach(linea => {
            // Regex para: "Nombre x[Cant] -> $[Precio]" OR "Nombre x [Cant] -> $[Precio]"
            // Ej: "Elsa x1 -> $8.800"
            const match = linea.match(/^(.+?)\s*x\s*(\d+)\s*.*?\$\s*([\d.,]+)/i)

            if (match) {
                const nombre = match[1].trim()
                const cantidad = parseInt(match[2])
                const precioStr = match[3].replace(/[.,]/g, '') // Eliminar puntos/comas (asumiendo formato miles)
                let precio = parseFloat(precioStr)

                // Ajuste por si el formato era 8.800 (8800) o 8,800
                if (precioStr.length > 2 && linea.includes(',')) {
                    // Si usa coma decimal, ajustar. Por ahora asumimos enteros grandes para precios ARS
                }

                nuevosItems.push({
                    id: Math.random().toString(36).substr(2, 9),
                    nombre,
                    cantidad,
                    precioUnitario: precio,
                    total: precio * cantidad
                })
            }
        })

        if (nuevosItems.length > 0) {
            setItems([...items, ...nuevosItems])
            setModalParserOpen(false)
            setTextoPegado('')
            Swal.fire('Éxito', `Se importaron ${nuevosItems.length} items. Revisá los precios por las dudas.`, 'success')
        } else {
            Swal.fire('Error', 'No se detectaron items válidos. Asegurate de copiar el formato "Producto xCant -> $Precio"', 'error')
        }
    }

    // --- CONVERTIR A PEDIDO ---
    const convertirAPedido = async () => {
        const result = await Swal.fire({
            title: '¿Convertir a Pedido?',
            text: "Se creará un nuevo pedido marcado como PENDIENTE en el sistema.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#00AE42',
            confirmButtonText: 'Sí, crear pedido'
        })

        if (result.isConfirmed) {
            setGuardando(true)
            try {
                // Importar dinámicamente para evitar errores de build si no existe
                const { convertirPresupuestoAPedido } = await import('./actions')

                const res = await convertirPresupuestoAPedido({
                    clienteNombre: cliente.nombre,
                    clienteEmail: cliente.email,
                    clienteTelefono: cliente.telefono,
                    clienteCuit: cliente.cuit,
                    items,
                    total: calcularTotal()
                })

                if (res.success) {
                    Swal.fire('¡Pedido Creado!', 'El pedido ya figura en el listado.', 'success')
                    // Opcional: Redirigir a editar el pedido
                } else {
                    Swal.fire('Error', res.message, 'error')
                }
            } catch (error) {
                console.error('Error conversion:', error)
                Swal.fire('Error', 'No se pudo convertir.', 'error')
            } finally {
                setGuardando(false)
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header y Acciones */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-[#00AE42]" />
                        Cotizador
                    </h1>
                    <p className="text-gray-400 text-sm">Creá presupuestos rápidos y profesionales</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setModalParserOpen(true)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors border border-purple-500/30"
                    >
                        <FileText className="w-4 h-4" />
                        Pegar WhatsApp
                    </button>
                    <button
                        onClick={() => {
                            cargarHistorialPresupuestos()
                            setModalCargarOpen(true)
                        }}
                        className="px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg flex items-center gap-2 transition-colors border border-gray-700"
                    >
                        <FolderOpen className="w-4 h-4" />
                        Historial
                    </button>
                    <button
                        onClick={guardarPresupuesto}
                        disabled={guardando}
                        className="px-4 py-2 bg-[#00AE42] hover:bg-[#009b3a] text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {guardando ? '...' : 'Guardar'}
                    </button>
                    {items.length > 0 && (
                        <button
                            onClick={convertirAPedido}
                            disabled={guardando}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                            A Pedido
                        </button>
                    )}
                    <button
                        onClick={generarPDF}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        PDF
                    </button>
                    <button
                        onClick={enviarWhatsapp}
                        className="px-4 py-2 bg-[#25D366] hover:bg-[#20b858] text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                        WA
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Columna Izquierda: Datos y Buscador */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Datos del Cliente */}
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            Datos del Cliente
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Nombre Cliente"
                                value={cliente.nombre}
                                onChange={e => setCliente({ ...cliente, nombre: e.target.value })}
                                className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00AE42]"
                            />
                            <input
                                type="text"
                                placeholder="Email (Opcional)"
                                value={cliente.email}
                                onChange={e => setCliente({ ...cliente, email: e.target.value })}
                                className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00AE42]"
                            />
                            <input
                                type="text"
                                placeholder="Teléfono"
                                value={cliente.telefono}
                                onChange={e => setCliente({ ...cliente, telefono: e.target.value })}
                                className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00AE42]"
                            />
                            <input
                                type="text"
                                placeholder="CUIT (Opcional)"
                                value={cliente.cuit}
                                onChange={e => setCliente({ ...cliente, cuit: e.target.value })}
                                className="bg-[#0a0a0a] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00AE42]"
                            />
                        </div>
                    </div>

                    {/* Buscador de Productos */}
                    <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Buscar producto en catálogo..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg pl-10 p-3 text-white focus:outline-none focus:border-[#00AE42]"
                            />
                        </div>
                        {busqueda && (
                            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {productos
                                    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
                                    .slice(0, 5)
                                    .map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => agregarProductoCatalogo(p)}
                                            className="flex justify-between items-center p-3 bg-[#1a1a1a] hover:bg-[#222] rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-700"
                                        >
                                            <span className="text-gray-200">{p.nombre}</span>
                                            <span className="text-[#00AE42] font-mono font-bold">$ {p.precio.toLocaleString('es-AR')}</span>
                                        </div>
                                    ))}
                            </div>
                        )}
                        <button
                            onClick={agregarItemManual}
                            className="w-full mt-4 py-3 bg-[#1a1a1a] hover:bg-[#222] text-gray-300 border border-dashed border-gray-700 hover:border-gray-500 rounded-lg transition-all flex justify-center items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Agregar Item Manualmente
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

            {/* Modal Importar WhatsApp */}
            {modalParserOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-lg border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Pegar desde WhatsApp</h3>
                            <button onClick={() => setModalParserOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Copiá el mensaje completo y pegalo acá. El sistema buscará líneas como: <br />
                            <code className="bg-[#111] px-1 rounded text-green-400">Producto x2 → $8.800</code>
                        </p>
                        <textarea
                            value={textoPegado}
                            onChange={e => setTextoPegado(e.target.value)}
                            className="w-full h-40 bg-[#111] border border-gray-700 rounded-xl p-3 text-white text-sm font-mono mb-4 focus:border-green-500 outline-none"
                            placeholder="Pegá tu texto acá..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setModalParserOpen(false)}
                                className="px-4 py-2 text-gray-400 hover:text-white"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={procesarTextoWhatsapp}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold"
                            >
                                Procesar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
