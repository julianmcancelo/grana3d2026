const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const cupon = await prisma.cupon.upsert({
    where: { codigo: 'GRANA10' },
    update: {},
    create: {
      id: 'cupon-prueba-1',
      codigo: 'GRANA10',
      descripcion: '10% de descuento lanzamiento',
      tipo: 'PORCENTAJE',
      valor: 10,
      minimoCompra: 5000,
      maximoDescuento: 2000,
      usosMaximos: 100,
      fechaInicio: new Date(),
      fechaFin: new Date('2026-12-31'),
      activo: true,
      updatedAt: new Date()
    }
  })
  
  console.log('Cupón creado:', cupon)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
