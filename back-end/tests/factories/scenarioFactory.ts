import { prisma } from '../../src/database';
import * as recommendationFactory from './recommendationFactory';

export async function deleteAllDbData() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

export async function populateDB() {
    const recommendationsArray = await recommendationFactory.createMany();

    recommendationsArray.forEach(async (recommendationBody) => {
        await prisma.recommendation.create({
            data: { ...recommendationBody }
        });
    });
}
