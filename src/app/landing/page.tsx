"use client"
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Package, Star, Truck, Zap, Box, Layers, Play } from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import { useRef } from 'react'

export default function Home() {
  const targetRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1])

  return (
    <>
      <Header />
      <CarritoDrawer />
      <ModalUsuario />
      
      {/* Hero Section - Inmersivo */}
      <section className="relative min-h-[90vh] flex items-center bg-[#0a0a0a] overflow-hidden">
        {/* Fondo abstracto animado (simulación de filamento/capas) */}
        <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-teal-500 rounded-full blur-[150px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 rounded-full blur-[150px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur text-teal-300 rounded-full px-4 py-1.5 mb-6 text-sm font-medium"
            >
              <Zap className="w-4 h-4" /> La revolución de la fabricación personal
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Imaginá.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500">
                Nosotros lo imprimimos.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-400 mb-8 max-w-lg leading-relaxed"
            >
              Desde prototipos funcionales hasta objetos de diseño únicos. 
              Transformamos tus archivos digitales en objetos tangibles con la mejor calidad del mercado.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/tienda" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-400 transition-all hover:scale-105 shadow-lg shadow-teal-500/20">
                Explorar Catálogo <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 backdrop-blur">
                <Play className="w-4 h-4 fill-current" /> Ver Proceso
              </button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative hidden lg:block"
          >
             {/* Imagen 3D flotante (placeholder visualmente impactante) */}
             <div className="relative w-full aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-purple-500/20 rounded-full animate-spin-slow" />
                <img 
                    src="https://images.unsplash.com/photo-1631541909061-71e349d1f203?q=80&w=1000&auto=format&fit=crop" 
                    alt="3D Printing Art" 
                    className="relative z-10 w-full h-full object-contain drop-shadow-2xl hover:-translate-y-4 transition-transform duration-500"
                />
             </div>
          </motion.div>
        </div>
      </section>

      {/* Marquee de Confianza (Marcas o Conceptos) */}
      <section className="bg-black border-y border-white/10 py-8 overflow-hidden">
        <div className="flex gap-12 items-center justify-center opacity-50 text-white text-sm font-bold uppercase tracking-widest animate-marquee">
            <span>Diseño Paramétrico</span> • <span>Prototipado Rápido</span> • <span>PLA Biodegradable</span> • <span>Alta Precisión</span> • <span>Envíos a todo el país</span> • <span>Diseño Paramétrico</span>
        </div>
      </section>

      {/* Features Grid - Estilo Bento Box */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">¿Por qué elegir Grana3D?</h2>
                <p className="text-gray-500">Más que una tienda, somos tu taller de fabricación digital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                {/* Feature 1: Calidad */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Resolución Increíble</h3>
                        <p className="text-gray-500 text-sm">Imprimimos con una altura de capa de hasta 0.1mm para detalles invisibles al ojo humano.</p>
                    </div>
                    <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80" alt="Detalle" className="absolute bottom-0 right-0 w-1/2 opacity-20 grayscale group-hover:grayscale-0 transition-all" />
                </motion.div>

                {/* Feature 2: Materiales (Wide) */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-black text-white p-8 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                    <img src="https://images.unsplash.com/photo-1615840287214-7ff58936c4cf?auto=format&fit=crop&q=80" alt="Filamentos" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="relative z-20 max-w-md">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Materiales Premium</h3>
                        <p className="text-gray-300 mb-6">Trabajamos con PLA, PETG, ABS y Flex. Colores vibrantes, mate, seda y marmolados. Tu pieza no solo sirve, también se ve increíble.</p>
                        <Link href="/tienda" className="inline-flex items-center text-teal-400 font-bold hover:text-teal-300">
                            Ver catálogo de materiales <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </motion.div>

                {/* Feature 3: Envío */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-purple-600 text-white p-8 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden relative group"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                            <Truck className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Envío Flash</h3>
                        <p className="text-purple-100 text-sm">Empaquetamos con protección extra para que llegue impecable a cualquier punto del país.</p>
                    </div>
                </motion.div>

                {/* Feature 4: Custom */}
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-8 overflow-hidden relative"
                >
                    <div className="flex-1 relative z-10">
                         <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                            <Star className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Tenés una idea loca?</h3>
                        <p className="text-gray-500 mb-6">Si no está en el catálogo, lo diseñamos para vos. Desde repuestos imposibles hasta regalos personalizados.</p>
                        <a href="https://wa.me/5491112345678" target="_blank" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors inline-block">
                            Cotizar Proyecto
                        </a>
                    </div>
                    <div className="flex-1 hidden md:block relative h-full">
                         <div className="absolute inset-0 bg-gradient-to-l from-white to-transparent z-10" />
                         <img src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&q=80" className="absolute right-0 top-0 h-full w-full object-cover rounded-l-2xl" />
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* CTA Final */}
      <section ref={targetRef} className="py-24 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-teal-500/20 blur-[120px]" />
        
        <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Listo para imprimir tu mundo?</h2>
            <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">Sumate a los cientos de clientes que ya materializaron sus ideas con Grana3D.</p>
            <Link href="/tienda" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-teal-500 text-white text-lg font-bold rounded-xl hover:bg-teal-400 transition-all hover:scale-105 shadow-2xl shadow-teal-500/30">
                Ver Tienda Online
            </Link>
        </motion.div>
      </section>
    </>
  )
}
