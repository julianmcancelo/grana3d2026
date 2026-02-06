"use client"
import React, { useState } from 'react'
import { Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, Code, Eye, EyeOff, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface EditorProps {
    value: string
    onChange: (val: string) => void
    label?: string
}

export default function MarkdownEditor({ value, onChange, label }: EditorProps) {
    const [preview, setPreview] = useState(false)
    const [uploading, setUploading] = useState(false)

    const insertText = (before: string, after: string = '') => {
        const textarea = document.getElementById('md-editor') as HTMLTextAreaElement
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
        
        onChange(newText)
        
        // Restore focus next tick
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(start + before.length, end + before.length)
        }, 0)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const data = await res.json()
            if (data.url) {
                insertText(`![Imagen](${data.url})`)
            }
        } catch (error) {
            console.error(error)
            alert('Error al subir imagen')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-medium text-gray-400">{label}</label>}
            
            <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/20 overflow-x-auto">
                    <button type="button" onClick={() => insertText('**', '**')} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Negrita">
                        <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertText('*', '*')} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Cursiva">
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button type="button" onClick={() => insertText('- ')} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Lista">
                        <List className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertText('[Texto](url)')} className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Enlace">
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    
                    <label className="p-2 hover:bg-white/10 rounded text-gray-400 hover:text-white cursor-pointer relative" title="Insertar Imagen">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>

                    <div className="flex-1" />
                    
                    <button 
                        type="button" 
                        onClick={() => setPreview(!preview)} 
                        className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-colors ${preview ? 'bg-teal-500/20 text-teal-400' : 'hover:bg-white/10 text-gray-400'}`}
                    >
                        {preview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {preview ? 'Editar' : 'Vista Previa'}
                    </button>
                </div>

                {/* Editor / Preview Area */}
                <div className="relative min-h-[300px]">
                    {preview ? (
                        <div className="prose prose-invert prose-sm max-w-none p-4 bg-black/50 h-full min-h-[300px] overflow-y-auto">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {value || '*Sin contenido*'}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            id="md-editor"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full h-full min-h-[300px] p-4 bg-transparent text-white resize-y focus:outline-none font-mono text-sm leading-relaxed"
                            placeholder="Escribí la descripción acá... Usá Markdown o el menú de arriba."
                        />
                    )}
                </div>
            </div>
            
            <p className="text-xs text-gray-500">
                Tip: Podés pegar imágenes directamente copiando la URL, o usar el botón de imagen para subir desde tu PC.
            </p>
        </div>
    )
}
