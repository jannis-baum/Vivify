import { Request, Response, Router } from 'express';
import { openAndMessage } from '../app.js';
import { openFileAt } from '../cli.js';

// this route should only be used internally between vivify processes
export const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { path, command, value } = req.body;

    if (!path) {
        res.status(400).send('Bad request.');
        return;
    }

    try {
        if (command) {
            await openAndMessage(path, `${command}: ${value}`);
        } else {
            await openFileAt(path);
        }
    } catch {
        res.status(500).end();
        return;
    }

    res.end();
});
