const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    const count = await prisma.user.count();
    console.log(`Total Users in DB: ${count}`);

    const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { email: true, orepaSCId: true, role: true, status: true, firstName: true }
    });

    console.log('Recent 5 Users:');
    console.table(recentUsers);
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
