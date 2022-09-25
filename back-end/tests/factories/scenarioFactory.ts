import { prisma } from '../../src/database';
import * as recommendationFactory from './recommendationFactory';

export async function deleteAllDbData() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

export async function populateDB(amount: number) {
    const recommendationsArray = await recommendationFactory.createMany(amount);

    for (const recommendationBody of recommendationsArray) {
        return await prisma.recommendation.create({
            data: { ...recommendationBody }
        });
    }
}
