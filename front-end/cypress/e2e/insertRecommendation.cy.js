import { faker } from '@faker-js/faker';

describe('Test insert recommendation routine', () => {
    it('Tests if user can insert valid youtube video', () => {
        const videos = [
            'https://www.youtube.com/watch?v=UivZrL2znh0&list=RDMM54fea7wuV6s&index=2',
            'https://www.youtube.com/watch?v=Gi-GlK26Nqk&list=RDMM54fea7wuV6s&index=3',
            'https://www.youtube.com/watch?v=NPl2N9eQOn4&list=RDMM54fea7wuV6s&index=6'
        ];

        function pickVideoFromList() {
            return videos[Math.floor(Math.random() * videos.length)];
        }

        const newRecommendation = {
            name: faker.lorem.words(4),
            youtubeLink: pickVideoFromList()
        };

        cy.visit('http://localhost:3000');
        cy.get('[data-cy="nameInput"]').type(newRecommendation.name);
        cy.get('[data-cy="ytLinkInput"]').type(newRecommendation.youtubeLink);
        cy.get('[data-cy="postButton"]').click();
    });
});
