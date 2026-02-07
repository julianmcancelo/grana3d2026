import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload || payload.rol !== 'ADMIN') return null
  return payload
}

export async function GET() {
  try {
    const novedades = await prisma.novedad.findMany({
      where: { activa: true },
      orderBy: { fechaPublicacion: 'desc' },
      take: 5
    })
    return NextResponse.json(novedades)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener novedades' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req)
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const data = await req.json()
    const novedad = await prisma.novedad.create({
      data: {
        titulo: data.titulo,
        contenido: data.contenido,
        imagen: data.imagen,
        activa: true
      }
    })
    return NextResponse.json(novedad)
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear novedad' }, { status: 500 })
  }
}
