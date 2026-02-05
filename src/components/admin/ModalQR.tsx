"use client"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2 } from 'lucide-react'
import QRCode from 'react-qr-code'
import { useRef } from 'react'

interface ModalQRProps {
    isOpen: boolean
    onClose: () => void
    codigo: string
    titulo?: string
    mensaje?: string
}

export default function ModalQR({ isOpen, onClose, codigo, titulo = "Código QR", mensaje }: ModalQRProps) {
    const qrRef = useRef<HTMLDivElement>(null)

    const descargarQR = () => {
        const svg = qrRef.current?.querySelector('svg')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        // Configurar dimensiones (más grande para mejor calidad)
        const size = 500
        canvas.width = size
        canvas.height = size

        img.onload = () => {
            if (!ctx) return
            // Fondo blanco
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, size, size)
            // Dibujar QR
            ctx.drawImage(img, 25, 25, size - 50, size - 50) // Márgenes

            const pngFile = canvas.toDataURL('image/png')
            const downloadLink = document.createElement('a')
            downloadLink.download = `QR-GRANA-${codigo}.png`
            downloadLink.href = pngFile
            downloadLink.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    const copiadoLink = () => {
        const link = `${typeof window !== 'undefined' ? window.location.origin : ''}?cupon=${codigo}`
        navigator.clipboard.writeText(link)
        // Podríamos mostrar un toast aquí pero el componente es simple
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full relative"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>

                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{titulo}</h3>
                        <p className="text-gray-500 mb-6 text-center">
                            {mensaje || <>Escaneá para aplicar el cupón <span className="font-bold text-teal-600">{codigo}</span></>}
                        </p>

                        <div ref={qrRef} className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-inner mb-6">
                            <QRCode
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}?cupon=${codigo}`}
                                size={200}
                                level="H"
                            />
                        </div>

                        <div className="flex gap-2 w-full mb-4">
                            <button
                                onClick={descargarQR}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-bold"
                            >
                                <Download size={16} /> Descargar PNG
                            </button>
                        </div>

                        <a
                            href={`${typeof window !== 'undefined' ? window.location.origin : ''}?cupon=${codigo}`}
                            target="_blank"
                            className="text-sm text-teal-600 hover:underline break-all text-center block"
                        >
                            Link directo: ...?cupon={codigo}
                        </a>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
