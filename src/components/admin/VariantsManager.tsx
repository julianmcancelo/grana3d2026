import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

interface VariantOption {
    id: string
    nombre: string
    precioExtra: number // Puede ser 0 o negativo incluso
    stock?: number
}

interface VariantGroup {
    id: string
    nombre: string // ej: "Tamaño", "Color", "Equipo"
    tipo: 'select' | 'botones' | 'color'
    opciones: VariantOption[]
}

interface Props {
    variantes: VariantGroup[]
    onChange: (nuevasVariantes: VariantGroup[]) => void
    basePrice: number
}

export default function VariantsManager({ variantes, onChange, basePrice }: Props) {
    const [activeTab, setActiveTab] = useState<string | null>(null)

    const addGroup = () => {
        const newGroup: VariantGroup = {
            id: Math.random().toString(36).substr(2, 9),
            nombre: 'Nueva Variante',
            tipo: 'select',
            opciones: []
        }
        onChange([...variantes, newGroup])
        setActiveTab(newGroup.id)
    }

    const removeGroup = (id: string) => {
        Swal.fire({
            title: '¿Eliminar grupo?',
            text: "Se perderán todas las opciones configuradas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                onChange(variantes.filter(v => v.id !== id))
                if (activeTab === id) setActiveTab(null)
            }
        })
    }

    const updateGroup = (id: string, field: keyof VariantGroup, value: any) => {
        onChange(variantes.map(v => v.id === id ? { ...v, [field]: value } : v))
    }

    const addOption = (groupId: string) => {
        const newOption: VariantOption = {
            id: Math.random().toString(36).substr(2, 9),
            nombre: 'Opción Nueva',
            precioExtra: 0
        }
        onChange(variantes.map(v =>
            v.id === groupId ? { ...v, opciones: [...v.opciones, newOption] } : v
        ))
    }

    const removeOption = (groupId: string, optionId: string) => {
        onChange(variantes.map(v =>
            v.id === groupId ? { ...v, opciones: v.opciones.filter(o => o.id !== optionId) } : v
        ))
    }

    const updateOption = (groupId: string, optionId: string, field: keyof VariantOption, value: any) => {
        onChange(variantes.map(v =>
            v.id === groupId ? {
                ...v,
                opciones: v.opciones.map(o => o.id === optionId ? { ...o, [field]: value } : o)
            } : v
        ))
    }

    const handlePriceChange = (groupId: string, optionId: string, finalPrice: number) => {
        // Calculate difference: Extra = Final - Base
        const extra = finalPrice - basePrice
        updateOption(groupId, optionId, 'precioExtra', extra)
    }

    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#333] p-4 text-white">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#00AE42]" />
                    Configuración de Variantes
                </h3>
                <button
                    type="button"
                    onClick={addGroup}
                    className="text-xs bg-[#00AE42] hover:bg-[#008a34] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold transition-colors"
                >
                    <Plus className="w-3 h-3" /> Agregar Grupo
                </button>
            </div>

            {variantes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm bg-[#111] rounded-lg border border-dashed border-[#333]">
                    No hay variantes configuradas.<br />
                    Probá agregando "Tamaño", "Color" o "Equipos".
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Tabs de Grupos */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {variantes.map(group => (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => setActiveTab(group.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${activeTab === group.id
                                    ? 'bg-[#00AE42]/10 border-[#00AE42] text-[#00AE42]'
                                    : 'bg-[#222] border-[#333] text-gray-400 hover:border-gray-500'
                                    }`}
                            >
                                {group.nombre}
                            </button>
                        ))}
                    </div>

                    {/* Editor del Grupo Activo */}
                    <AnimatePresence mode="wait">
                        {activeTab && (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-[#111] p-4 rounded-xl border border-[#333]"
                            >
                                {(() => {
                                    const group = variantes.find(v => v.id === activeTab)!
                                    if (!group) return null

                                    return (
                                        <div className="space-y-6">
                                            {/* Configuración del Grupo */}
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pb-4 border-b border-[#222]">
                                                <div className="md:col-span-5">
                                                    <label className="text-xs text-gray-500 mb-1 block">Nombre (ej: Capacidad)</label>
                                                    <input
                                                        type="text"
                                                        value={group.nombre}
                                                        onChange={(e) => updateGroup(group.id, 'nombre', e.target.value)}
                                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#00AE42] outline-none"
                                                    />
                                                </div>
                                                <div className="md:col-span-4">
                                                    <label className="text-xs text-gray-500 mb-1 block">Tipo de Selección</label>
                                                    <select
                                                        value={group.tipo}
                                                        onChange={(e) => updateGroup(group.id, 'tipo', e.target.value)}
                                                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-sm focus:border-[#00AE42] outline-none"
                                                    >
                                                        <option value="botones">Botones (Chips)</option>
                                                        <option value="select">Lista Desplegable (Select)</option>
                                                        <option value="color">Círculos de Color</option>
                                                    </select>
                                                </div>
                                                <div className="md:col-span-3 flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGroup(group.id)}
                                                        className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-3 py-2 hover:bg-red-900/10 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Eliminar Grupo
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Opciones */}
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Opciones</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => addOption(group.id)}
                                                        className="text-xs text-[#00AE42] hover:text-[#008a34] font-bold flex items-center gap-1"
                                                    >
                                                        <Plus className="w-3 h-3" /> Agregar Opción
                                                    </button>
                                                </div>

                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                    {group.opciones.map(option => (
                                                        <div key={option.id} className="flex gap-3 items-center bg-[#1a1a1a] p-2 rounded-lg border border-[#333] group hover:border-gray-600 transition-colors">
                                                            <GripVertical className="w-4 h-4 text-gray-600 cursor-move" />

                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nombre Opción"
                                                                    value={option.nombre}
                                                                    onChange={(e) => updateOption(group.id, option.id, 'nombre', e.target.value)}
                                                                    className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 placeholder-gray-600"
                                                                />
                                                            </div>

                                                            <div className="flex items-center gap-2 bg-[#111] px-2 py-1 rounded border border-[#333]">
                                                                <span className="text-xs text-[#00AE42] font-bold">$</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={basePrice + option.precioExtra}
                                                                    onChange={(e) => handlePriceChange(group.id, option.id, parseFloat(e.target.value) || 0)}
                                                                    className="w-20 bg-transparent border-none p-0 text-sm text-right focus:ring-0 font-bold"
                                                                />
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeOption(group.id, option.id)}
                                                                className="text-gray-500 hover:text-red-400 p-1"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {group.opciones.length === 0 && (
                                                        <div className="text-center py-4 text-gray-600 text-xs italic">
                                                            Agregá opciones (ej: "1 Litro", "Rojo", "Boca Juniors")
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
