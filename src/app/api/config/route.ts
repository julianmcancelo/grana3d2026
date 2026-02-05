import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// API pública para obtener configuración (solo lo necesario)
export async function GET() {
    try {
        const configuraciones = await prisma.configuracion.findMany({
            where: {
                clave: {
                    in: ['modoProximamente', 'textoProximamente', 'nombreTienda', 'whatsapp', 'instagram', 'email']
                }
            }
        })

        const config: Record<string, any> = {
            modoProximamente: false,
            textoProximamente: '¡Próximamente!',
            nombreTienda: 'Grana3D',
            whatsapp: '',
            instagram: '',
            email: ''
        }

        for (const item of configuraciones) {
            try {
                config[item.clave] = JSON.parse(item.valor)
            } catch {
                config[item.clave] = item.valor
            }
        }

        return NextResponse.json(config)
    } catch (error) {
        console.error('Error obteniendo configuración:', error)
        return NextResponse.json({
            modoProximamente: false,
            textoProximamente: '¡Próximamente!',
            nombreTienda: 'Grana3D',
            whatsapp: '',
            instagram: '',
            email: ''
        })
    }
}
