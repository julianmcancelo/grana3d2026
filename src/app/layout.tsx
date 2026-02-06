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
  title: {
    template: '%s | Grana3D',
    default: 'Grana3D - Soluciones de Impresión 3D y Diseño Industrial',
  },
  description: "Servicios de impresión 3D, prototipado rápido, diseño CAD y venta de insumos. Calidad industrial para tus proyectos.",
  keywords: ["impresión 3d", "pla", "petg", "diseño 3d", "argentina", "grana3d", "prototipado"],
  authors: [{ name: "Grana3D" }],
  creator: "Grana3D",
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://grana3d.com.ar',
    siteName: 'Grana3D',
    title: 'Grana3D - Soluciones de Impresión 3D',
    description: 'Transformamos tus ideas en objetos reales. Servicios de impresión 3D y diseño.',
    images: [
      {
        url: '/og-image.jpg', // Asegurate de tener esta imagen o cambiarla
        width: 1200,
        height: 630,
        alt: 'Grana3D Preview',
      },
    ],
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
