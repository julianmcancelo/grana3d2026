import { jwtVerify, SignJWT } from 'jose'

const SECRET_KEY = process.env.JWT_SECRET || 'secret_super_seguro_cambiame_por_favor'
const key = new TextEncoder().encode(SECRET_KEY)

export async function signToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d') // 7 días de sesión
        .sign(key)
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256']
        })
        return payload
    } catch (error) {
        return null
    }
}
