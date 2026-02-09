type JwtPayload = Record<string, unknown>

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

const base64UrlEncode = (input: Uint8Array | string) => {
    const bytes = typeof input === 'string' ? textEncoder.encode(input) : input
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const base64UrlDecode = (input: string) => {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (input.length % 4)) % 4)
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    return bytes
}

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET no está configurado')
    return secret
}

const importHmacKey = async (secret: string) => {
    return crypto.subtle.importKey(
        'raw',
        textEncoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    )
}

export async function signToken(payload: JwtPayload) {
    const secret = getJwtSecret()
    const key = await importHmacKey(secret)

    const now = Math.floor(Date.now() / 1000)
    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + 7 * 24 * 60 * 60,
    }

    const headerEncoded = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload))
    const unsignedToken = `${headerEncoded}.${payloadEncoded}`

    const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(unsignedToken))
    const signatureEncoded = base64UrlEncode(new Uint8Array(signature))

    return `${unsignedToken}.${signatureEncoded}`
}

export async function verifyToken(token: string) {
    try {
        const secret = process.env.JWT_SECRET
        if (!secret) return null

        const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.')
        if (!headerEncoded || !payloadEncoded || !signatureEncoded) return null

        const key = await importHmacKey(secret)
        const unsignedToken = `${headerEncoded}.${payloadEncoded}`

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            base64UrlDecode(signatureEncoded),
            textEncoder.encode(unsignedToken)
        )

        if (!isValid) return null

        const payload = JSON.parse(textDecoder.decode(base64UrlDecode(payloadEncoded))) as JwtPayload & { exp?: number }
        if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null

        return payload
    } catch {
        return null
    }
}
