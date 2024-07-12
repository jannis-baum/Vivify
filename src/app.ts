import { createServer } from 'http';

import express from 'express';

import { router as healthRouter } from './routes/health.js';
import { router as viewerRouter } from './routes/viewer.js';
import { router as staticRouter } from './routes/static.js';
import { setupSockets } from './sockets.js';
import { urlToPath } from './utils/path.js';
import config from './parser/config.js';

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
