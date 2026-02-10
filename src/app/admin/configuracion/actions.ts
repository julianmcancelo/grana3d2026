'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleMaintenance(currentState: boolean) {
    try {
        await prisma.configuracion.upsert({
            where: { clave: 'MAINTENANCE_MODE' },
            update: { valor: (!currentState).toString() },
            create: { clave: 'MAINTENANCE_MODE', valor: 'true' }
        })
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, error: 'Error al actualizar' }
    }
}

export async function getMaintenanceStatus() {
    const config = await prisma.configuracion.findUnique({
        where: { clave: 'MAINTENANCE_MODE' }
    })
    return config?.valor === 'true'
}
