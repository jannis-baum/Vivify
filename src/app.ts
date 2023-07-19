import express, { Request, Response} from 'express';
import { readFileSync } from 'fs';
import { createServer } from 'http';
import { Converter } from 'showdown';

import { setupSockets } from './sockets';

const port = 31622
const app = express()
export const server = createServer(app);
setupSockets(server);

const converter = new Converter();
converter.setFlavor('github');

app.get(/.*/, async (req: Request, res: Response) => {
    try {
        const content = readFileSync(req.path).toString();
        res.send(`
<html>
    <body>
        ${converter.makeHtml(content)}
    </body>
    <script>
        let ws = new WebSocket("ws://localhost:${port}");
        ws.addEventListener("open", (event) => {
            socket.send("PATH: ${req.path}");
        });
        ws.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
    </script>
</html>
                 `);
    } catch {
        res.status(400);
        res.send('File not found.');
    }
})

server.listen(port, function () {
    console.log(`App is listening on port ${port} !`)
})
