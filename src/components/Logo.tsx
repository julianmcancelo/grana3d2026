export default function Logo({ className = "w-8 h-8", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className="flex items-center gap-2 select-none group">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${className} transition-transform duration-300 group-hover:scale-110`}
            >
                {/* Definiciones de gradientes */}
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00AE42" />
                        <stop offset="100%" stopColor="#008a34" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Base del cubo (Hexágono isométrico) */}
                <path
                    d="M50 15 L85 35 V75 L50 95 L15 75 V35 L50 15 Z"
                    fill="#1a1a1a"
                    stroke="url(#grad1)"
                    strokeWidth="4"
                    className="drop-shadow-lg"
                />

                {/* Cara Superior (G) */}
                <path
                    d="M50 25 L75 40 L50 55 L25 40 L50 25 Z"
                    fill="url(#grad1)"
                    fillOpacity="0.2"
                />
                
                {/* Estructura 3D Interna (Formando una G abstracta) */}
                <path
                    d="M50 55 V95 M50 55 L85 35 M50 55 L15 35"
                    stroke="#00AE42"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                />

                {/* Detalle tecnológico (Puntos de conexión) */}
                <circle cx="50" cy="55" r="3" fill="#fff" />
                <circle cx="50" cy="25" r="2" fill="#00AE42" />
                <circle cx="85" cy="35" r="2" fill="#00AE42" />
                <circle cx="15" cy="35" r="2" fill="#00AE42" />

                {/* Línea de impresión (capa) */}
                <path
                    d="M25 65 L50 80 L75 65"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    opacity="0.5"
                />
            </svg>
            
            {showText && (
                <div className="flex flex-col justify-center leading-none">
                    <span className="font-black text-xl tracking-tighter text-white">
                        GRANA<span className="text-[#00AE42]">3D</span>
                    </span>
                    <span className="text-[8px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                        Engineering
                    </span>
                </div>
            )}
        </div>
    )
}
