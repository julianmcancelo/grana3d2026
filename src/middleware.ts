import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname

    // Definir rutas protegidas
    const isAdminRoute = path.startsWith('/admin')
    const isAdminApiRoute = path.startsWith('/api/admin')

    // Si no es ruta protegida, continuar
    if (!isAdminRoute && !isAdminApiRoute) {
        return NextResponse.next()
    }

    // Obtener token de cookies o header
    const tokenCookie = request.cookies.get('token')?.value
    const tokenHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
    const token = tokenCookie || tokenHeader

    if (!token) {
        if (isAdminApiRoute) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar token
    const payload = await verifyToken(token)

    if (!payload) {
        if (isAdminApiRoute) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar Rol ADMIN
    if (payload.rol !== 'ADMIN') {
        if (isAdminApiRoute) {
            return NextResponse.json({ error: 'Requiere permisos de administrador' }, { status: 403 })
        }
        // Redirigir a home o página de error
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

// Configurar matcher para optimizar rendimiento
export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*'
    ]
}
