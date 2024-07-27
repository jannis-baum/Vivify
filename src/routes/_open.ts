import { Request, Response, Router } from 'express';
import { deleteQueuedMessage, queueMessage } from '../app.js';
import { address } from '../cli.js';
import { pathToURL, preferredPath } from '../utils/path.js';
import open from 'open';

// this route should only be used internally between vivify processes
export const router = Router();

router.post('/', async (req: Request, res: Response) => {
    const { path, command, value } = req.body;

    if (!path) {
        res.status(400).send('Bad request.');
        return;
    }

    // NOTE: if we ever want to properly consider having many clients to one
    // server (currently not smart because entire file system would be
    // exposed), we will have to protect this critical section between here and
    // the websocket of the client connecting in `src/sockets.ts`
    if (command) {
        queueMessage(path, `${command}: ${value}`);
    } else {
        deleteQueuedMessage(path);
    }

    try {
        await open(`${address}${pathToURL(preferredPath(path))}`);
    } catch {
        deleteQueuedMessage(path);
    }

    res.end();
});
