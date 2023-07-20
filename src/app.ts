import express from 'express';
import { createServer } from 'http';

import { router as viewerRouter } from './routes/viewer';
import { setupSockets } from './sockets';

process.env['PORT'] = process.env['PORT'] ?? '31622'

const app = express()
app.use(express.json());
app.use('/static', express.static('static'));
app.use('/viewer', viewerRouter);

const server = createServer(app);

server.listen(process.env['PORT'], function () {
    console.log(`App is listening on port ${process.env['PORT']} !`)
})

let shutdownTimer: NodeJS.Timer | null = null
export const { messageClientsAt } = setupSockets(
    server,
    () => { shutdownTimer = setInterval(() => process.exit(0), 10000) },
    () => { if (shutdownTimer) clearInterval(shutdownTimer) }
);
