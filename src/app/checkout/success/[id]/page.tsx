"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function SuccessPage() {
    const params = useParams()
    const id = params?.id as string
    const [whatsappLink, setWhatsappLink] = useState('')

    useEffect(() => {
        if (id) {
            const numeroCorto = id.slice(-8).toUpperCase()
            const mensaje = `Hola! Acabo de hacer el pedido *#${numeroCorto}* y quería coordinar el pago/envío.`
            setWhatsappLink(`https://wa.me/5491112345678?text=${encodeURIComponent(mensaje)}`)
        }
    }, [id])

    if (!id) return null

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Gracias por tu compra!</h1>
                <p className="text-gray-500 mb-8">
                    Tu pedido ha sido registrado con éxito. Te enviamos un email con los detalles.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
                    <p className="text-sm text-gray-500 mb-1">Número de Pedido:</p>
                    <p className="text-lg font-mono font-bold text-gray-900 select-all">#{id.slice(-8).toUpperCase()}</p>
                </div>

                <div className="space-y-3">
                    {whatsappLink && (
                        <a 
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" /> Avisar por WhatsApp
                        </a>
                    )}
                    
                    <Link 
                        href="/" 
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <ShoppingBag className="w-5 h-5" /> Volver a la Tienda
                    </Link>
                </div>
            </div>
        </div>
    )
}
