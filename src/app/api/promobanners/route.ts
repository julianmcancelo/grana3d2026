import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const banners = await prisma.promoBanner.findMany({
            where: { activo: true },
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json(banners)
    } catch (error) {
        console.error('Error listando promo banners:', error)
        return NextResponse.json({ error: 'Error al obtener banners' }, { status: 500 })
    }
}
