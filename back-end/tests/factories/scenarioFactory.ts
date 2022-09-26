import { prisma } from '../../src/database';
import * as recommendationFactory from './recommendationFactory';

export async function deleteAllDbData() {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations`;
}

export async function populateDB(amount: number, randomScores?: boolean) {
    const recommendationsArray = recommendationFactory.createMany(
        amount,
        randomScores
    );

    for (const recommendationBody of recommendationsArray) {
        await prisma.recommendation.create({
            data: { ...recommendationBody }
        });
    }
}
