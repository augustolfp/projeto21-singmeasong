import { faker } from '@faker-js/faker';

const videos = [
    'https://www.youtube.com/watch?v=UivZrL2znh0&list=RDMM54fea7wuV6s&index=2',
    'https://www.youtube.com/watch?v=Gi-GlK26Nqk&list=RDMM54fea7wuV6s&index=3',
    'https://www.youtube.com/watch?v=NPl2N9eQOn4&list=RDMM54fea7wuV6s&index=6'
];

function pickVideoFromList() {
    return videos[Math.floor(Math.random() * videos.length)];
}

export async function create() {
    return {
        name: faker.lorem.words(4),
        youtubeLink: pickVideoFromList()
    };
}

function createRandomScore(min: number, max: number) {
    return faker.datatype.number({
        min,
        max
    });
}

export function createMany(
    amount: number,
    randomScores?: [min: number, max: number]
) {
    const recommendationsArray = [];

    if (randomScores) {
        for (let i = 0; i < amount; i++) {
            recommendationsArray.push({
                name: faker.lorem.words(4),
                youtubeLink: pickVideoFromList(),
                score: createRandomScore(randomScores[0], randomScores[1])
            });
        }
    } else {
        for (let i = 0; i < amount; i++) {
            recommendationsArray.push({
                name: faker.lorem.words(4),
                youtubeLink: pickVideoFromList()
            });
        }
    }

    return recommendationsArray;
}
