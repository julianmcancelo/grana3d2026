const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Limpiar productos existentes (opcional, pero para pruebas es mejor)
  // await prisma.producto.deleteMany({}) 
  // await prisma.categoria.deleteMany({})

  // Crear categorías
  const mates = await prisma.categoria.upsert({
    where: { slug: 'mates' },
    update: {},
    create: {
      nombre: 'Mates 3D',
      slug: 'mates',
      descripcion: 'Mates personalizados impresos en 3D con polímero PLA',
      color: '#A855F7',
      orden: 1,
      activo: true,
      updatedAt: new Date()
    }
  })

  const soportes = await prisma.categoria.upsert({
    where: { slug: 'soportes' },
    update: {},
    create: {
      nombre: 'Soportes',
      slug: 'soportes',
      descripcion: 'Soportes para auriculares, joysticks y celulares',
      color: '#14B8A6',
      orden: 2,
      activo: true,
      updatedAt: new Date()
    }
  })

  const deco = await prisma.categoria.upsert({
    where: { slug: 'decoracion' },
    update: {},
    create: {
      nombre: 'Decoración',
      slug: 'decoracion',
      descripcion: 'Lámparas, macetas y objetos de diseño',
      color: '#F43F5E',
      orden: 3,
      activo: true,
      updatedAt: new Date()
    }
  })

  // Crear productos
  await prisma.producto.upsert({
    where: { slug: 'mate-geometrico' },
    update: {},
    create: {
      nombre: 'Mate Geométrico',
      slug: 'mate-geometrico',
      descripcion: 'Mate de diseño geométrico impreso en PLA biodegradable. Incluye bombilla de acero inoxidable.',
      precio: 15000,
      precioOferta: 12500,
      stock: 50,
      imagenes: ['https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=1000&auto=format&fit=crop'], // Placeholder
      categoriaId: mates.id,
      destacado: true,
      activo: true,
      variantes: {
        colores: ['Negro', 'Blanco', 'Marmolado', 'Azul Francia'],
        tamanos: ['Estándar']
      },
      updatedAt: new Date()
    }
  })

  await prisma.producto.upsert({
    where: { slug: 'soporte-auriculares-batman' },
    update: {},
    create: {
      nombre: 'Soporte Auriculares Batman',
      slug: 'soporte-auriculares-batman',
      descripcion: 'Soporte de mesa para auriculares con forma del logo de Batman.',
      precio: 8500,
      stock: 20,
      imagenes: ['https://m.media-amazon.com/images/I/61+Q6Rh3OqL._AC_UF894,1000_QL80_.jpg'], // Placeholder
      categoriaId: soportes.id,
      destacado: true,
      activo: true,
      variantes: {
        colores: ['Negro Mate', 'Gris Plata']
      },
      updatedAt: new Date()
    }
  })

  await prisma.producto.upsert({
    where: { slug: 'maceta-groot' },
    update: {},
    create: {
      nombre: 'Maceta Baby Groot',
      slug: 'maceta-groot',
      descripcion: 'Maceta impresa en 3D pintada a mano. Ideal para suculentas.',
      precio: 6000,
      stock: 100,
      imagenes: ['https://http2.mlstatic.com/D_NQ_NP_966606-MLA45607676766_042021-O.webp'], // Placeholder
      categoriaId: deco.id,
      destacado: false,
      activo: true,
      variantes: {
        tamanos: ['Chico (10cm)', 'Grande (15cm)']
      },
      updatedAt: new Date()
    }
  })
  
  console.log('Seed completado!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
