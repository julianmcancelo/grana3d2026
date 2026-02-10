'use client'

import { useState } from "react"
import { toggleMaintenance } from "./actions"
import { Loader2, Power } from "lucide-react"

export default function MaintenanceButton({ initialState }: { initialState: boolean }) {
    const [isActive, setIsActive] = useState(initialState)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async () => {
        setIsLoading(true)
        try {
            await toggleMaintenance(isActive)
            setIsActive(!isActive)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`
                relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 
                focus-visible:ring-white/75
                ${isActive ? 'bg-red-600' : 'bg-gray-700'}
            `}
        >
            <span className="sr-only">Use setting</span>
            <span
                aria-hidden="true"
                className={`
                    pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 
                    transition duration-200 ease-in-out flex items-center justify-center
                    ${isActive ? 'translate-x-6' : 'translate-x-0'}
                `}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 text-gray-800 animate-spin" />
                ) : (
                    <Power className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-gray-400'}`} />
                )}
            </span>
        </button>
    )
}
