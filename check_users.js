const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.usuario.findMany()
    console.log('Usuarios:', JSON.stringify(users.map(u => ({ ...u, password: '***' })), null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
