import * as e2eRepository from '../repositories/e2eRepository';

export async function truncate() {
    await e2eRepository.truncate();
    return 'Sucesso';
}

export async function populate(
    amount: number,
    randomScores?: [min: number, max: number]
) {
    await e2eRepository.populate(amount, randomScores);
}
