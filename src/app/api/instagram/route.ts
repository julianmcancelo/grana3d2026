import { NextResponse } from 'next/server'

// Este token lo tenés que conseguir en developers.facebook.com
// o usando alguna herramienta generadora de tokens para Instagram Basic Display API
const INSTAGRAM_TOKEN = process.env.INSTAGRAM_TOKEN

export async function GET() {
    if (!INSTAGRAM_TOKEN) {
        return NextResponse.json({ error: 'Falta configurar INSTAGRAM_TOKEN' }, { status: 500 })
    }

    try {
        const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${INSTAGRAM_TOKEN}&limit=4`
        
        const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache por 1 hora
        const data = await res.json()

        if (data.error) {
            console.error('Error Instagram API:', data.error)
            throw new Error(data.error.message)
        }

        // Formateamos para nuestro frontend
        const posts = data.data.map((post: any) => ({
            id: post.id,
            img: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
            caption: post.caption || '',
            link: post.permalink,
            type: post.media_type
        }))

        return NextResponse.json(posts)

    } catch (error) {
        console.error('Falló el fetch a Instagram:', error)
        return NextResponse.json([], { status: 500 }) // Devolvemos array vacío para no romper la UI
    }
}
