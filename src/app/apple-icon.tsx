import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 180,
    height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Luxurious dark metal background
                    background: 'radial-gradient(circle at 50% 0%, #3a3a3a 0%, #050505 100%)',
                    borderRadius: 40,
                }}
            >
                {/* Subtle noise texture overlay if possible, or just ring */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    border: '4px solid rgba(255,255,255,0.05)',
                    borderRadius: 40,
                }} />

                <svg
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        filter: 'drop-shadow(0px 10px 20px rgba(0, 255, 66, 0.4))', // Stronger Neon Glow for large icon
                    }}
                >
                    <defs>
                        {/* Richer Gradient for Large Icon */}
                        <linearGradient id="neonGreenLarge" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#4AFF80" />
                            <stop offset="50%" stopColor="#00AE42" />
                            <stop offset="100%" stopColor="#006624" />
                        </linearGradient>
                        <linearGradient id="lighting" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                        </linearGradient>
                    </defs>

                    <g>
                        <path d="M4 6H20L18 10H6L4 6Z" fill="url(#neonGreenLarge)" />
                        <path d="M4 8V18L8 16V10L4 8Z" fill="url(#neonGreenLarge)" />
                        <path d="M6 18H14L16 14H8L6 18Z" fill="url(#neonGreenLarge)" />
                        <path d="M12 14H18L20 10H14L12 14Z" fill="url(#neonGreenLarge)" />

                        {/* Highlight for "Glossy" look */}
                        <path d="M4 6H20L18 10H6L4 6Z" fill="url(#lighting)" style={{ opacity: 0.3 }} />
                    </g>
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
