"use client"
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Text, Stars, PerspectiveCamera } from '@react-three/drei'
import { Instagram, MessageCircle, Cpu, Layers, Zap } from 'lucide-react'

// Objeto 3D Animado
function FloatingShape() {
    const meshRef = useRef<any>(null)
    
    useFrame((state) => {
        if (!meshRef.current) return
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
    })

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef} scale={1.8}>
                <icosahedronGeometry args={[1, 1]} /> {/* Forma geométrica compleja */}
                <MeshDistortMaterial 
                    color="#14b8a6" 
                    emissive="#0d9488"
                    emissiveIntensity={0.5}
                    wireframe 
                    distort={0.4} 
                    speed={2} 
                    roughness={0}
                />
            </mesh>
            {/* Núcleo brillante */}
            <mesh scale={1}>
                <icosahedronGeometry args={[0.8, 0]} />
                <meshBasicMaterial color="#2dd4bf" transparent opacity={0.1} />
            </mesh>
        </Float>
    )
}

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#2dd4bf" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
            <FloatingShape />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    )
}

export default function MantenimientoEpicardo({ texto }: { texto: string }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className="relative min-h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-center text-white selection:bg-teal-500 selection:text-black font-sans">
            
            {/* 3D Background Layer */}
            <div className="absolute inset-0 z-0 opacity-60">
                {mounted && (
                    <Canvas>
                        <Scene />
                    </Canvas>
                )}
            </div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] z-0 pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
                
                {/* Status Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold tracking-[0.2em] uppercase mb-8 backdrop-blur-md"
                >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                    System Upgrade In Progress
                </motion.div>

                {/* Main Title with Glitch Effect Vibe */}
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none"
                >
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 filter drop-shadow-2xl">
                        FUTURE
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 animate-gradient-x">
                        LOADING
                    </span>
                </motion.h1>

                {/* Description */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                >
                    {texto || "Estamos calibrando las impresoras para la próxima generación de productos. Preparate para algo sólido."}
                </motion.p>

                {/* Stats / Features Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16"
                >
                    {[
                        { icon: Layers, label: "Nueva Colección", sub: "Diseños Exclusivos" },
                        { icon: Cpu, label: "Tecnología", sub: "Precisión Industrial" },
                        { icon: Zap, label: "Ofertas Flash", sub: "Próximamente" }
                    ].map((item, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm p-6 rounded-2xl flex flex-col items-center hover:bg-white/10 transition-colors group">
                            <item.icon className="w-8 h-8 text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
                            <div className="font-bold text-white uppercase tracking-wider text-sm">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                    ))}
                </motion.div>

                {/* CTAs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-5 justify-center items-center"
                >
                    <a 
                        href="https://wa.me/5491112345678" 
                        target="_blank"
                        className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-black tracking-wide rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] flex items-center gap-3 w-full sm:w-auto justify-center overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <MessageCircle className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">AVISAME CUANDO VUELVAN</span>
                    </a>
                    
                    <a 
                        href="https://instagram.com/grana3d" 
                        target="_blank"
                        className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold tracking-wide rounded-xl transition-all hover:scale-105 flex items-center gap-3 w-full sm:w-auto justify-center"
                    >
                        <Instagram className="w-5 h-5" />
                        <span>Seguinos en Instagram</span>
                    </a>
                </motion.div>

                {/* Footer Progress Bar Aesthetic */}
                <div className="fixed bottom-0 left-0 w-full h-1 bg-gray-900">
                    <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500"
                    />
                </div>
            </div>
        </div>
    )
}
