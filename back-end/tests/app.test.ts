import supertest from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database';
import { IRecData } from './types/recommendationTypes';
import * as scenarios from './factories/scenarioFactory';
import * as recommendationFactory from './factories/recommendationFactory';
import { faker } from '@faker-js/faker';
import 'jest-extended';

beforeEach(async () => {
    await scenarios.deleteAllDbData();
});

const server = supertest(app);

describe('Tests POST /recommendations', () => {
    it('Tests if valid POST is successfully stored on DB', async () => {
        const recommendationBody = await recommendationFactory.create();

        const result = await server
            .post('/recommendations')
            .send(recommendationBody);

        const createdRecommendation = await prisma.recommendation.findFirst({
            where: { name: recommendationBody.name }
        });

        expect(result.status).toBe(201);
        expect(createdRecommendation).not.toBeFalsy();
    });

    it('Tests if an error occurs when the name string is not defined', async () => {
        const recommendationBody = await recommendationFactory.create();

        const incompleteBody = {
            ...recommendationBody,
            youtubeLink: undefined
        };
        const result = await server
            .post('/recommendations')
            .send(incompleteBody);

        expect(result.status).toBe(422);
    });

    it('Tests if an error occurs when received link is not from youtube', async () => {
        const recommendationBody = await recommendationFactory.create();
        recommendationBody.youtubeLink = faker.internet.url();

        const result = await server
            .post('/recommendations')
            .send(recommendationBody);

        expect(result.status).toBe(422);
    });
});

describe('Tests POST /recommendations/:id/upvote', () => {
    it('Tests if user upvote is successfully added to DB', async () => {
        await scenarios.populateDB(10);
        const recommendation = await prisma.$queryRaw<IRecData[]>`
            SELECT *
                FROM recommendations
                ORDER BY random()
                LIMIT 1`;

        const recommendationId: number = recommendation[0].id;
        const result = await server.post(
            `/recommendations/${recommendationId}/upvote`
        );

        const upvotedRecommendation = await prisma.recommendation.findFirst({
            where: {
                id: recommendationId
            }
        });

        let upvoteDifference = 0;

        if (upvotedRecommendation) {
            upvoteDifference =
                upvotedRecommendation?.score - recommendation[0].score;
        }

        expect(result.status).toBe(200);
        expect(upvoteDifference).toBe(1);
    });
    it('Tests if error occurs when invalid ID is received', async () => {
        await scenarios.populateDB(10);

        const unreasonableId = 999;

        const idExists = await prisma.recommendation.findFirst({
            where: {
                id: unreasonableId
            }
        });

        if (idExists) {
            return;
        }

        const result = await server.post(
            `/recommendations/${unreasonableId}/upvote`
        );

        expect(result.status).toBe(404);
    });
});

describe('Tests POST /recommendations/:id/downvote', () => {
    it('Tests if user downvote is successfully added to DB', async () => {
        await scenarios.populateDB(10);
        const recommendation = await prisma.$queryRaw<IRecData[]>`
            SELECT *
                FROM recommendations
                ORDER BY random()
                LIMIT 1`;

        const recommendationId: number = recommendation[0].id;
        const result = await server.post(
            `/recommendations/${recommendationId}/downvote`
        );

        const upvotedRecommendation = await prisma.recommendation.findFirst({
            where: {
                id: recommendationId
            }
        });

        let upvoteDifference = 0;

        if (upvotedRecommendation) {
            upvoteDifference =
                upvotedRecommendation?.score - recommendation[0].score;
        }

        expect(result.status).toBe(200);
        expect(upvoteDifference).toBe(-1);
    });
    it('Tests if error occurs when invalid ID is received', async () => {
        await scenarios.populateDB(10);

        const unreasonableId = 999;

        const idExists = await prisma.recommendation.findFirst({
            where: {
                id: unreasonableId
            }
        });

        if (idExists) {
            return;
        }

        const result = await server.post(
            `/recommendations/${unreasonableId}/downvote`
        );

        expect(result.status).toBe(404);
    });
    it('Tests if recommendation is deleted when score reaches -6', async () => {
        await scenarios.populateDB(10);

        const recommendation = await prisma.$queryRaw<IRecData[]>`
        SELECT *
            FROM recommendations
            ORDER BY random()
            LIMIT 1`;

        const recommendationId: number = recommendation[0].id;

        for (let i = 0; i < 6; i++) {
            await server.post(`/recommendations/${recommendationId}/downvote`);
        }

        const idExists = await prisma.recommendation.findFirst({
            where: {
                id: recommendationId
            }
        });

        expect(idExists).toBeFalsy();
    });
});

describe('Tests GET /recommendations', () => {
    it('Tests if receives 10 last recommendations, if there is more than 10', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 11,
            max: 30
        });

        await scenarios.populateDB(numOfRecommendations);

        const result = await server.get('/recommendations');

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(10);
    });
    it('Tests if receives all recommendations, if there is less or equal 10', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 1,
            max: 10
        });

        await scenarios.populateDB(numOfRecommendations);

        const result = await server.get('/recommendations');

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(numOfRecommendations);
    });
    it('Check if response is properly formatted', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 11,
            max: 30
        });

        await scenarios.populateDB(numOfRecommendations);

        const sortedRecommendations = await prisma.recommendation.findMany({
            orderBy: { id: 'desc' }
        });

        const result = await server.get('/recommendations');

        expect(result.status).toBe(200);
        expect(JSON.stringify(result.body[0])).toEqual(
            JSON.stringify(sortedRecommendations[0])
        );
        expect(JSON.stringify(result.body[9])).toEqual(
            JSON.stringify(sortedRecommendations[9])
        );
    });
});

describe('Tests GET /recommendations/:id', () => {
    it('Tests if response to valid id is the correct recommendation', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 11,
            max: 30
        });
        await scenarios.populateDB(numOfRecommendations);

        const recommendation = await prisma.$queryRaw<IRecData[]>`
        SELECT *
            FROM recommendations
            ORDER BY random()
            LIMIT 1`;

        const result = await server.get(
            `/recommendations/${recommendation[0].id}`
        );
        expect(result.status).toBe(200);
        expect(JSON.stringify(result.body)).toEqual(
            JSON.stringify(recommendation[0])
        );
    });
    it('Tests if error occurs when invalid ID is received', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 11,
            max: 30
        });

        await scenarios.populateDB(numOfRecommendations);

        const unreasonableId = 9999;

        const idExists = await prisma.recommendation.findFirst({
            where: {
                id: unreasonableId
            }
        });

        if (idExists) {
            return;
        }

        const result = await server.get(`/recommendations/${unreasonableId}`);

        expect(result.status).toBe(404);
    });
});

describe('Tests GET /recommendations/random', () => {
    it('Tests if an error occurs when recommendations DB is empty', async () => {
        const result = await server.get('/recommendations/random');

        expect(result.status).toBe(404);
    });
    it('Tests if response is properly formatted', async () => {
        const numOfRecommendations = faker.datatype.number({
            min: 11,
            max: 30
        });
        await scenarios.populateDB(numOfRecommendations, [-3, 200]);

        const result = await server.get('/recommendations/random');

        const getFromDb = await prisma.recommendation.findUnique({
            where: {
                id: result.body.id
            }
        });

        expect(result.status).toBe(200);
        expect(JSON.stringify(result.body)).toEqual(JSON.stringify(getFromDb));
    });
    it('Tests if response is properly random, based on predefined criteria, for scores within [-5, 10] range', async () => {
        const scores = [];
        const confidenceInterval = 5;
        const sampleSize = 500;
        const minScore = -5;
        const maxScore = 10;

        await scenarios.populateDB(sampleSize, [minScore, maxScore]);
        const query = await prisma.recommendation.findMany({
            select: {
                score: true
            },
            orderBy: {
                score: 'asc'
            }
        });

        const dbScores = query.map((element) => {
            return element.score;
        });

        const dbAverage = dbScores.reduce((a, b) => a + b, 0) / dbScores.length;
        const dbMedian = dbScores[Math.floor(dbScores.length / 2)];

        for (let i = 0; i < sampleSize; i++) {
            const result = await server.get('/recommendations/random');
            if (result.body.score) {
                scores.push(result.body.score);
            }
        }
        scores.sort(function (a, b) {
            return a - b;
        });
        const statisticalAverage =
            scores.reduce((a, b) => a + b, 0) / scores.length;

        const statisticalMedian = scores[Math.floor(scores.length / 2)];

        expect(statisticalAverage).toBeWithin(
            dbAverage - confidenceInterval,
            dbAverage + confidenceInterval
        );

        expect(statisticalMedian).toBeWithin(
            dbMedian - confidenceInterval,
            dbMedian + confidenceInterval
        );
    }, 60000);

    it('Tests if response is properly random, based on predefined criteria, for scores within [11, 100] range', async () => {
        const scores = [];
        const confidenceInterval = 30;
        const sampleSize = 900;
        const minScore = 11;
        const maxScore = 100;

        await scenarios.populateDB(sampleSize, [minScore, maxScore]);

        const query = await prisma.recommendation.findMany({
            select: {
                score: true
            },
            orderBy: {
                score: 'asc'
            }
        });

        const dbScores = query.map((element) => {
            return element.score;
        });

        const dbAverage = dbScores.reduce((a, b) => a + b, 0) / dbScores.length;
        const dbMedian = dbScores[Math.floor(dbScores.length / 2)];

        for (let i = 0; i < sampleSize; i++) {
            const result = await server.get('/recommendations/random');
            if (result.body.score) {
                scores.push(result.body.score);
            }
        }
        scores.sort(function (a, b) {
            return a - b;
        });
        const statisticalAverage =
            scores.reduce((a, b) => a + b, 0) / scores.length;

        const statisticalMedian = scores[Math.floor(scores.length / 2)];

        expect(statisticalAverage).toBeWithin(
            dbAverage - confidenceInterval,
            dbAverage + confidenceInterval
        );

        expect(statisticalMedian).toBeWithin(
            dbMedian - confidenceInterval,
            dbMedian + confidenceInterval
        );
    }, 60000);

    it('Tests if response is properly random, based on predefined criteria, for scores within [-5, 100] range', async () => {
        const scores = [];
        const confidenceInterval = 0.1;
        const samplesWithScoreHigherThan10 = 500;
        const samplesWithScoreLowerThan10 = 500;
        const sampleSize =
            samplesWithScoreHigherThan10 + samplesWithScoreLowerThan10;
        const minScore = -5;
        const maxScore = 100;

        await scenarios.populateDB(samplesWithScoreHigherThan10, [
            11,
            maxScore
        ]);
        await scenarios.populateDB(samplesWithScoreLowerThan10, [minScore, 10]);
        const query = await prisma.recommendation.findMany({
            select: {
                score: true
            },
            orderBy: {
                score: 'asc'
            }
        });

        const dbScores = query.map((element) => {
            return element.score;
        });

        const dbScoresBiggerThan10 = dbScores.filter((score) => {
            return score > 10;
        }).length;

        const ratioOfDbScoresBiggerthan10 =
            dbScoresBiggerThan10 / dbScores.length;

        for (let i = 0; i < sampleSize; i++) {
            const result = await server.get('/recommendations/random');
            if (result.body.score) {
                scores.push(result.body.score);
            }
        }
        scores.sort(function (a, b) {
            return a - b;
        });

        const statisticalScoresBiggerThan10 = scores.filter((score) => {
            return score > 10;
        }).length;
        const ratioOfStatisticalScoresBiggerthan10 =
            statisticalScoresBiggerThan10 / scores.length;

        expect(ratioOfStatisticalScoresBiggerthan10).toBeWithin(
            0.7 - confidenceInterval,
            0.7 + confidenceInterval
        );
        expect(ratioOfDbScoresBiggerthan10).toBeWithin(
            0.5 - confidenceInterval,
            0.5 + confidenceInterval
        );
    }, 60000);
});

describe('Tests GET /recommendations/top/:amount', () => {
    it('Tests if receives the correct amount when DB size is bigger than amount', async () => {
        const amount = faker.datatype.number({
            min: 5,
            max: 50
        });

        const recommendationSurplus = faker.datatype.number({
            min: 1,
            max: 10
        });

        await scenarios.populateDB(amount + recommendationSurplus, [-3, 200]);

        const result = await server.get(`/recommendations/top/${amount}`);

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(amount);
    });
    it('Tests if receives all recommendations when DB size is smaller than amount', async () => {
        const amount = faker.datatype.number({
            min: 20,
            max: 50
        });

        const recommendationShortage = faker.datatype.number({
            min: 0,
            max: 19
        });

        await scenarios.populateDB(amount - recommendationShortage, [-3, 200]);

        const result = await server.get(`/recommendations/top/${amount}`);
        const allRecommendations = await prisma.recommendation.findMany();

        expect(result.status).toBe(200);
        expect(result.body.length).toBe(allRecommendations.length);
    });

    it('Tests if received recommendations are in fact the most upvoted and in descending order', async () => {
        const amount = faker.datatype.number({
            min: 5,
            max: 50
        });

        const recommendationSurplus = faker.datatype.number({
            min: 1,
            max: 10
        });

        await scenarios.populateDB(amount + recommendationSurplus, [-3, 200]);

        const result = await server.get(`/recommendations/top/${amount}`);
        const sortedRecommendations = await prisma.recommendation.findMany({
            orderBy: { score: 'desc' }
        });

        expect(result.status).toBe(200);
        expect(JSON.stringify(result.body[0])).toEqual(
            JSON.stringify(sortedRecommendations[0])
        );
        expect(JSON.stringify(result.body[amount - 1])).toEqual(
            JSON.stringify(sortedRecommendations[amount - 1])
        );
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
