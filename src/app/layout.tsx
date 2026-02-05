import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/context/CarritoContext";
import { UsuarioProvider } from "@/context/UsuarioContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ModalUsuario from "@/components/ModalUsuario";
import CuponListener from "@/components/CuponListener";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Grana3D - Productos Impresos en 3D",
  description: "Tienda de productos impresos en 3D de alta calidad",
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
            </CarritoProvider>
          </UsuarioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
