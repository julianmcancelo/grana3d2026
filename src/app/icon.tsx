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
                    background: '#050505', // Deep Black
                    borderRadius: 6,
                }}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* ISOMETRIC G DESIGN */}

                    {/* Top Face (Lightest Green) */}
                    <path d="M12 4L18 7V9L12 6L6 9V7L12 4Z" fill="#00FF41" />
                    <path d="M12 12L18 15V17L12 14L6 17V15L12 12Z" fill="#00FF41" />
                    {/* Note: complex shape to form G */}

                    {/* Simplified Isometric G Block */}
                    {/* Top part */}
                    <path d="M17 6.5 L12 4 L7 6.5 L7 8.5 L12 6 L17 8.5 Z" fill="#4BFF75" /> {/* Top/Light */}

                    {/* Left Vertical Side (Medium) */}
                    <path d="M7 6.5 L7 17.5 L10 19 L10 8 L7 6.5 Z" fill="#00AE42" /> {/* Side/Mid */}

                    {/* Bottom Side */}
                    <path d="M7 17.5 L12 20 L17 17.5 L17 15.5 L12 18 L7 15.5 Z" fill="#008F35" /> {/* Bottom/Dark */}

                    {/* Right Vertical (Bottom part of G) */}
                    <path d="M17 17.5 L17 13.5 L14 15 L14 19 L17 17.5 Z" fill="#007A2D" />

                    {/* Crossbar of G */}
                    <path d="M14 12 L17 10.5 L17 13.5 L14 15 Z" fill="#00AE42" />
                    <path d="M12 11 L14 12 L14 15 L12 14 Z" fill="#4BFF75" /> {/* Inner Top */}

                    {/* Inner vertical */}
                    <path d="M12 11 L15 12.5 L15 14.5 L12 13 Z" fill="transparent" />

                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
