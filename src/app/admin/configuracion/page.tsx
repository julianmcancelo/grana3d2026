import { getMaintenanceStatus, toggleMaintenance } from "./actions"
import MaintenanceButton from "./MaintenanceButton"

export default async function ConfiguracionPage() {
    const isMaintenanceMode = await getMaintenanceStatus()

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8 text-white">Configuración del Sistema</h1>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-2">Modo Mantenimiento</h2>
                        <p className="text-gray-400 text-sm">
                            Cuando está activo, todo el tráfico público será redirigido a maintenance.grana3d.com.ar.
                            <br />
                            <span className="text-yellow-500">Tú (Admin) seguirás teniendo acceso.</span>
                        </p>
                    </div>
                    <MaintenanceButton initialState={isMaintenanceMode} />
                </div>
            </div>
        </div>
    )
}
