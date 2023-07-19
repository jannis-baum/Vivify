import express from 'express';
import { createServer } from 'http';

import { router } from './routes';
import { setupSockets } from './sockets';

process.env['PORT'] = process.env['PORT'] ?? '31622'

const app = express()
app.use(express.json());
app.use(router)

const server = createServer(app);

server.listen(process.env['PORT'], function () {
    console.log(`App is listening on port ${process.env['PORT']} !`)
})

export const { messageClientsAt } = setupSockets(server);
