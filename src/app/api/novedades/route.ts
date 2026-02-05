import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const novedades = await prisma.novedad.findMany({
      where: { activa: true },
      orderBy: { fechaPublicacion: 'desc' },
      take: 5
    });
    return NextResponse.json(novedades);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener novedades' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const novedad = await prisma.novedad.create({
      data: {
        titulo: data.titulo,
        contenido: data.contenido,
        imagen: data.imagen,
        activa: true
      }
    });
    return NextResponse.json(novedad);
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear novedad' }, { status: 500 });
  }
}
