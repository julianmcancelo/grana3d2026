import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const UPLOAD_DIR = process.env.UPLOAD_DIR

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
        const buffer = Buffer.from(bytes as any)
        const ext = file.type.split('/')[1] === 'png' ? 'png' : 'jpg' // Normalizar extensión
        const filename = `${crypto.randomUUID()}.${ext}`

        // Procesar imagen con Sharp y Marca de Agua
        const watermarkPath = path.join(process.cwd(), 'public', 'watermark.png')
        let finalBuffer = buffer

        try {
            // Verificar si existe la marca de agua
            await fs.access(watermarkPath)

            // Obtener dimensiones de la imagen original
            const image = sharp(buffer)
            const metadata = await image.metadata()

            if (metadata.width) {
                // Redimensionar marca de agua al 20% del ancho de la imagen
                const watermarkWidth = Math.round(metadata.width * 0.2)

                // Preparar marca de agua: Redimensionar y aplicar 50% opacidad
                const watermarkBuffer = await sharp(watermarkPath)
                    .resize({ width: watermarkWidth })
                    .ensureAlpha()
                    .composite([{
                        input: Buffer.from([255, 255, 255, 128]), // Capa blanca al 50% de opacidad (128/255)
                        raw: { width: 1, height: 1, channels: 4 },
                        tile: true,
                        blend: 'dest-in'
                    }])
                    .toBuffer()

                const compositeBuffer = await image
                    .composite([{
                        input: watermarkBuffer,
                        gravity: 'southeast', // Esquina inferior derecha
                        blend: 'over'
                    }])
                    .toBuffer()

                finalBuffer = Buffer.from(compositeBuffer)
            }
        } catch (e) {
            console.warn('No se pudo aplicar marca de agua (falta archivo o error sharp):', e)
            // Si falla, usamos el buffer original
        }

        const uploadDir = UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads')
        await fs.mkdir(uploadDir, { recursive: true })
        await fs.writeFile(path.join(uploadDir, filename), finalBuffer)

        const publicBase = UPLOAD_DIR ? process.env.UPLOAD_PUBLIC_BASE || '/uploads' : '/uploads'
        return NextResponse.json({ url: `${publicBase}/${filename}` })

    } catch (error) {
        console.error('Error subiendo imagen:', error)
        return NextResponse.json(
            { error: 'Error al procesar la imagen' },
            { status: 500 }
        )
    }
}
