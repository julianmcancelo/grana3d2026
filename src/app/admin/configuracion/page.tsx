import { getAllConfig, getMaintenanceStatus } from "./actions"
import MaintenanceButton from "./MaintenanceButton"
import ConfigForm from "./ConfigForm"
import { ShieldAlert } from "lucide-react"

export default async function ConfiguracionPage() {
    const isMaintenanceMode = await getMaintenanceStatus()
    const allConfig = await getAllConfig()

    return (
        <div className="p-8 max-w-5xl mx-auto pb-24">
            <div className="flex items-center gap-3 mb-8">
                <ShieldAlert className="w-8 h-8 text-[#00AE42]" />
                <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
            </div>

            {/* Sección Mantenimiento */}
            <div className="bg-red-900/10 border border-red-900/30 rounded-xl p-6 mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                        🚨 Modo Mantenimiento
                    </h2>
                    <p className="text-gray-400 text-sm max-w-lg">
                        Al activar esto, el sitio público mostrará la página de mantenimiento.
                        Tú como administrador podrás seguir navegando normalmente.
                    </p>
                </div>
                <MaintenanceButton initialState={isMaintenanceMode} />
            </div>

            <hr className="border-gray-800 mb-8" />

            {/* Formulario General */}
            <ConfigForm initialData={allConfig} />
        </div>
    )
}
