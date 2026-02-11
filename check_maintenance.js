wconst { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const config = await prisma.configuracion.findUnique({
        where: { clave: 'MAINTENANCE_MODE' }
    })
    console.log('MAINTENANCE_MODE:', config)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })
