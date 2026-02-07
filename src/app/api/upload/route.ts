import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(request: NextRequest) {
    try {
        const tokenCookie = request.cookies.get('token')?.value
        const tokenHeader = request.headers.get('Authorization')?.replace('Bearer ', '')
        const token = tokenCookie || tokenHeader

        if (!token) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        const payload = await verifyToken(token)
        if (!payload || payload.rol !== 'ADMIN') {
            return NextResponse.json({ error: 'Requiere permisos de administrador' }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No se recibió ningún archivo' },
                { status: 400 }
            )
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'Archivo demasiado grande' }, { status: 400 })
        }

        if (!ALLOWED_MIME.includes(file.type)) {
            return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const ext = file.type.split('/')[1] || 'jpg'
        const filename = `${crypto.randomUUID()}.${ext}`

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(path.join(uploadDir, filename), buffer)

        return NextResponse.json({ url: `/uploads/${filename}` })

    } catch (error) {
        console.error('Error subiendo imagen:', error)
        return NextResponse.json(
            { error: 'Error al procesar la imagen' },
            { status: 500 }
        )
    }
}
