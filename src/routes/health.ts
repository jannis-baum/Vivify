import { Request, Response, Router } from 'express';

import { clientsAt } from '../app.js';

export const router = Router();

router.get('/', async (_: Request, res: Response) => {
    res.end();
});

router.get(/.+/, async (_: Request, res: Response) => {
    if (clientsAt(res.locals.filepath).length) res.end();
    else res.status(404).send('No clients');
});
