import { faker } from '@faker-js/faker';

const videos = [
    'https://www.youtube.com/watch?v=54fea7wuV6s&list=RDMM54fea7wuV6s&start_radio=1',
    'https://www.youtube.com/watch?v=UivZrL2znh0&list=RDMM54fea7wuV6s&index=2',
    'https://www.youtube.com/watch?v=Gi-GlK26Nqk&list=RDMM54fea7wuV6s&index=3',
    'https://www.youtube.com/watch?v=NPl2N9eQOn4&list=RDMM54fea7wuV6s&index=6'
];

function pickVideoFromList() {
    return videos[Math.floor(Math.random() * videos.length)];
}

export async function create() {
    const randomVideo = pickVideoFromList();

    return {
        name: faker.lorem.words(4),
        youtubeLink: randomVideo
    };
}

export async function createMany() {
    const recommendationsArray = videos.map((video) => {
        return {
            name: faker.lorem.words(4),
            youtubeLink: video
        };
    });
    return recommendationsArray;
}
