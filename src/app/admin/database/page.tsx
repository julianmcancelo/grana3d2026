"use client"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Database, Table, ChevronRight, Loader2, Search, Edit3,
    Trash2, Save, X, ChevronLeft, ChevronRight as ChevronR,
    AlertTriangle, Check, Copy, RefreshCw
} from 'lucide-react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

export default function DBExplorer() {
    const [models, setModels] = useState<Record<string, number>>({})
    const [selectedModel, setSelectedModel] = useState<string | null>(null)
    const [records, setRecords] = useState<any[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [pages, setPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [loadingRecords, setLoadingRecords] = useState(false)
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [editData, setEditData] = useState<Record<string, any>>({})
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        loadModels()
    }, [])

    const loadModels = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/db')
            setModels(res.data.models)
        } catch (err) {
            console.error('Error loading models:', err)
        } finally {
            setLoading(false)
        }
    }

    const selectModel = async (model: string, p = 1) => {
        setSelectedModel(model)
        setPage(p)
        setLoadingRecords(true)
        setEditingRecord(null)
        try {
            const res = await api.get(`/admin/db?model=${model}&page=${p}&limit=50`)
            setRecords(res.data.records)
            setTotal(res.data.total)
            setPages(res.data.pages)
        } catch (err) {
            console.error('Error loading records:', err)
        } finally {
            setLoadingRecords(false)
        }
    }

    const startEdit = (record: any) => {
        setEditingRecord(record)
        setEditData({ ...record })
    }

    const saveEdit = async () => {
        if (!selectedModel || !editingRecord) return
        setSaving(true)
        try {
            await api.put('/admin/db', {
                model: selectedModel,
                id: editingRecord.id,
                data: editData
            })
            Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false })
            setEditingRecord(null)
            selectModel(selectedModel, page)
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al guardar' })
        } finally {
            setSaving(false)
        }
    }

    const deleteRecord = async (id: string) => {
        if (!selectedModel) return
        const result = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar registro?',
            text: `ID: ${id.slice(0, 12)}...`,
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            background: '#111',
            color: '#fff',
        })
        if (!result.isConfirmed) return

        try {
            await api.delete(`/admin/db?model=${selectedModel}&id=${id}`)
            Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false })
            selectModel(selectedModel, page)
        } catch (err: any) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.error || 'Error al eliminar' })
        }
    }

    const copyId = (id: string) => {
        navigator.clipboard.writeText(id)
        Swal.fire({ icon: 'success', title: 'ID copiado', timer: 1000, showConfirmButton: false, position: 'bottom-end', toast: true })
    }

    // Get columns from first record
    const columns = records.length > 0 ? Object.keys(records[0]) : []

    // Filter records by search
    const filteredRecords = search
        ? records.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
        : records

    const formatValue = (val: any): string => {
        if (val === null || val === undefined) return '—'
        if (typeof val === 'boolean') return val ? '✓' : '✗'
        if (typeof val === 'object' && val instanceof Date) return new Date(val).toLocaleDateString('es-AR')
        if (typeof val === 'object') return JSON.stringify(val).slice(0, 80) + (JSON.stringify(val).length > 80 ? '...' : '')
        if (typeof val === 'string' && val.length > 60) return val.slice(0, 60) + '...'
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
            return new Date(val).toLocaleString('es-AR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
        }
        return String(val)
    }

    const modelIcons: Record<string, string> = {
        usuario: '👤', producto: '📦', categoria: '📁', pedido: '🛒',
        cupon: '🎟️', resena: '⭐', novedad: '📰', banner: '🖼️',
        configuracion: '⚙️', direccion: '📍',
    }

    return (
        <div className="space-y-4 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                        <Database className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Base de Datos</h1>
                        <p className="text-xs text-gray-500">Explorador de producción • PostgreSQL</p>
                    </div>
                </div>
                <button onClick={loadModels} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Sidebar - Models */}
                <div className="col-span-3">
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tablas</h3>
                        </div>
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-500" />
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {Object.entries(models).map(([name, count]) => (
                                    <button
                                        key={name}
                                        onClick={() => selectModel(name)}
                                        className={`w-full flex items-center justify-between p-3 px-4 text-sm transition-all hover:bg-white/5 ${selectedModel === name ? 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-500' : 'text-gray-400'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{modelIcons[name] || '📄'}</span>
                                            <span className="font-medium capitalize">{name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full font-mono">
                                                {count >= 0 ? count : '?'}
                                            </span>
                                            <ChevronRight className="w-3 h-3 text-gray-600" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main - Records */}
                <div className="col-span-9">
                    {!selectedModel ? (
                        <div className="bg-[#111] border border-white/5 rounded-2xl p-16 text-center">
                            <Database className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500">Seleccioná una tabla para ver los registros</p>
                        </div>
                    ) : (
                        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                            {/* Table Header */}
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{modelIcons[selectedModel] || '📄'}</span>
                                    <h3 className="font-bold text-white capitalize">{selectedModel}</h3>
                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                        {total} registros
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-9 pr-3 py-2 bg-black border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 w-52"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            {loadingRecords ? (
                                <div className="p-16 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400" />
                                    <p className="text-gray-500 text-sm mt-2">Cargando registros...</p>
                                </div>
                            ) : filteredRecords.length === 0 ? (
                                <div className="p-16 text-center text-gray-500">
                                    <p>No hay registros</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/5">
                                                <th className="text-left p-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider sticky left-0 bg-[#111]">
                                                    Acciones
                                                </th>
                                                {columns.map(col => (
                                                    <th key={col} className="text-left p-3 px-4 text-gray-500 font-medium text-xs uppercase tracking-wider whitespace-nowrap">
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.03]">
                                            {filteredRecords.map((record, i) => (
                                                <tr key={record.id || i} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="p-2 px-4 sticky left-0 bg-[#111]">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => startEdit(record)}
                                                                className="p-1.5 hover:bg-purple-500/10 text-gray-500 hover:text-purple-400 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => copyId(record.id)}
                                                                className="p-1.5 hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 rounded-lg transition-colors"
                                                                title="Copiar ID"
                                                            >
                                                                <Copy className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteRecord(record.id)}
                                                                className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    {columns.map(col => (
                                                        <td key={col} className="p-3 px-4 text-gray-300 whitespace-nowrap max-w-[250px] truncate font-mono text-xs">
                                                            {formatValue(record[col])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Página {page} de {pages}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => selectModel(selectedModel, page - 1)}
                                            disabled={page <= 1}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => selectModel(selectedModel, page + 1)}
                                            disabled={page >= pages}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-sm"
                                        >
                                            <ChevronR className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingRecord && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setEditingRecord(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
                        >
                            <div className="p-5 border-b border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <Edit3 className="w-4 h-4 text-purple-400" /> Editar Registro
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{editingRecord.id}</p>
                                </div>
                                <button onClick={() => setEditingRecord(null)} className="p-2 hover:bg-white/5 rounded-lg">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-3">
                                {Object.entries(editData).map(([key, value]) => {
                                    const isReadOnly = ['id', 'createdAt', 'updatedAt'].includes(key) || typeof value === 'object'
                                    return (
                                        <div key={key}>
                                            <label className="text-xs text-gray-500 font-medium uppercase tracking-wider block mb-1">
                                                {key}
                                                {isReadOnly && <span className="text-gray-700 ml-2">(solo lectura)</span>}
                                            </label>
                                            {typeof value === 'boolean' ? (
                                                <button
                                                    onClick={() => !isReadOnly && setEditData(prev => ({ ...prev, [key]: !prev[key] }))}
                                                    disabled={isReadOnly}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${editData[key]
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                        } ${isReadOnly ? 'opacity-50' : ''}`}
                                                >
                                                    {editData[key] ? '✓ true' : '✗ false'}
                                                </button>
                                            ) : typeof value === 'object' && value !== null ? (
                                                <pre className="bg-black/50 border border-white/5 rounded-lg p-3 text-xs text-gray-400 font-mono overflow-x-auto">
                                                    {JSON.stringify(value, null, 2)}
                                                </pre>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editData[key] ?? ''}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                                                    readOnly={isReadOnly}
                                                    className={`w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-purple-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-5 border-t border-white/5 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setEditingRecord(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveEdit}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
