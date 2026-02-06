import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { error: 'No se recibió ningún archivo' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Subir a Cloudinary usando upload_stream
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'grana3d', // Carpeta en Cloudinary
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            )
            uploadStream.end(buffer)
        })

        return NextResponse.json({
            url: result.secure_url,
            public_id: result.public_id
        })

    } catch (error) {
        console.error('Error subiendo imagen:', error)
        return NextResponse.json(
            { error: 'Error al procesar la imagen' },
            { status: 500 }
        )
    }
}
