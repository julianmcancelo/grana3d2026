export default function Logo({ className = "w-8 h-8", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className="flex items-center gap-2 select-none">
            <svg 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className={className}
            >
                {/* Hexagon Base - Usando los colores del logo original (Naranja, Cyan, Violeta) */}
                <path d="M50 5L93.3 30V80L50 105L6.7 80V30L50 5Z" fill="url(#gradOriginal)" fillOpacity="0.05"/>
                
                {/* 3D Layers forming a 'G' - Colores vibrantes del logo */}
                <path d="M50 20L80 37.32V74.64L50 91.96L20 74.64V37.32L50 20Z" stroke="url(#gradOriginal)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                
                {/* Inner details - Red accent (como el hotend del logo original) */}
                <path d="M50 45V65" stroke="#DC2626" strokeWidth="6" strokeLinecap="round"/>
                <path d="M50 65L68 55" stroke="#DC2626" strokeWidth="6" strokeLinecap="round"/>
                
                <defs>
                    <linearGradient id="gradOriginal" x1="20" y1="20" x2="80" y2="90" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF6B00"/> {/* Naranja */}
                        <stop offset="50%" stopColor="#00E5FF"/> {/* Cyan */}
                        <stop offset="100%" stopColor="#7C3AED"/> {/* Violeta */}
                    </linearGradient>
                </defs>
            </svg>
            
            {showText && (
                <span className="font-bold text-xl tracking-tight flex items-baseline">
                    <span className="text-gray-800 dark:text-white">GRANA</span>
                    <span className="ml-1 text-red-600">3D</span>
                </span>
            )}
        </div>
    )
}
