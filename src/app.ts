import { createServer, get } from 'http';
import { resolve as presolve } from 'path';

import express from 'express';
import open from 'open';

import config from './parser/config.js';
import { router as healthRouter } from './routes/health.js';
import { router as staticRouter } from './routes/static.js';
import { router as viewerRouter } from './routes/viewer.js';
import { setupSockets } from './sockets.js';
import { pathToURL, preferredPath, urlToPath } from './utils/path.js';
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
export const { clientsAt, messageClients } = setupSockets(
    server,
    () => {
        if (config.timeout > 0)
            shutdownTimer = setInterval(() => {
                // timeout when no clients are connected
                process.exit(0);
            }, config.timeout);
    },
    () => {
        if (shutdownTimer) clearInterval(shutdownTimer);
    },
);

const address = `http://localhost:${config.port}`;
const handleArgs = async () => {
    try {
        const args = process.argv.slice(2);
        const options = args.filter((arg) => arg.startsWith('-'));
        for (const option of options) {
            switch (option) {
                case '-v':
                case '--version':
                    console.log(`vivify-server ${process.env.VERSION ?? 'dev'}`);
                    break;
                default:
                    console.log(`unknown option "${option}"`);
            }
        }

        const paths = args.filter((arg) => !arg.startsWith('-'));
        await Promise.all(
            paths.map(async (path) => {
                if (!existsSync(path)) {
                    console.log(`File not found: ${path}`);
                    return;
                }
                const target = preferredPath(presolve(path));
                const url = `${address}${pathToURL(target)}`;
                await open(url);
            }),
        );
    } finally {
        if (process.env['NODE_ENV'] !== 'development') {
            // - viv executable waits for this string and then stops printing
            //   vivify-server's output and terminates
            // - the string itself is not shown to the user
            console.log('STARTUP COMPLETE');
        }
    }
};

get(`${address}/health`, async () => {
    // server is already running
    await handleArgs();
    process.exit(0);
}).on('error', () => {
    // server is not running so we start it
    server.listen(config.port, handleArgs);
});
