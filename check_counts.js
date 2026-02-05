const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const usuarios = await prisma.usuario.count()
  const categorias = await prisma.categoria.count()
  const pedidos = await prisma.pedido.count()

  console.log('Usuarios:', usuarios)
  console.log('Categorias:', categorias)
  console.log('Pedidos:', pedidos)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
