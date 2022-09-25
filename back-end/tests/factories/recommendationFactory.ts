import { faker } from '@faker-js/faker';
import RandExp from 'randexp';

const youtubeLinkGenerator = new RandExp(
    /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/
);

export async function create() {
    return {
        name: faker.lorem.words(4),
        youtubeLink: youtubeLinkGenerator.gen()
    };
}

export async function createMany(amount: number) {
    const recommendationsArray = [];

    for (let i = 0; i < amount; i++) {
        recommendationsArray.push({
            name: faker.lorem.words(4),
            youtubeLink: youtubeLinkGenerator.gen()
        });
    }

    return recommendationsArray;
}
