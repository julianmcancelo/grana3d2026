import axios from 'axios'

// En producción usamos URLs relativas, en desarrollo usamos el servidor local
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // En el cliente, siempre usar URLs relativas
        return '/api'
    }
    // En el servidor
    return process.env.NEXT_PUBLIC_API_URL || '/api'
}

const api = axios.create({
    baseURL: getBaseURL(),
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) config.headers.Authorization = `Bearer ${token}`
    }

    // Evitar caché en navegadores para requests GET
    if (config.method === 'get') {
        config.params = { ...config.params, _t: Date.now() }
    }

    return config
})

export default api
