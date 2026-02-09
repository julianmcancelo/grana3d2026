import { prisma } from '@/lib/prisma'
import {
   Truck, CreditCard, Shield, Headphones, MessageCircle, ArrowRight
} from 'lucide-react'
import Header from '@/components/Header'
import CarritoDrawer from '@/components/CarritoDrawer'
import ModalUsuario from '@/components/ModalUsuario'
import Link from 'next/link'
import MantenimientoEpicardo from '@/components/MantenimientoEpicardo'

// Components
import SeccionBannersCategoria from '@/components/secciones/SeccionBannersCategoria'
import SeccionProductosDestacados from '@/components/secciones/SeccionProductosDestacados'
import SeccionResenas from '@/components/secciones/SeccionResenas'
import BannerPromo from '@/components/secciones/BannerPromo'
import Newsletter from '@/components/secciones/Newsletter'
import CategoriasRapidas from '@/components/secciones/CategoriasRapidas'
import HeroCarousel from '@/components/secciones/HeroCarousel'
import ProductosCarousel from '@/components/secciones/ProductosCarousel'
// import { TipoSeccion } from '@prisma/client'

// Fallback local: Para evitar error de build si el cliente prisma no está generado
const TipoSeccion = {
   HERO_CAROUSEL: 'HERO_CAROUSEL',
   BANNERS_CATEGORIA: 'BANNERS_CATEGORIA',
   PRODUCTOS_DESTACADOS: 'PRODUCTOS_DESTACADOS',
   PRODUCTOS_OFERTA: 'PRODUCTOS_OFERTA',
   BANNER_PROMO: 'BANNER_PROMO',
   CATEGORIAS_RAPIDAS: 'CATEGORIAS_RAPIDAS',
   RESENAS: 'RESENAS',
   NEWSLETTER: 'NEWSLETTER',
} as const

// Forzar renderizado dinámico para que el modo mantenimiento se detecte al instante
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Tipos
type DataHome = {
   secciones: any[]
   categorias: any[]
   destacados: any[]
   todos: any[]
   resenas: any[]
   banners: any[]
   heroBanners: any[]
   config: { modoProximamente: boolean, textoProximamente: string }
}

// Data fetching function (Server Side)
async function getData(): Promise<DataHome> {
   const [
      secciones,
      categorias,
      destacados,
      todos,
      resenas,
      banners,
      heroBanners,
      configRaw
   ] = await Promise.all([
      prisma.seccionHomepage.findMany({ orderBy: { orden: 'asc' }, where: { activa: true } }),
      prisma.categoria.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
      prisma.producto.findMany({ where: { activo: true, destacado: true }, take: 4, include: { categoria: true } }),
      prisma.producto.findMany({ where: { activo: true }, take: 8, include: { categoria: true } }),
      prisma.resena.findMany({ where: { activa: true }, orderBy: { orden: 'asc' } }),
      prisma.promoBanner.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
      prisma.banner.findMany({ where: { activo: true }, orderBy: { orden: 'asc' } }),
      prisma.configuracion.findMany()
   ])

   // Parse config
   const configMap = configRaw.reduce((acc: any, curr: any) => {
      acc[curr.clave] = curr.valor
      return acc
   }, {})

   return {
      secciones,
      categorias,
      destacados,
      todos,
      resenas,
      banners,
      heroBanners,
      config: {
         modoProximamente: configMap['modoProximamente'] === 'true',
         textoProximamente: configMap['textoProximamente'] || '¡Próximamente!'
      }
   }
}

const caracteristicas = [
   { icono: Truck, titulo: "Envío a Todo el País", desc: "Entrega rápida y segura" },
   { icono: CreditCard, titulo: "12 Cuotas Sin Interés", desc: "Todos los medios de pago" },
   { icono: Shield, titulo: "Compra Protegida", desc: "Garantía de satisfacción" },
   { icono: Headphones, titulo: "Soporte Experto", desc: "Asesoramiento técnico" },
]

const marqueeItems = [
   "IMPRESIÓN 3D", "PROTOTIPADO", "DISEÑO", "PLA", "PETG", "FLEX",
   "RESINA", "ARGENTINA", "ENVÍOS", "CALIDAD", "FDM", "SLA"
]

function MarqueeBanner() {
   return (
      <div className="bg-[#00AE42] py-2 overflow-hidden">
         <div className="flex animate-marquee whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
               <span key={i} className="mx-6 text-xs font-black text-white flex items-center gap-6 tracking-widest">
                  {item}
                  <span className="opacity-50">•</span>
               </span>
            ))}
         </div>
      </div>
   )
}

function FeatureBar() {
   return (
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
               {caracteristicas.map((c, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-8 px-4 text-center sm:text-left hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors group">
                     <div className="w-10 h-10 rounded-lg bg-[#00AE42]/10 flex items-center justify-center shrink-0 text-[#00AE42] group-hover:scale-110 transition-transform">
                        <c.icono className="w-5 h-5" />
                     </div>
                     <div>
                        <div className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wide mb-1">{c.titulo}</div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">{c.desc}</div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

// Server Component
export default async function HomePage() {
   const data = await getData()

   if (data.config.modoProximamente) {
      return <MantenimientoEpicardo texto={data.config.textoProximamente} />
   }

   return (
      <div className="bg-transparent min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#00AE42] selection:text-white">
         <Header />
         <CarritoDrawer />
         <ModalUsuario />
         <MarqueeBanner />

         <main>
            {data.secciones.map((seccion) => {
               switch (seccion.tipo) {
                  case TipoSeccion.HERO_CAROUSEL:
                     return (
                        <div key={seccion.id}>
                           {data.heroBanners.length > 0 && <HeroCarousel banners={data.heroBanners} />}
                           <FeatureBar />
                        </div>
                     )
                  case TipoSeccion.CATEGORIAS_RAPIDAS:
                     return <CategoriasRapidas
                        key={seccion.id}
                        categorias={data.categorias}
                        titulo={seccion.titulo || 'Categorías'}
                     />
                  case TipoSeccion.BANNERS_CATEGORIA:
                     return <SeccionBannersCategoria
                        key={seccion.id}
                        categorias={data.categorias}
                        titulo={seccion.titulo || ''}
                        subtitulo={seccion.subtitulo || ''}
                     />
                  case TipoSeccion.PRODUCTOS_DESTACADOS:
                     return <SeccionProductosDestacados
                        key={seccion.id}
                        productos={data.destacados}
                        titulo={seccion.titulo || 'Lo más vendido'}
                        subtitulo={seccion.subtitulo || ''}
                     />
                  case TipoSeccion.PRODUCTOS_OFERTA:
                     return <ProductosCarousel
                        key={seccion.id}
                        productos={data.todos}
                        titulo={seccion.titulo || 'Ofertas Imperdibles'}
                        subtitulo={seccion.subtitulo || 'Aprovechá los descuentos'}
                     />
                  case TipoSeccion.BANNER_PROMO:
                     return <BannerPromo key={seccion.id} banners={data.banners} />
                  case TipoSeccion.RESENAS:
                     return <SeccionResenas key={seccion.id} resenas={data.resenas} titulo={seccion.titulo || ''} subtitulo={seccion.subtitulo || ''} />
                  case TipoSeccion.NEWSLETTER:
                     return <Newsletter key={seccion.id} titulo={seccion.titulo || ''} subtitulo={seccion.subtitulo || ''} />
                  default:
                     return null
               }
            })}

            {/* Catalog Fallback */}
            <section id="productos" className="py-24 bg-white dark:bg-[#111]">
               <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center justify-between mb-12 border-b border-gray-200 dark:border-gray-800 pb-4">
                     <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Catálogo Completo</h2>
                     <Link href="/tienda" className="text-sm font-bold text-[#00AE42] hover:underline flex items-center gap-1">
                        Ver todo <ArrowRight className="w-4 h-4" />
                     </Link>
                  </div>
                  <SeccionProductosDestacados productos={data.todos} titulo="" subtitulo="" />

                  {data.todos.length > 0 && (
                     <div className="mt-16 text-center">
                        <Link href="/tienda" className="px-8 py-4 bg-[#00AE42] text-white rounded-lg font-bold hover:bg-[#008a34] transition-all shadow-lg hover:shadow-[#00AE42]/20">
                           Explorar Tienda
                        </Link>
                     </div>
                  )}
               </div>
            </section>

            {/* Contact Section - Bambu Style */}
            <section id="contacto" className="py-24 bg-[#111] border-t border-gray-800 relative overflow-hidden">
               {/* Decorative Gradient */}
               <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#00AE42]/10 to-transparent pointer-events-none" />

               <div className="max-w-5xl mx-auto px-4 relative z-10">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="flex-1 text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                           ¿Tenés una idea? <br />
                           <span className="text-[#00AE42]">La imprimimos.</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-xl font-light">
                           Diseño CAD, ingeniería inversa y producción en serie. Contanos tu proyecto y lo materializamos.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                           <a href="https://wa.me/5491112345678" target="_blank" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#00AE42] text-white font-bold rounded-lg hover:bg-[#008a34] transition-all shadow-lg">
                              <MessageCircle className="w-5 h-5" /> Cotizar Proyecto
                           </a>
                           <Link href="/contacto" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all border border-white/10">
                              Ver Servicios
                           </Link>
                        </div>
                     </div>

                     {/* Abstract 3D Cube Icon */}
                     <div className="w-64 h-64 bg-gradient-to-br from-gray-800 to-black rounded-3xl border border-gray-700 shadow-2xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-all duration-500 group">
                        <div className="text-[#00AE42] group-hover:scale-110 transition-transform duration-500">
                           <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                              <line x1="12" y1="22.08" x2="12" y2="12"></line>
                           </svg>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
         </main>

         <footer className="bg-black border-t border-gray-800 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                  <div>
                     <div className="flex items-center gap-2 mb-6 text-white font-black text-2xl tracking-tight">
                        <div className="w-8 h-8 bg-[#00AE42] rounded flex items-center justify-center text-black text-sm">G</div>
                        Grana3D
                     </div>
                     <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs">
                        Líderes en manufactura aditiva. Calidad industrial para makers y empresas.
                     </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Navegación</h4>
                     <ul className="space-y-3 text-gray-500 text-sm">
                        <li><Link href="/" className="hover:text-[#00AE42] transition-colors">Inicio</Link></li>
                        <li><Link href="/tienda" className="hover:text-[#00AE42] transition-colors">Tienda</Link></li>
                        <li><Link href="/contacto" className="hover:text-[#00AE42] transition-colors">Servicios</Link></li>
                        <li><Link href="/faq" className="hover:text-[#00AE42] transition-colors">Preguntas Frecuentes</Link></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Legal</h4>
                     <ul className="space-y-3 text-gray-500 text-sm">
                        <li><Link href="/terminos" className="hover:text-[#00AE42] transition-colors">Términos y Condiciones</Link></li>
                        <li><Link href="/privacidad" className="hover:text-[#00AE42] transition-colors">Política de Privacidad</Link></li>
                        <li><Link href="/envios" className="hover:text-[#00AE42] transition-colors">Política de Envíos</Link></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-wider">Contacto</h4>
                     <ul className="space-y-4 text-gray-500 text-sm">
                        <li className="flex items-center gap-3">
                           <span className="w-2 h-2 rounded-full bg-[#00AE42]"></span>
                           <span>Buenos Aires, Argentina</span>
                        </li>
                        <li className="flex items-center gap-3">
                           <span className="w-2 h-2 rounded-full bg-[#00AE42]"></span>
                           <span>hola@grana3d.com.ar</span>
                        </li>
                     </ul>
                  </div>
               </div>
               <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                  <div>
                     © 2026 Grana3D. Engineering & Manufacturing.
                  </div>
                  <div className="flex gap-4">
                     <span className="hover:text-gray-400 cursor-pointer">Instagram</span>
                     <span className="hover:text-gray-400 cursor-pointer">Twitter</span>
                     <span className="hover:text-gray-400 cursor-pointer">LinkedIn</span>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   )
}
