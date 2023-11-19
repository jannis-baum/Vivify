// here anything that needs to be initialized asynchronously once can register
// to run at startup
// this needs to be declared and exported first!
const asyncInits = new Array<() => Promise<void>>();
export const registerAsyncInit = (f: () => Promise<void>) => {
    asyncInits.push(f);
};

import { createServer } from 'http';
import path from 'path';

import express from 'express';

import { router as healthRouter } from './routes/health';
import { router as viewerRouter } from './routes/viewer';
import { setupSockets } from './sockets';
import { urlToPath } from './utils/path';

process.env['VIV_PORT'] = process.env['VIV_PORT'] ?? '31622';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.locals.filepath = urlToPath(req.path);
    next();
});
app.use('/static', express.static(path.join(__dirname, '../static')));
app.use('/health', healthRouter);
app.use('/viewer', viewerRouter);

const server = createServer(app);

server.listen(process.env['VIV_PORT'], async () => {
    await Promise.all(asyncInits.map(async (i) => await i()));
    console.log(`App is listening on port ${process.env['VIV_PORT']}!`);
});

let shutdownTimer: NodeJS.Timer | null = null;
export const { clientsAt, messageClientsAt } = setupSockets(
    server,
    () => {
        const timeout = parseInt(process.env['VIV_TIMEOUT'] ?? '10000');
        if (timeout > 0)
            shutdownTimer = setInterval(() => {
                console.log(`No clients for ${timeout}ms, shutting down.`);
                process.exit(0);
            }, timeout);
    },
    () => {
        if (shutdownTimer) clearInterval(shutdownTimer);
    },
);
