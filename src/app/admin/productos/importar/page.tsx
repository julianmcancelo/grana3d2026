'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Save, Trash2, Upload, AlertCircle, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { bulkCreateProducts, getCategoriasSimple } from './actions'
import Swal from 'sweetalert2'

interface RowData {
    id: string
    nombre: string
    precio: string
    stock: string
    categoriaId: string
    descripcion: string
    imagen: string // URL
    status: 'idle' | 'success' | 'error'
}

export default function ImportPage() {
    const router = useRouter()
    const [rows, setRows] = useState<RowData[]>([
        { id: '1', nombre: '', precio: '', stock: '', categoriaId: '', descripcion: '', imagen: '', status: 'idle' }
    ])
    const [categorias, setCategorias] = useState<{ id: string, nombre: string }[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    useEffect(() => {
        getCategoriasSimple().then(setCategorias)
    }, [])

    const addRow = () => {
        setRows([...rows, {
            id: Math.random().toString(36).substr(2, 9),
            nombre: '', precio: '', stock: '', categoriaId: categorias[0]?.id || '', descripcion: '', imagen: '', status: 'idle'
        }])
    }

    const removeRow = (id: string) => {
        if (rows.length === 1) return
        setRows(rows.filter(r => r.id !== id))
    }

    const updateRow = (id: string, field: keyof RowData, value: string) => {
        setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r))
    }

    // Manejo de Paste desde Excel
    const handlePaste = (e: React.ClipboardEvent, rowIndex: number) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData('text')
        const lines = pasteData.split(/\r\n|\n|\r/).filter(line => line.trim() !== '')

        if (lines.length === 0) return

        const newRows = [...rows]

        // Empezar a llenar desde la fila actual
        lines.forEach((line, i) => {
            const columns = line.split('\t') // Excel usa tabs
            const targetIndex = rowIndex + i

            const rowData: RowData = targetIndex < newRows.length
                ? { ...newRows[targetIndex] }
                : { id: Math.random().toString(36).substr(2, 9), nombre: '', precio: '', stock: '', categoriaId: categorias[0]?.id || '', descripcion: '', imagen: '', status: 'idle' }

            // Mapeo asumiendo orden: Nombre | Precio | Stock | Descripcion
            if (columns[0]) rowData.nombre = columns[0].trim()
            if (columns[1]) rowData.precio = columns[1].replace(/[^0-9.,]/g, '').trim()
            if (columns[2]) rowData.stock = columns[2].replace(/[^0-9]/g, '').trim()
            if (columns[3]) rowData.descripcion = columns[3].trim()

            if (targetIndex < newRows.length) {
                newRows[targetIndex] = rowData
            } else {
                newRows.push(rowData)
            }
        })

        setRows(newRows)
    }

    // Subida de Imagen
    const handleImageUpload = async (file: File, rowId: string) => {
        const formData = new FormData()
        formData.append('file', file)

        try {
            // UI optimista: mostrar loading o algo si quisiera, pero por ahora solo el input
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            if (!res.ok) throw new Error('Error upload')
            const data = await res.json()
            updateRow(rowId, 'imagen', data.url)
        } catch (error) {
            console.error(error)
            Swal.fire('Error', 'Error subiendo imagen', 'error')
        }
    }

    const handleSave = async () => {
        // Validar
        const validRows = rows.filter(r => r.nombre && r.precio && r.categoriaId)
        if (validRows.length === 0) {
            Swal.fire('Atención', 'Completa al menos una fila con Nombre, Precio y Categoría', 'warning')
            return
        }

        setIsSaving(true)
        try {
            const productsToSave = validRows.map(r => ({
                nombre: r.nombre,
                precio: parseFloat(r.precio),
                stock: parseInt(r.stock) || 0,
                categoriaId: r.categoriaId,
                descripcion: r.descripcion,
                imagen: r.imagen
            }))

            const res = await bulkCreateProducts(productsToSave)

            if (res.success) {
                await Swal.fire({
                    title: '¡Éxito!',
                    text: `¡${res.count} productos importados correctamente!`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
                router.push('/admin/productos')
            } else {
                Swal.fire('Error', res.message || 'Error desconocido', 'error')
            }
        } catch (error) {
            Swal.fire('Error', 'Error inesperado', 'error')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen text-white">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/productos" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Importación Inteligente</h1>
                        <p className="text-gray-400">Copia y pega desde Excel o carga manualmente. Arrastra imágenes a la columna "Imagen".</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={addRow}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Agregar Fila
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-black rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Todo
                    </button>
                </div>
            </div>

            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/50 border-b border-gray-800 text-xs uppercase text-gray-400 font-bold">
                                <th className="p-4 w-12 text-center">#</th>
                                <th className="p-4 w-[250px]">Nombre (Copiar aquí)</th>
                                <th className="p-4 w-[120px]">Precio</th>
                                <th className="p-4 w-[100px]">Stock</th>
                                <th className="p-4 w-[200px]">Categoría</th>
                                <th className="p-4 w-[300px]">Descripción</th>
                                <th className="p-4 w-[120px] text-center">Imagen</th>
                                <th className="p-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {rows.map((row, index) => (
                                <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-center text-gray-500 font-mono text-xs">{index + 1}</td>

                                    {/* NOMBRE (Paste trigger) */}
                                    <td className="p-2">
                                        <input
                                            value={row.nombre}
                                            onChange={(e) => updateRow(row.id, 'nombre', e.target.value)}
                                            onPaste={(e) => handlePaste(e, index)}
                                            placeholder="Nombre del producto..."
                                            className="w-full bg-transparent border border-transparent focus:border-teal-500 rounded px-2 py-1 outline-none transition-colors placeholder-gray-700"
                                        />
                                    </td>

                                    {/* PRECIO */}
                                    <td className="p-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                            <input
                                                value={row.precio}
                                                onChange={(e) => updateRow(row.id, 'precio', e.target.value)}
                                                type="number"
                                                className="w-full bg-transparent border border-transparent focus:border-teal-500 rounded pl-5 pr-2 py-1 outline-none transition-colors"
                                            />
                                        </div>
                                    </td>

                                    {/* STOCK */}
                                    <td className="p-2">
                                        <input
                                            value={row.stock}
                                            onChange={(e) => updateRow(row.id, 'stock', e.target.value)}
                                            type="number"
                                            placeholder="0"
                                            className="w-full bg-transparent border border-transparent focus:border-teal-500 rounded px-2 py-1 outline-none transition-colors text-center"
                                        />
                                    </td>

                                    {/* CATEGORIA */}
                                    <td className="p-2">
                                        <select
                                            value={row.categoriaId}
                                            onChange={(e) => updateRow(row.id, 'categoriaId', e.target.value)}
                                            className="w-full bg-black/30 border border-gray-700 focus:border-teal-500 rounded px-2 py-1 outline-none text-sm"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categorias.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* DESCRIPCION */}
                                    <td className="p-2">
                                        <input
                                            value={row.descripcion}
                                            onChange={(e) => updateRow(row.id, 'descripcion', e.target.value)}
                                            placeholder="Breve descripción..."
                                            className="w-full bg-transparent border border-transparent focus:border-teal-500 rounded px-2 py-1 outline-none transition-colors text-sm text-gray-400"
                                        />
                                    </td>

                                    {/* IMAGEN (Drag & Drop) */}
                                    <td className="p-2">
                                        <div
                                            className={`relative w-16 h-16 mx-auto rounded-lg border-2 border-dashed ${row.imagen ? 'border-teal-500/50' : 'border-gray-700 hover:border-gray-500'} flex items-center justify-center overflow-hidden cursor-pointer transition-colors`}
                                            onClick={() => fileInputRefs.current[row.id]?.click()}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                if (e.dataTransfer.files?.[0]) handleImageUpload(e.dataTransfer.files[0], row.id)
                                            }}
                                        >
                                            {row.imagen ? (
                                                <img src={row.imagen} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-6 h-6 text-gray-700" />
                                            )}

                                            <input
                                                type="file"
                                                ref={el => { if (el) fileInputRefs.current[row.id] = el }}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], row.id)}
                                            />
                                        </div>
                                    </td>

                                    {/* DELETE */}
                                    <td className="p-2 text-center">
                                        <button
                                            onClick={() => removeRow(row.id)}
                                            className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-white/5 rounded transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-800 bg-black/30">
                    <button
                        onClick={addRow}
                        className="w-full py-3 border-2 border-dashed border-gray-800 hover:border-gray-700 text-gray-500 hover:text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Agregar más filas
                    </button>
                </div>
            </div>
        </div>
    )
}
