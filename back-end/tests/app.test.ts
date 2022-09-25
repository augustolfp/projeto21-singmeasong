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

describe('Tests POSTS /recommendations', () => {
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
        delete recommendationBody.name;

        const result = await server
            .post('/recommendations')
            .send(recommendationBody);

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

describe('Tests POSTS /recommendations/:id/upvote', () => {
    it.todo('Tests if user upvote is successfully added to DB');
    it.todo('Tests if error occurs when invalid ID is received');
});

describe('Tests POSTS /recommendations/:id/downvote', () => {
    it.todo('Tests if user downvote is successfully added to DB');
    it.todo('Tests if error occurs when invalid ID is received');
    it.todo('Tests if recommendation is deleted when score hits -5');
});

afterAll(async () => {
    await prisma.$disconnect();
});
