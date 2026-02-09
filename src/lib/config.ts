import { prisma } from '@/lib/prisma'

function parseConfigValue(value: string) {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

function normalizeWhatsappLink(whatsapp?: string) {
    if (!whatsapp) return ''
    const digits = whatsapp.replace(/\D/g, '')
    if (!digits) return ''
    return `https://wa.me/${digits}`
}

function normalizeInstagramLink(instagram?: string) {
    if (!instagram) return ''
    if (instagram.startsWith('http')) return instagram
    const handle = instagram.startsWith('@') ? instagram.slice(1) : instagram
    return `https://instagram.com/${handle}`
}

export async function getGlobalConfig() {
    const configRaw = await prisma.configuracion.findMany()

    const configMap = configRaw.reduce((acc: any, curr: any) => {
        acc[curr.clave] = parseConfigValue(curr.valor)
        return acc
    }, {})

    return {
        modoProximamente: configMap['modoProximamente'] === true || configMap['modoProximamente'] === 'true',
        textoProximamente: configMap['textoProximamente'] || '¡Próximamente!'
    }
}

export async function getEmailConfig() {
    const configRaw = await prisma.configuracion.findMany()

    const configMap = configRaw.reduce((acc: any, curr: any) => {
        acc[curr.clave] = parseConfigValue(curr.valor)
        return acc
    }, {})

    const whatsapp = configMap['whatsapp'] || ''
    const instagram = configMap['instagram'] || ''

    return {
        nombreTienda: configMap['nombreTienda'] || 'Grana 3D',
        logoUrl: configMap['logoUrl'] || '',
        direccion: configMap['direccion'] || '',
        whatsapp,
        whatsappLink: normalizeWhatsappLink(whatsapp),
        instagram,
        instagramLink: normalizeInstagramLink(instagram),
        email: configMap['email'] || '',
        bancoNombre: configMap['bancoNombre'] || '',
        bancoCbu: configMap['bancoCbu'] || '',
        bancoAlias: configMap['bancoAlias'] || '',
        bancoTitular: configMap['bancoTitular'] || ''
    }
}
