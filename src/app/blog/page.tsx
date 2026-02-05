"use client"
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Instagram, MessageCircle, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useTheme } from 'next-themes'
import api from '@/lib/api'

import Novedades from '@/components/Novedades'
import Logo from '@/components/Logo'
import HeroCarousel from '@/components/secciones/HeroCarousel'
import ProductosCarousel from '@/components/secciones/ProductosCarousel'
import CategoriasRapidas from '@/components/secciones/CategoriasRapidas'
import SeccionResenas from '@/components/secciones/SeccionResenas'
import Newsletter from '@/components/secciones/Newsletter'
import BannerPromo from '@/components/secciones/BannerPromo'

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

interface Seccion {
   id: string
   tipo: string
   titulo?: string
   subtitulo?: string
   activa: boolean
   datos?: any
   config?: any
}

export default function LandingPage() {
   const [secciones, setSecciones] = useState<Seccion[]>([])
   const [modoProximamente, setModoProximamente] = useState(false)
   const [textoProximamente, setTextoProximamente] = useState('')
   const [loading, setLoading] = useState(true)
   const [config, setConfig] = useState({ whatsapp: '5491112345678', instagram: 'grana3d' })

   useEffect(() => {
      const cargarDatos = async () => {
         try {
            // Cargar configuración
            const { data: configData } = await api.get('/config')
            if (configData.modoProximamente) {
               setModoProximamente(true)
               setTextoProximamente(configData.textoProximamente || '¡Estamos preparando algo increíble!')
            }
            if (configData.whatsapp || configData.instagram) {
               setConfig({
                  whatsapp: configData.whatsapp?.replace(/\D/g, '') || '5491112345678',
                  instagram: configData.instagram?.replace('@', '') || 'grana3d'
               })
            }

            // Cargar secciones del homepage
            const { data: seccionesData } = await api.get('/homepage')
            setSecciones(seccionesData)
         } catch (e) { console.error(e) }
         finally { setLoading(false) }
      }
      cargarDatos()
   }, [])

   // Modo Próximamente
   if (modoProximamente && !loading) {
      return (
         <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
               <Canvas>
                  <ambientLight intensity={0.5} />
                  <directionalLight position={[10, 10, 5]} intensity={1} />
                  <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                  <AnimatedSphere />
               </Canvas>
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center max-w-3xl"
               >
                  <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-teal-500/20">
                     <Sparkles className="w-12 h-12 text-teal-500" />
                  </div>
                  <Logo className="w-16 h-16 mx-auto mb-8" showText={false} />
                  <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
                     ¡MUY PRONTO!
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                     {textoProximamente}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                     <a
                        href={`https://wa.me/${config.whatsapp}`}
                        target="_blank"
                        className="group relative px-8 py-4 bg-teal-500 text-white dark:text-black font-bold text-lg rounded-full overflow-hidden shadow-lg shadow-teal-500/30"
                     >
                        <span className="relative z-10 flex items-center gap-2 justify-center">
                           <MessageCircle className="w-5 h-5" /> Consultanos
                        </span>
                     </a>
                     <a
                        href={`https://instagram.com/${config.instagram}`}
                        target="_blank"
                        className="px-8 py-4 bg-white/50 dark:bg-white/10 border border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white rounded-full font-bold text-lg transition-colors flex items-center gap-2 justify-center backdrop-blur-sm"
                     >
                        <Instagram className="w-5 h-5" /> Seguinos
                     </a>
                  </div>
               </motion.div>
            </div>
         </div>
      )
   }

   // Loading state
   if (loading) {
      return (
         <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
         </div>
      )
   }

   // Función para renderizar cada sección según su tipo
   const renderSeccion = (seccion: Seccion) => {
      switch (seccion.tipo) {
         case 'HERO_CAROUSEL':
            return seccion.datos?.length > 0 ? (
               <HeroCarousel key={seccion.id} banners={seccion.datos} />
            ) : (
               // Hero por defecto si no hay banners
               <HeroDefault key={seccion.id} />
            )

         case 'PRODUCTOS_DESTACADOS':
            return seccion.datos?.length > 0 ? (
               <ProductosCarousel
                  key={seccion.id}
                  productos={seccion.datos}
                  titulo={seccion.titulo || 'Productos Destacados'}
                  subtitulo={seccion.subtitulo}
               />
            ) : null

         case 'PRODUCTOS_OFERTA':
            return seccion.datos?.length > 0 ? (
               <ProductosCarousel
                  key={seccion.id}
                  productos={seccion.datos}
                  titulo={seccion.titulo || 'Ofertas Imperdibles'}
                  subtitulo={seccion.subtitulo}
               />
            ) : null

         case 'CATEGORIAS_RAPIDAS':
            return seccion.datos?.length > 0 ? (
               <CategoriasRapidas
                  key={seccion.id}
                  categorias={seccion.datos}
                  titulo={seccion.titulo}
               />
            ) : null

         case 'RESENAS':
            return seccion.datos?.length > 0 ? (
               <SeccionResenas
                  key={seccion.id}
                  resenas={seccion.datos}
                  titulo={seccion.titulo}
                  subtitulo={seccion.subtitulo}
               />
            ) : null

         case 'NEWSLETTER':
            return (
               <Newsletter
                  key={seccion.id}
                  titulo={seccion.titulo}
                  subtitulo={seccion.subtitulo}
               />
            )

         case 'BANNER_PROMO':
            return (
               <BannerPromo
                  key={seccion.id}
                  titulo={seccion.titulo}
                  subtitulo={seccion.subtitulo}
                  {...(seccion.config || {})}
               />
            )

         default:
            return null
      }
   }

   return (
      <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white overflow-x-hidden font-sans selection:bg-teal-500 selection:text-white">

         {/* Navbar */}
         <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-md bg-white/50 dark:bg-black/20 border-b border-transparent dark:border-white/5 transition-all">
            <Logo className="w-10 h-10 text-gray-900 dark:text-white" showText={false} />
            <Link href="/tienda" className="px-6 py-2 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 backdrop-blur rounded-full text-sm font-bold transition-all border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none text-gray-900 dark:text-white">
               Entrar a la Tienda
            </Link>
         </nav>

         {/* Renderizar secciones dinámicamente */}
         {secciones.length > 0 ? (
            secciones.map(renderSeccion)
         ) : (
            // Fallback: Hero por defecto si no hay secciones configuradas
            <HeroDefault />
         )}

         {/* Marquee */}
         <div className="bg-teal-500 text-white dark:text-black py-4 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block text-xl font-bold uppercase tracking-widest">
               • IMPRESIÓN 3D • PROTOTIPADO • DISEÑO • PLA • PETG • FLEX • RESINA • ARGENTINA • ENVÍOS • CALIDAD •
               • IMPRESIÓN 3D • PROTOTIPADO • DISEÑO • PLA • PETG • FLEX • RESINA • ARGENTINA • ENVÍOS • CALIDAD •
            </div>
         </div>

         {/* Novedades (siempre visible) */}
         <Novedades />

         {/* Footer */}
         <footer className="border-t border-gray-200 dark:border-gray-900 py-12 px-4 bg-gray-50 dark:bg-black">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
               <Logo className="w-8 h-8 text-gray-900 dark:text-white" showText={false} />
               <div className="flex gap-8 text-sm text-gray-500 font-medium">
                  <Link href="/tienda" className="hover:text-teal-600 dark:hover:text-white transition-colors">TIENDA</Link>
                  <a href={`https://instagram.com/${config.instagram}`} target="_blank" className="hover:text-teal-600 dark:hover:text-white transition-colors">INSTAGRAM</a>
                  <a href={`https://wa.me/${config.whatsapp}`} target="_blank" className="hover:text-teal-600 dark:hover:text-white transition-colors">CONTACTO</a>
               </div>
               <div className="text-gray-500 text-sm">
                  © 2026 Grana3D. Bs As, Argentina.
               </div>
            </div>
         </footer>
      </div>
   )
}

// Hero por defecto cuando no hay banners configurados
function HeroDefault() {
   return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
         <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <Canvas>
               <ambientLight intensity={0.5} />
               <directionalLight position={[10, 10, 5]} intensity={1} />
               <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
               <AnimatedSphere />
            </Canvas>
         </div>

         <div className="relative z-10 text-center px-4 max-w-5xl">
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
            >
               <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500">
                  MATERIALIZÁ<br />TUS IDEAS
               </h1>
            </motion.div>

            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 font-light"
            >
               Servicio de impresión 3D de alta fidelidad. Diseño paramétrico, materiales técnicos y acabados premium.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.6, type: "spring" }}
               className="flex flex-col sm:flex-row gap-4 justify-center"
            >
               <Link href="/tienda" className="group relative px-8 py-4 bg-teal-500 text-white dark:text-black font-bold text-lg rounded-full overflow-hidden shadow-lg shadow-teal-500/30 dark:shadow-none">
                  <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                     Ver Catálogo <ArrowRight className="w-5 h-5" />
                  </span>
                  <div className="absolute inset-0 bg-teal-400 dark:bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
               </Link>
               <a href="https://wa.me/5491112345678" target="_blank" className="px-8 py-4 bg-transparent border border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white rounded-full font-bold text-lg transition-colors text-gray-900 dark:text-white">
                  Pedir Cotización
               </a>
            </motion.div>
         </div>

         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 dark:text-gray-600">
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2">
               <div className="w-1 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-scroll" />
            </div>
         </div>
      </section>
   )
}
