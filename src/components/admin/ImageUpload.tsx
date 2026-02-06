"use client"
import { useState } from 'react'
import { Upload, Trash2, Loader2, Image as ImageIcon, Plus } from 'lucide-react'

interface ImageUploadProps {
    value?: string | string[]
    onChange: (url: string | string[]) => void
    label?: string
    multiple?: boolean
}

export default function ImageUpload({ value, onChange, label = "Imagen", multiple = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)

    // Normalizar valor a array si es múltiple, o string si es simple
    const urls = multiple 
        ? (Array.isArray(value) ? value : (value ? [value] : []))
        : (typeof value === 'string' ? value : '')

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        
        try {
            const newUrls: string[] = []

            // Subir cada archivo secuencialmente (podría ser paralelo con Promise.all)
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData()
                formData.append('file', files[i])

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) throw new Error('Error subiendo imagen')
                const data = await res.json()
                newUrls.push(data.url)
            }

            if (multiple) {
                // Agregar a las existentes
                onChange([...(urls as string[]), ...newUrls])
            } else {
                // Reemplazar (solo toma la primera si subieron varias por error en modo simple)
                onChange(newUrls[0])
            }

        } catch (error) {
            console.error('Upload error:', error)
            alert('Error al subir imagen')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (indexOrUrl: number | string) => {
        if (multiple) {
            const newUrls = [...(urls as string[])]
            newUrls.splice(indexOrUrl as number, 1)
            onChange(newUrls)
        } else {
            onChange('')
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
            
            <div className="space-y-4">
                
                {/* MODO MÚLTIPLE: Grid de imágenes */}
                {multiple ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {(urls as string[]).map((url, i) => (
                            <div key={i} className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-white/10 group">
                                <img src={url} alt={`Imagen ${i}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {i === 0 && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-teal-500/80 text-black text-[10px] font-bold rounded">
                                        PRINCIPAL
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {/* Botón agregar más */}
                        <label className={`relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                            {uploading ? (
                                <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                            ) : (
                                <Plus className="w-6 h-6 text-gray-500" />
                            )}
                            <span className="text-xs text-gray-500 mt-2 font-medium">Agregar</span>
                            <input 
                                type="file" 
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                                disabled={uploading}
                                className="hidden" 
                            />
                        </label>
                    </div>
                ) : (
                    /* MODO SIMPLE (Como estaba antes) */
                    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 group">
                        {urls ? (
                            <>
                                <img src={urls as string} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(0)}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm">Sin imagen</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Controles para MODO SIMPLE (Oculto en múltiple porque ya tiene el botón grid) */}
                {!multiple && (
                    <div className="flex gap-2">
                        <label className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                            ) : (
                                <Upload className="w-5 h-5 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-300">
                                {uploading ? 'Subiendo...' : 'Subir Imagen'}
                            </span>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="hidden" 
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    )
}
