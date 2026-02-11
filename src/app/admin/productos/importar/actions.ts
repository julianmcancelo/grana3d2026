'use server'

import { syncProducts, readProductUpdates } from '@/lib/googleSheets'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Exportar Productos a Sheets (Sobrescribe la hoja)
export async function syncToSheet() {
    try {
        const productos = await prisma.producto.findMany({
            include: { categoria: true },
            orderBy: { nombre: 'asc' }
        })

        const count = await syncProducts(productos)
        return { success: true, count, message: 'Productos exportados correctamente' }
    } catch (error: any) {
        console.error('Error syncing to sheet:', error)
        return { success: false, message: error.message }
    }
}

// Importar Precios/Stock desde Sheets (Actualiza la DB)
export async function importFromSheet() {
    try {
        const updates = await readProductUpdates()
        let updatedCount = 0

        for (const update of updates) {
            await prisma.producto.update({
                where: { id: update.id },
                data: {
                    precio: update.precio,
                    stock: update.stock,
                    activo: update.activo
                }
            })
            updatedCount++
        }

        revalidatePath('/admin/productos')
        return { success: true, count: updatedCount, message: 'Precios y Stock actualizados desde Sheets' }
    } catch (error: any) {
        console.error('Error importing from sheet:', error)
        return { success: false, message: error.message }
    }
}

// Bulk Create Products (Manual Import)
export async function bulkCreateProducts(products: any[]) {
    try {
        let createdCount = 0

        // Usar transacción o crear uno por uno para manejar errores individuales si fuera necesario
        // Aquí hacemos un loop simple
        for (const p of products) {
            // Generar slug
            const slug = p.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 5)

            // Crear producto (Force Update)
            await prisma.producto.create({
                data: {
                    nombre: p.nombre,
                    slug,
                    precio: p.precio,
                    stock: p.stock,
                    descripcion: p.descripcion,
                    imagen: p.imagen,
                    imagenes: p.imagen ? [p.imagen] : [],
                    activo: true,
                    destacado: false,
                    esPreventa: false,
                    updatedAt: new Date(),
                    categoria: {
                        connect: { id: p.categoriaId }
                    }
                }
            })
            createdCount++
        }

        revalidatePath('/admin/productos')
        return { success: true, count: createdCount }
    } catch (error: any) {
        console.error('Error bulk create:', error)
        return { success: false, message: error.message }
    }
}

export async function getCategoriasSimple() {
    try {
        const categorias = await prisma.categoria.findMany({
            select: { id: true, nombre: true },
            orderBy: { nombre: 'asc' }
        })
        return categorias
    } catch (error) {
        console.error('Error fetching categories:', error)
        return []
    }
}
