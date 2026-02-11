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
                    background: '#111',
                    borderRadius: 36,
                }}
            >
                <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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

                    {/* Inner depth shadows */}
                    <path d="M10 8 L12 9 L12 14 L10 13 Z" fill="#005C22" />
                </svg>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
