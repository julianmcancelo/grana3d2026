import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
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
                    background: 'radial-gradient(circle at 50% 0%, #2a2a2a 0%, #000000 100%)', // Subtle lighting
                    borderRadius: 6,
                    border: '1px solid #333',
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        filter: 'drop-shadow(0px 2px 4px rgba(0, 255, 66, 0.2))', // Neon Glow
                    }}
                >
                    <defs>
                        <linearGradient id="neonGreen" x1="4" y1="6" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#00FF41" />
                            <stop offset="100%" stopColor="#008F35" />
                        </linearGradient>
                        <linearGradient id="depth" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                        </linearGradient>
                    </defs>

                    {/* Main Shape with Gradient */}
                    <path
                        d="M4 6H20L18 10H6L4 6Z"
                        fill="url(#neonGreen)"
                    />
                    <path
                        d="M4 8V18L8 16V10L4 8Z"
                        fill="url(#neonGreen)"
                    />
                    <path
                        d="M6 18H14L16 14H8L6 18Z"
                        fill="url(#neonGreen)"
                    />
                    <path
                        d="M12 14H18L20 10H14L12 14Z"
                        fill="url(#neonGreen)"
                    />

                    {/* Overlay for "3D" Lighting/Depth */}
                    <path
                        d="M4 6H20L18 10H6L4 6Z"
                        fill="url(#depth)"
                        style={{ mixBlendMode: 'overlay' }}
                    />
                    <path
                        d="M4 8V18L8 16V10L4 8Z"
                        fill="url(#depth)"
                        style={{ mixBlendMode: 'overlay' }}
                    />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
