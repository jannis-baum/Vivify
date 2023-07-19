import express from 'express';
import { createServer } from 'http';

import { router } from './routes';
import { setupSockets } from './sockets';

process.env['PORT'] = process.env['PORT'] ?? '31622'
const app = express()
const server = createServer(app);
const { messageClientsAt } = setupSockets(server);

app.use(router)

server.listen(process.env['PORT'], function () {
    console.log(`App is listening on port ${process.env['PORT']} !`)
})
