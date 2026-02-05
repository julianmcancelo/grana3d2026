import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const resenas = await prisma.resena.findMany({
            where: { activa: true },
            orderBy: { orden: 'asc' }
        })
        return NextResponse.json(resenas)
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching reviews' }, { status: 500 })
    }
}
