import { Request, Response, Router } from 'express';
import { deleteQueue, queueMessage } from '../app.js';

// this route should only be used internally between vivify processes
export const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { path, command, value } = req.body;

    if (!path) {
        res.status(400).send('Bad request.');
        return;
    }

    if (!command) {
        deleteQueue(path);
    } else {
        queueMessage(path, `${command}: ${value}`);
    }

    res.end();
});
