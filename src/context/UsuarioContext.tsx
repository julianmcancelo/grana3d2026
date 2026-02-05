"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '@/lib/api'
import Swal from 'sweetalert2'

interface Usuario {
    id: string
    nombre: string
    email: string
    rol: string
}

interface UsuarioContextType {
    usuario: Usuario | null
    estaAutenticado: boolean
    esAdmin: boolean
    cargando: boolean
    modalAbierto: boolean
    tipoModal: 'login' | 'registro'
    login: (email: string, password: string) => Promise<boolean>
    registro: (nombre: string, email: string, password: string) => Promise<boolean>
    cerrarSesion: () => void
    abrirModal: (tipo: 'login' | 'registro') => void
    cerrarModal: () => void
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined)

// Configuración global de SweetAlert para tema oscuro
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: '#1a1a1a',
    color: '#fff',
    iconColor: '#14b8a6',
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
    }
})

export function UsuarioProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [cargando, setCargando] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [tipoModal, setTipoModal] = useState<'login' | 'registro'>('login')

    // Verificar sesión al cargar
    useEffect(() => {
        verificarSesion()
    }, [])

    const verificarSesion = async () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            try {
                const res = await api.get('/auth/me')
                setUsuario(res.data.usuario)
            } catch {
                localStorage.removeItem('auth_token')
                setUsuario(null)
            }
        }
        setCargando(false)
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await api.post('/auth/login', { email, password })
            localStorage.setItem('auth_token', data.token)
            setUsuario(data.usuario)
            setModalAbierto(false)

            Toast.fire({
                icon: 'success',
                title: `¡Bienvenido, ${data.usuario.nombre}!`
            })

            return true
        } catch (error: any) {
            const mensaje = error?.response?.data?.error || 'Error al iniciar sesión'

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#14b8a6'
            })

            return false
        }
    }

    const registro = async (nombre: string, email: string, password: string): Promise<boolean> => {
        try {
            const { data } = await api.post('/auth/registro', { nombre, email, password })
            localStorage.setItem('auth_token', data.token)
            setUsuario(data.usuario)
            setModalAbierto(false)

            Toast.fire({
                icon: 'success',
                title: `¡Cuenta creada! Bienvenido, ${data.usuario.nombre}`
            })

            return true
        } catch (error: any) {
            const mensaje = error?.response?.data?.error || 'Error al crear cuenta'

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensaje,
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#14b8a6'
            })

            return false
        }
    }

    const cerrarSesion = () => {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: 'Te desconectarás de tu cuenta',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#14b8a6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: '#1a1a1a',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('auth_token')
                setUsuario(null)

                Toast.fire({
                    icon: 'info',
                    title: 'Sesión cerrada'
                })
            }
        })
    }

    const abrirModal = (tipo: 'login' | 'registro') => {
        setTipoModal(tipo)
        setModalAbierto(true)
    }

    const cerrarModal = () => setModalAbierto(false)

    return (
        <UsuarioContext.Provider value={{
            usuario,
            estaAutenticado: !!usuario,
            esAdmin: usuario?.rol === 'ADMIN',
            cargando,
            modalAbierto,
            tipoModal,
            login,
            registro,
            cerrarSesion,
            abrirModal,
            cerrarModal
        }}>
            {children}
        </UsuarioContext.Provider>
    )
}

export const useUsuario = () => {
    const ctx = useContext(UsuarioContext)
    if (!ctx) throw new Error('useUsuario must be used within UsuarioProvider')
    return ctx
}
