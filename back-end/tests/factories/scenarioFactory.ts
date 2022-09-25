import { prisma } from '../../src/database';

export async function deleteAllDbData() {
    await prisma.$executeRaw`TRUNCATE TABLE *`;
}
