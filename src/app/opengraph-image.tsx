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
                    fontSize: 128,
                    background: 'black',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                            background: '#00AE42', // Bambu Green
                            borderRadius: 20,
                            color: 'black',
                            fontSize: 140,
                            fontWeight: 900,
                            marginRight: 40,
                            fontFamily: 'sans-serif',
                        }}
                    >
                        G
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 100, fontWeight: 900, fontFamily: 'sans-serif', letterSpacing: '-0.05em' }}>
                            Grana<span style={{ color: '#00AE42' }}>3D</span>
                        </div>
                        <div style={{ fontSize: 40, fontWeight: 400, fontFamily: 'sans-serif', opacity: 0.8, marginTop: 10 }}>
                            Impresión 3D Profesional
                        </div>
                    </div>
                </div>

                {/* Footer strip */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 12,
                    background: '#00AE42',
                }} />
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
