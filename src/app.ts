import express from 'express';
import { createServer } from 'http';

import { router as viewerRouter } from './routes/viewer';
import { setupSockets } from './sockets';

process.env['MKPV_PORT'] = process.env['MKPV_PORT'] ?? '31622'

const app = express()
app.use(express.json());
app.use('/static', express.static('static'));
app.use('/viewer', viewerRouter);

const server = createServer(app);

server.listen(process.env['MKPV_PORT'], function () {
    console.log(`App is listening on port ${process.env['MKPV_PORT']} !`)
})

let shutdownTimer: NodeJS.Timer | null = null
export const { messageClientsAt } = setupSockets(
    server,
    () => {
        const timeout = parseInt(process.env['MKPV_TIMEOUT'] ?? '10000')
        if (timeout > 0) shutdownTimer = setInterval(() => process.exit(0), timeout);
    },
    () => { if (shutdownTimer) clearInterval(shutdownTimer); }
);
