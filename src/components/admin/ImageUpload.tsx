"use client"
import { useState } from 'react'
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    label?: string
}

export default function ImageUpload({ value, onChange, label = "Imagen" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Error subiendo imagen')

            const data = await res.json()
            onChange(data.url)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Error al subir imagen')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
            
            <div className="space-y-4">
                {/* Preview */}
                {value ? (
                    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/10 group">
                        <img 
                            src={value} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => onChange('')}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full aspect-video bg-gray-900 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm">Sin imagen</span>
                    </div>
                )}

                {/* Controls */}
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
                
                {/* Fallback URL manual (opcional, por si falla el upload o ya tienen link) */}
                 <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="O pegá una URL externa..."
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-xs text-gray-400 focus:outline-none focus:border-teal-500"
                />
            </div>
        </div>
    )
}
