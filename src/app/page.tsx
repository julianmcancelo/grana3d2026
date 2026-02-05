import { prisma } from '@/lib/prisma'
import {
   Truck, CreditCard, Shield, Headphones, MessageCircle
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
import { TipoSeccion } from '@prisma/client'

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
   const configMap = configRaw.reduce((acc: any, curr) => {
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
      <div className="bg-teal-500 py-2.5 overflow-hidden">
         <div className="flex animate-marquee whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
               <span key={i} className="mx-4 text-sm font-bold text-black/80 flex items-center gap-4">
                  {item}
                  <span className="text-black/40">•</span>
               </span>
            ))}
         </div>
      </div>
   )
}

function FeatureBar() {
   return (
      <section className="border-y border-gray-200 dark:border-white/10 bg-white dark:bg-white/5">
         <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200 dark:divide-white/10">
               {caracteristicas.map((c, i) => (
                  <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 py-8 px-4 text-center sm:text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                     <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-500">
                        <c.icono className="w-6 h-6" />
                     </div>
                     <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-1">{c.titulo}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{c.desc}</div>
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
      <div className="bg-gray-50 dark:bg-black min-h-screen text-gray-900 dark:text-white font-sans selection:bg-teal-500 selection:text-white">
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

            {/* Always show All Products at the bottom as catalog fallback if not configured via sections */}
            <section id="productos" className="py-20">
               <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center justify-between mb-10">
                     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Catálogo Completo</h2>
                  </div>
                  <SeccionProductosDestacados productos={data.todos} titulo="Todos los productos" subtitulo="Explora" />

                  {data.todos.length > 0 && (
                     <div className="mt-16 text-center">
                        <Link href="/tienda" className="px-8 py-4 border border-gray-200 dark:border-white/10 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 text-gray-900 dark:text-white font-bold transition-all">
                           Ver toda la tienda
                        </Link>
                     </div>
                  )}
               </div>
            </section>

            {/* Contact Section */}
            <section id="contacto" className="py-20 border-t border-gray-200 dark:border-white/10 bg-gray-900 dark:bg-gradient-to-b dark:from-black dark:to-gray-900">
               <div className="max-w-5xl mx-auto px-4">
                  <div className="relative rounded-3xl overflow-hidden bg-teal-600 p-10 md:p-16 text-center shadow-2xl">
                     <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                     <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">¿Tenés una idea loca?</h2>
                        <p className="text-teal-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                           No te limites al catálogo. Diseñamos piezas a medida, repuestos inconseguibles y prototipos funcionales.
                        </p>
                        <a href="https://wa.me/5491112345678" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                           <MessageCircle className="w-5 h-5" /> Hablar con un Humano
                        </a>
                     </div>
                  </div>
               </div>
            </section>
         </main>

         <footer className="border-t border-white/10 bg-black pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                  <div>
                     <div className="flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black">G</div>
                        <span className="text-xl font-bold text-white">Grana3D</span>
                     </div>
                     <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                        Ingeniería aplicada a la impresión 3D. Calidad, resistencia y diseño en cada capa.
                     </p>
                  </div>
                  <div>
                     <h4 className="font-bold text-white mb-6">Navegación</h4>
                     <ul className="space-y-4 text-gray-500 text-sm">
                        <li><Link href="/" className="hover:text-teal-500 transition-colors">Inicio</Link></li>
                        <li><Link href="/tienda" className="hover:text-teal-500 transition-colors">Tienda</Link></li>
                        <li><Link href="/contacto" className="hover:text-teal-500 transition-colors">Presupuestos</Link></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-bold text-white mb-6">Contacto</h4>
                     <ul className="space-y-4 text-gray-500 text-sm">
                        <li className="flex items-center gap-3">
                           <span>hola@grana3d.com.ar</span>
                        </li>
                     </ul>
                  </div>
               </div>
               <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
                  <div>
                     © 2026 Grana3D. Todos los derechos reservados.
                  </div>
               </div>
            </div>
         </footer>
      </div>
   )
}
