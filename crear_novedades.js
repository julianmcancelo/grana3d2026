const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creando novedades de prueba...');

  const novedades = [
    {
      titulo: '¡Llegaron los nuevos filamentos Silk!',
      contenido: 'Acabamos de recibir una partida de filamentos PLA Silk en colores Oro, Plata y Cobre. Ideales para piezas decorativas que requieran un brillo metálico espectacular.',
      imagen: 'https://images.unsplash.com/photo-1615655406736-b37c4fabf923?q=80&w=1000&auto=format&fit=crop',
    },
    {
      titulo: 'Descuento especial en Resina',
      contenido: 'Toda la semana, 15% OFF en impresiones de resina 8K. Si tenés miniaturas o joyería para imprimir, es el momento.',
      imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    },
    {
      titulo: 'Nuevo servicio de escaneo 3D',
      contenido: 'Incorporamos un escáner 3D de alta precisión. Traenos tu pieza física y la digitalizamos para replicarla o modificarla.',
      imagen: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=1000&auto=format&fit=crop',
    }
  ];

  for (const n of novedades) {
    await prisma.novedad.create({ data: n });
    console.log(`Creada: ${n.titulo}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
