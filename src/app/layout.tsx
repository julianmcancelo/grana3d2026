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
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-black transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UsuarioProvider>
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
