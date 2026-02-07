import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Grana3D - Impresión 3D Profesional';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

// Image generation
export default function Image() {
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
                    // Deep, professional background with slight vignette
                    background: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%)',
                    flexDirection: 'column',
                    color: 'white',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 40,
                    }}
                >
                    {/* Logo Container - 3D Render Style */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 250,
                            height: 250,
                            marginRight: 60,
                            // Glassmorphism / Depth effect container
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: 30,
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        }}
                    >
                        <svg
                            width="160"
                            height="160"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                filter: 'drop-shadow(0px 0px 30px rgba(0, 255, 66, 0.3))', // Ambient Glow
                            }}
                        >
                            <defs>
                                <linearGradient id="neonGreenOG" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#4AFF80" />
                                    <stop offset="50%" stopColor="#00AE42" />
                                    <stop offset="100%" stopColor="#006624" />
                                </linearGradient>
                                <linearGradient id="shine" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                                    <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                                </linearGradient>
                            </defs>

                            <path d="M4 6H20L18 10H6L4 6Z" fill="url(#neonGreenOG)" />
                            <path d="M4 8V18L8 16V10L4 8Z" fill="url(#neonGreenOG)" />
                            <path d="M6 18H14L16 14H8L6 18Z" fill="url(#neonGreenOG)" />
                            <path d="M12 14H18L20 10H14L12 14Z" fill="url(#neonGreenOG)" />

                            {/* Specular Highlight */}
                            <path d="M4 6H20L18 10H6L4 6Z" fill="white" fillOpacity="0.2" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontSize: 120,
                            fontWeight: 900,
                            fontFamily: 'sans-serif',
                            letterSpacing: '-0.05em',
                            background: 'linear-gradient(to bottom, #ffffff, #aaaaaa)',
                            backgroundClip: 'text',
                            color: 'transparent',
                        }}>
                            Grana<span style={{ color: '#00AE42', textShadow: '0 0 20px rgba(0,174,66,0.5)' }}>3D</span>
                        </div>
                        <div style={{ fontSize: 48, fontWeight: 400, fontFamily: 'sans-serif', color: '#888', marginTop: 10 }}>
                            Impresión 3D Profesional
                        </div>
                    </div>
                </div>

                {/* Footer strip with gradient */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 8,
                    background: 'linear-gradient(90deg, #00AE42 0%, #004d1d 100%)',
                }} />
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
