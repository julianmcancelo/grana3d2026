"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '@/lib/api'

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
    login: (email: string, password: string) => Promise<void>
    registro: (nombre: string, email: string, password: string) => Promise<void>
    cerrarSesion: () => void
    abrirModal: (tipo: 'login' | 'registro') => void
    cerrarModal: () => void
}

const UsuarioContext = createContext<UsuarioContextType | undefined>(undefined)

export function UsuarioProvider({ children }: { children: ReactNode }) {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [cargando, setCargando] = useState(true)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [tipoModal, setTipoModal] = useState<'login' | 'registro'>('login')

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            api.get('/auth/me')
                .then(res => setUsuario(res.data.usuario))
                .catch(() => localStorage.removeItem('auth_token'))
                .finally(() => setCargando(false))
        } else {
            setCargando(false)
        }
    }, [])

    const login = async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('auth_token', data.token)
        setUsuario(data.usuario)
        setModalAbierto(false)
    }

    const registro = async (nombre: string, email: string, password: string) => {
        const { data } = await api.post('/auth/registro', { nombre, email, password })
        localStorage.setItem('auth_token', data.token)
        setUsuario(data.usuario)
        setModalAbierto(false)
    }

    const cerrarSesion = () => {
        localStorage.removeItem('auth_token')
        setUsuario(null)
    }

    const abrirModal = (tipo: 'login' | 'registro') => { setTipoModal(tipo); setModalAbierto(true) }
    const cerrarModal = () => setModalAbierto(false)

    return (
        <UsuarioContext.Provider value={{
            usuario,
            estaAutenticado: !!usuario,
            esAdmin: usuario?.rol === 'admin',
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
