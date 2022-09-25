import supertest from 'supertest';
import app from '../src/app';
import { prisma } from '../src/database';
import * as scenarios from './factories/scenarioFactory';

beforeEach(async () => {
    await scenarios.deleteAllDbData();
});

const server = supertest(app);

describe('Tests POSTS /recommendations', async () => {
    it.todo('Tests if valid POST is successfully stored on DB');

    it.todo('Tests if an error occurs when the name string is not defined');

    it.todo('Tests if an error occurs when received link is not from youtube');
});

describe('Tests POSTS /recommendations/:id/upvote', async () => {
    it.todo('Tests if user upvote is successfully added to DB');
    it.todo('Tests if error occurs when invalid ID is received');
});

describe('Tests POSTS /recommendations/:id/downvote', async () => {
    it.todo('Tests if user downvote is successfully added to DB');
    it.todo('Tests if error occurs when invalid ID is received');
    it.todo('Tests if recommendation is deleted when score hits -5');
});
