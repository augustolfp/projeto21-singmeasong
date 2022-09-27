import { Request, Response } from 'express';
import * as e2eService from '../services/e2eService';

export async function reset(req: Request, res: Response) {
    await e2eService.truncate();
    return res.sendStatus(201);
}

export async function populateDb(req: Request, res: Response) {
    const options = req.body;

    await e2eService.populate(options.amount, options.randomScores);
    return res.sendStatus(201);
}
