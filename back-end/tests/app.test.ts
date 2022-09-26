import supertest from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database';
import * as scenarios from './factories/scenarioFactory';
import * as recommendationFactory from './factories/recommendationFactory';
import { faker } from '@faker-js/faker';

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
        const recommendation = await prisma.$queryRaw`
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
        const recommendation = await prisma.$queryRaw`
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

        const recommendation = await prisma.$queryRaw`
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

        const recommendation = await prisma.$queryRaw`
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
    it.todo('Tests if an error occurs when recommendations DB is empty');
    it.todo('Tests if response is properly formatted');
    it.todo(
        'Tests if response is properly random, based on predefined criteria'
    );
});

describe('Tests GET /recommendations/top/:amount', () => {
    it.todo(
        'Tests if receives the correct amount when DB size is bigger than amount'
    );
    it.todo(
        'Tests if receives all recommendations when DB size is smaller than amount'
    );
    it.todo('Tests if received recommendations are in fact the most upvoted');
    it.todo('Tests if receives recommendations in descending order');
});

afterAll(async () => {
    await prisma.$disconnect();
});
