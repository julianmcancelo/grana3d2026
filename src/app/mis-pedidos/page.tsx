import { getGlobalConfig } from '@/lib/config'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'
import MisPedidosClient from './MisPedidosClient'

// Forzar renderizado dinámico para evitar conexión a DB en build time
export const dynamic = 'force-dynamic'

export default async function MisPedidosPage() {
    const config = await getGlobalConfig()

    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    return <MisPedidosClient />
}
