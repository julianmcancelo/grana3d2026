"use client"
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCarrito } from '@/context/CarritoContext'
import Swal from 'sweetalert2'

function CuponListenerContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { aplicarCupon } = useCarrito()

    useEffect(() => {
        const codigo = searchParams.get('cupom') || searchParams.get('cupon')
        if (codigo) {
            aplicarCupon(codigo).then((exito) => {
                if (exito) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Cupón Aplicado!',
                        text: `El cupón ${codigo} se ha aplicado a tu carrito.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        background: '#1a1a1a',
                        color: '#fff',
                        iconColor: '#14b8a6'
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Cupón Inválido',
                        text: `El cupón ${codigo} no es válido o ha expirado.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        background: '#1a1a1a',
                        color: '#fff'
                    })
                }

                // Limpiar URL sin recargar
                const newParams = new URLSearchParams(searchParams.toString())
                newParams.delete('cupom')
                newParams.delete('cupon')
                const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '')
                window.history.replaceState({}, '', newUrl)
            })
        }
    }, [searchParams, aplicarCupon, router])

    return null
}

export default function CuponListener() {
    return (
        <Suspense fallback={null}>
            <CuponListenerContent />
        </Suspense>
    )
}
