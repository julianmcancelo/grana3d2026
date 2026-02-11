'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Convertir Presupuesto (en memoria o guardado) a Pedido
export async function convertirPresupuestoAPedido(presupuesto: any) {
    try {
        // 1. Validar datos mínimos
        if (!presupuesto.items || presupuesto.items.length === 0) {
            throw new Error('El presupuesto no tiene items.')
        }

        // 2. Crear Pedido
        const nuevoPedido = await prisma.pedido.create({
            data: {
                nombreCliente: presupuesto.clienteNombre || 'Cliente Cotizador',
                emailCliente: presupuesto.clienteEmail || null,
                telefonoCliente: presupuesto.clienteTelefono || null,
                dniCliente: presupuesto.clienteCuit || null,
                total: presupuesto.total,
                estado: 'PENDIENTE',
                metodoPago: 'EFECTIVO', // Default, se puede cambiar luego
                origen: 'LOCAL',
                items: presupuesto.items, // Guardamos el JSON de items
                // createdAt se genera automáticamente por @default(now())
            }
        })

        revalidatePath('/admin/pedidos')
        return { success: true, pedidoId: nuevoPedido.id, message: 'Pedido creado exitosamente' }
    } catch (error: any) {
        console.error('Error convirtiendo presupuesto:', error)
        return { success: false, message: error.message }
    }
}
