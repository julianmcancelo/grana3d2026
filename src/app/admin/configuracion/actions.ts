'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateConfig(data: Record<string, string>) {
    try {
        const updates = Object.entries(data).map(([clave, valor]) =>
            prisma.configuracion.upsert({
                where: { clave },
                update: { valor },
                create: { clave, valor }
            })
        )
        await prisma.$transaction(updates)
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Error al actualizar configuración' }
    }
}

export async function getAllConfig() {
    const config = await prisma.configuracion.findMany()
    return config.reduce((acc, curr) => ({ ...acc, [curr.clave]: curr.valor }), {} as Record<string, string>)
}

export async function toggleMaintenance(currentState: boolean) {
    try {
        await prisma.configuracion.upsert({
            where: { clave: 'MAINTENANCE_MODE' },
            update: { valor: (!currentState).toString() },
            create: { clave: 'MAINTENANCE_MODE', valor: 'true' }
        })
        revalidatePath('/', 'layout')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Error al actualizar status' }
    }
}

export async function getMaintenanceStatus() {
    const config = await prisma.configuracion.findUnique({
        where: { clave: 'MAINTENANCE_MODE' }
    })
    return config?.valor === 'true'
}
