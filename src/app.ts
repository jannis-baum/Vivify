// here anything that needs to be initialized asynchronously once can register
// to run at startup
// this needs to be declared and exported first!
const asyncInits = new Array<() => Promise<void>>();
export const registerAsyncInit = (f: () => Promise<void>) => {
    asyncInits.push(f);
};

import { createServer } from 'http';

import express from 'express';

import { router as healthRouter } from './routes/health';
import { router as viewerRouter } from './routes/viewer';
import { router as staticRouter } from './routes/static';
import { setupSockets } from './sockets';
import { urlToPath } from './utils/path';
import config from './parser/config';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
    res.locals.filepath = urlToPath(req.path);
    next();
});
app.use('/static', staticRouter);
app.use('/health', healthRouter);
app.use('/viewer', viewerRouter);

const server = createServer(app);

server.listen(config.port, async () => {
    await Promise.all(asyncInits.map(async (i) => await i()));
    console.log(`App is listening on port ${config.port}!`);
});

let shutdownTimer: NodeJS.Timeout | null = null;
export const { clientsAt, messageClientsAt } = setupSockets(
    server,
    () => {
        if (config.timeout > 0)
            shutdownTimer = setInterval(() => {
                console.log(`No clients for ${config.timeout}ms, shutting down.`);
                process.exit(0);
            }, config.timeout);
    },
    () => {
        if (shutdownTimer) clearInterval(shutdownTimer);
    },
);
