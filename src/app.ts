import { createServer, get } from 'http';
import { resolve as presolve } from 'path';

import express from 'express';
import open from 'open';

import config from './parser/config.js';
import { router as healthRouter } from './routes/health.js';
import { router as staticRouter } from './routes/static.js';
import { router as viewerRouter } from './routes/viewer.js';
import { setupSockets } from './sockets.js';
import { pathToURL, urlToPath } from './utils/path.js';
import { existsSync } from 'fs';

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

const address = `http://localhost:${config.port}`;
const openArgs = () => {
    for (const path of process.argv.slice(2)) {
        if (path.startsWith('-')) continue;
        if (!existsSync(path)) {
            console.log(`File not found: ${path}`);
            continue;
        }
        const absolute = presolve(path);
        const url = `${address}${pathToURL(absolute)}`;
        open(url);
    }
};

get(`${address}/health`, () => {
    // server is already running
    openArgs();
    process.exit(0);
}).on('error', () => {
    // server is not running so we start it
    server.listen(config.port, async () => {
        console.log(`App is listening on port ${config.port}!`);
        openArgs();
    });
});
