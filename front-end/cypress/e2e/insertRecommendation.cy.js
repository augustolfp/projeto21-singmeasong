import { faker } from '@faker-js/faker';

beforeEach(async () => {
    await cy.request('POST', 'http://localhost:5000/e2e/reset', {});
});

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
        cy.intercept('POST', 'http://localhost:5000/recommendations').as(
            'recommInsertion'
        );
        cy.get('[data-cy="postButton"]').click();
        cy.wait('@recommInsertion');

        cy.url().should('equal', 'http://localhost:3000/');
        cy.contains(newRecommendation.name).should('be.visible');
    });
    it('Tests if an error occurs if user inserts invalid link', () => {
        const invalidRecommendation = {
            name: faker.lorem.words(4),
            youtubeLink: faker.internet.url()
        };

        cy.visit('http://localhost:3000');
        cy.get('[data-cy="nameInput"]').type(invalidRecommendation.name);
        cy.get('[data-cy="ytLinkInput"]').type(
            invalidRecommendation.youtubeLink
        );
        cy.intercept('POST', 'http://localhost:5000/recommendations').as(
            'recommInsertion'
        );
        cy.get('[data-cy="postButton"]').click();
        cy.wait('@recommInsertion');

        cy.url().should('equal', 'http://localhost:3000/');
        cy.contains(invalidRecommendation.name).should('not.exist');
    });
    it('Tests if an error occurs if user inserts a name that already exists', () => {
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
        cy.intercept('POST', 'http://localhost:5000/recommendations').as(
            'recommInsertion'
        );
        cy.get('[data-cy="postButton"]').click();
        cy.wait('@recommInsertion');
        cy.get('[data-cy="nameInput"]').type(newRecommendation.name);
        cy.get('[data-cy="ytLinkInput"]').type(newRecommendation.youtubeLink);
        cy.intercept('POST', 'http://localhost:5000/recommendations').as(
            'duplicatedInsertion'
        );
        cy.get('[data-cy="postButton"]').click();
        cy.wait('@duplicatedInsertion');

        cy.on('window:alert', (str) => {
            expect(str).to.equal('Error creating recommendation!');
        });
    });
});
