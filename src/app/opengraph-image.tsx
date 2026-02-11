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
                    background: 'linear-gradient(to bottom right, #1a1a1a, #000000)',
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
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 200,
                            height: 200,
                            marginRight: 60,
                        }}
                    >
                        <svg
                            width="200"
                            height="200"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{
                                filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.5))',
                            }}
                        >
                            {/* Top Faces (Brightest) */}
                            <path d="M17 6.5 L12 4 L7 6.5 L7 8.5 L12 6 L17 8.5 Z" fill="#2EFF63" />
                            <path d="M12 11 L14 12 L14 15 L12 14 Z" fill="#2EFF63" />

                            {/* Side Faces (Mid Tone) */}
                            <path d="M7 6.5 L7 17.5 L10 19 L10 8 L7 6.5 Z" fill="#00C94D" />
                            <path d="M14 12 L17 10.5 L17 13.5 L14 15 Z" fill="#00C94D" />

                            {/* Front/Dark Faces (Shadow) */}
                            <path d="M7 17.5 L12 20 L17 17.5 L17 15.5 L12 18 L7 15.5 Z" fill="#008F35" />
                            <path d="M17 17.5 L17 13.5 L14 15 L14 19 L17 17.5 Z" fill="#007029" />

                            {/* Inner depth */}
                            <path d="M10 8 L12 9 L12 14 L10 13 Z" fill="#005C22" />
                        </svg>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{
                            fontSize: 120,
                            fontWeight: 900,
                            fontFamily: 'sans-serif',
                            letterSpacing: '-0.05em',
                            color: 'white',
                        }}>
                            Grana<span style={{ color: '#00AE42' }}>3D</span>
                        </div>
                        <div style={{ fontSize: 40, fontWeight: 400, fontFamily: 'sans-serif', color: '#888', marginTop: 10 }}>
                            Impresión 3D Profesional
                        </div>
                    </div>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
