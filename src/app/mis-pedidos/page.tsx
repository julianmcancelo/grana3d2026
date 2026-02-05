import { getGlobalConfig } from '@/lib/config'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'
import MisPedidosClient from './MisPedidosClient'

export default async function MisPedidosPage() {
    const config = await getGlobalConfig()

    if (config.modoProximamente) {
        return <MantenimientoEpicardo texto={config.textoProximamente} />
    }

    return <MisPedidosClient />
}
