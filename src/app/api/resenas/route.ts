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

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { nombre, texto, rating } = body

        const newReview = await prisma.resena.create({
            data: {
                nombre,
                texto,
                rating: Number(rating) || 5,
                activa: false // Pending approval
            }
        })

        return NextResponse.json(newReview)
    } catch (error) {
        return NextResponse.json({ error: 'Error creating review' }, { status: 500 })
    }
}
