"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Zap, Printer } from "lucide-react";

export default function EpicMaintenancePage() {
  const [progress, setProgress] = useState(0);

  // Simulación de carga de impresión
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0; // Loop
        }
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden flex flex-col items-center justify-center text-white font-sans selection:bg-[#00AE42] selection:text-white">

      {/* FONDO DINÁMICO GRID */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,174,66,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,174,66,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
        <motion.div
          animate={{ y: [0, 40] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(rgba(0,174,66,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col items-center max-w-4xl px-4 w-full">

        {/* ICONO FLOTANTE DE IMPRESORA */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 relative"
        >
          <div className="w-32 h-32 md:w-48 md:h-48 bg-[#111] rounded-3xl border border-gray-800 flex items-center justify-center shadow-[0_0_50px_rgba(0,174,66,0.2)]">
            <Printer className="w-16 h-16 md:w-24 md:h-24 text-[#00AE42] opacity-80" />

            {/* LASER SCAN EFFECT */}
            <motion.div
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-[#00AE42] shadow-[0_0_10px_#00AE42]"
            />
          </div>
        </motion.div>

        {/* CINTA DE PELIGRO / ADVERTENCIA */}
        <div className="mb-6 flex gap-4 overflow-hidden w-full justify-center opacity-50">
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 whitespace-nowrap text-[#00AE42] font-mono text-xs tracking-widest"
          >
            {[...Array(10)].map((_, i) => (
              <span key={i}>/// SYSTEM UPGRADE IN PROGRESS /// DO NOT TURN OFF ///</span>
            ))}
          </motion.div>
        </div>

        {/* TÍTULO GLITCH */}
        <h1 className="text-5xl md:text-8xl font-black text-center mb-2 tracking-tighter relative group">
          <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            EN MANTENIMIENTO
          </span>
          <span className="absolute top-0 left-0 -ml-[2px] text-red-500 opacity-0 group-hover:opacity-70 animate-pulse">EN MANTENIMIENTO</span>
          <span className="absolute top-0 left-0 ml-[2px] text-blue-500 opacity-0 group-hover:opacity-70 animate-pulse">EN MANTENIMIENTO</span>
        </h1>

        <p className="text-gray-400 text-lg md:text-2xl text-center max-w-2xl mb-12 leading-relaxed">
          Estamos calibrando nuestros extrusores y nivelando la cama.
          <br />
          <span className="text-[#00AE42] font-bold">Grana 3D</span> volverá más fuerte, rápido y preciso.
        </p>

        {/* BARRA DE PROGRESO DE IMPRESIÓN */}
        <div className="w-full max-w-md bg-[#111] h-14 rounded-xl border border-gray-800 relative overflow-hidden p-2 shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />

          {/* Barra verde */}
          <motion.div
            className="h-full bg-[#00AE42] rounded-lg relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[size:20px_20px] animate-[moveStripe_1s_linear_infinite]" />
          </motion.div>

          {/* Texto porcentaje */}
          <div className="absolute inset-0 flex items-center justify-between px-6 font-mono font-bold">
            <span className="text-white z-10 text-xs tracking-widest">ESTADO DEL SISTEMA</span>
            <span className="text-white z-10 bg-black/50 px-2 rounded">{progress}%</span>
          </div>
        </div>

        {/* DATOS DE DEBUG FALSOS */}
        <div className="mt-8 font-mono text-[10px] text-gray-600 flex gap-8">
          <div className="flex flex-col items-center">
            <Settings className="w-4 h-4 mb-1 animate-spin duration-[10s]" />
            <span>CORE: UPDATING</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-4 h-4 mb-1 text-yellow-600 animate-pulse" />
            <span>POWER: STABLE</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="w-4 h-4 mb-1 border rounded-full border-green-900 bg-green-900/20 block animate-ping" />
            <span>NET: CONNECTED</span>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes moveStripe {
          0% { background-position: 0 0; }
          100% { background-position: 20px 20px; }
        }
      `}</style>
    </div>
  );
}
