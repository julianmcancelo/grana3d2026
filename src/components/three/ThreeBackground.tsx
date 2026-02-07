"use client"
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useTheme } from 'next-themes'

function AnimatedSphere() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    return (
        <Sphere visible args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
                color={isDark ? "#14B8A6" : "#0D9488"}
                attach="material"
                distort={0.5}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    )
}

export default function ThreeBackground() {
    return (
        <Canvas className="w-full h-full">
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            <AnimatedSphere />
        </Canvas>
    )
}
