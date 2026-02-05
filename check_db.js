const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.producto.count()
  console.log('Total productos:', count)
  
  const productos = await prisma.producto.findMany({ take: 5 })
  console.log('Primeros 5 productos:', JSON.stringify(productos, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
