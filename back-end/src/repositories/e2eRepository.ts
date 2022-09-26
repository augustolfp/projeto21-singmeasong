import * as scenarioFactory from '../../tests/factories/scenarioFactory.js';

export async function truncate() {
    await scenarioFactory.deleteAllDbData();
    return 'sucesso';
}

export async function populate(
    amount: number,
    randomScores?: [min: number, max: number]
) {
    await scenarioFactory.populateDB(amount, randomScores);
}
