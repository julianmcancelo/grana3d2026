'use client'

import { useState } from "react"
import { updateConfig } from "./actions"
import { Loader2, Save } from "lucide-react"
import Swal from "sweetalert2"

type ConfigData = Record<string, string>

export default function ConfigForm({ initialData }: { initialData: ConfigData }) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            const data: Record<string, string> = {}
            formData.forEach((value, key) => {
                data[key] = value.toString()
            })

            const result = await updateConfig(data)
            if (result.success) {
                Swal.fire({
                    title: '¡Guardado!',
                    text: 'La configuración se actualizó correctamente',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo guardar la configuración',
                    icon: 'error'
                })
            }
        } catch (error) {
            Swal.fire({
                title: 'Error Inesperado',
                text: 'Ocurrió un problema al procesar la solicitud',
                icon: 'error'
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8">

            {/* Información General */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    🏢 Información de la Tienda
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre de la Tienda" name="nombreTienda" defaultValue={initialData.nombreTienda || 'Grana 3D'} />
                    <Field label="Dirección Física" name="direccion" defaultValue={initialData.direccion} />
                    <Field label="Email de Contacto" name="email" type="email" defaultValue={initialData.email} />
                    <Field label="URL del Logo" name="logoUrl" defaultValue={initialData.logoUrl} placeholder="https://..." />
                </div>
            </div>

            {/* Redes Sociales */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    📱 Redes y Contacto
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="WhatsApp (Solo números)" name="whatsapp" defaultValue={initialData.whatsapp} placeholder="54911..." />
                    <Field label="Instagram (Usuario)" name="instagram" defaultValue={initialData.instagram} placeholder="@grana3d" />
                </div>
            </div>

            {/* Datos Bancarios */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    🏦 Datos Bancarios (Para Transferencias)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre del Banco" name="bancoNombre" defaultValue={initialData.bancoNombre} />
                    <Field label="Titular de la Cuenta" name="bancoTitular" defaultValue={initialData.bancoTitular} />
                    <Field label="CBU / CVU" name="bancoCbu" defaultValue={initialData.bancoCbu} />
                    <Field label="Alias" name="bancoAlias" defaultValue={initialData.bancoAlias} />
                </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end sticky bottom-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#00AE42] hover:bg-green-600 text-black font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/20 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                    Guardar Cambios
                </button>
            </div>

        </form>
    )
}

function Field({ label, name, type = "text", defaultValue, placeholder }: any) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-gray-400 text-sm">{label}</label>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className="bg-black/50 border border-gray-800 rounded-lg p-2.5 text-white focus:border-[#00AE42] focus:ring-1 focus:ring-[#00AE42] outline-none transition-all"
            />
        </div>
    )
}
