import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";
import { UsuarioProvider } from "@/context/UsuarioContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ModalUsuario from "@/components/ModalUsuario";
import CuponListener from "@/components/CuponListener";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://grana3d.com.ar'),
  title: {
    template: '%s | Grana3D',
    default: 'Grana3D - Impresión 3D, Insumos y Diseño Industrial',
  },
  description: "Tu tienda experta en impresión 3D en Argentina. Venta de impresoras, filamentos, repuestos y servicios de diseño y prototipado. Envíos a todo el país.",
  keywords: ["impresión 3d argentina", "filamento pla", "bambu lab", "creality", "diseño industrial", "prototipado rápido", "servicio impresión 3d", "grana3d"],
  authors: [{ name: "Grana3D" }],
  creator: "Grana3D",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://grana3d.com.ar',
    siteName: 'Grana3D',
    title: 'Grana3D - Todo para tu Impresión 3D',
    description: 'Encontrá las mejores impresoras, insumos y servicios de diseño en un solo lugar. Calidad garantizada.',
    images: [
      {
        url: '/og-image.jpg', // TODO: Crear imagen 1200x630 en public/
        width: 1200,
        height: 630,
        alt: 'Grana3D Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grana3D - Impresión 3D Profesional',
    description: 'Llevá tus ideas a la realidad con Grana3D.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // TODO: Crear 180x180
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[#FAFAFA] dark:bg-[#050505] transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UsuarioProvider>
            <div className="fixed inset-0 z-[-1] bg-grid-pattern opacity-[0.4] pointer-events-none" />
            <ModalUsuario />
            <CarritoProvider>
              <CuponListener />
              {children}
              <WhatsAppButton />
            </CarritoProvider>
          </UsuarioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
