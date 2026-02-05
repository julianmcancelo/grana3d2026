import { prisma } from '@/lib/prisma'

export async function getGlobalConfig() {
    const configRaw = await prisma.configuracion.findMany()
    
    const configMap = configRaw.reduce((acc: any, curr) => {
        acc[curr.clave] = curr.valor
        return acc
    }, {})

    return {
        modoProximamente: configMap['modoProximamente'] === 'true',
        textoProximamente: configMap['textoProximamente'] || '¡Próximamente!'
    }
}
