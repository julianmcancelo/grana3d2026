'use server'
import { prisma } from '@/lib/prisma'

export async function suscribirNewsletter(email: string) {
    try {
        if (!email || !email.includes('@')) {
            return { success: false, message: 'Email inválido rey, fijate bien.' }
        }

        const existing = await prisma.suscriptor.findUnique({
            where: { email }
        })

        if (existing) {
            return { success: true, message: '¡Ya estás en la lista, genio!' }
        }

        await prisma.suscriptor.create({
            data: { email }
        })

        return { success: true, message: '¡Listo! Te avisamos apenas abramos.' }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Uhh rompió algo. Probá de nuevo.' }
    }
}
