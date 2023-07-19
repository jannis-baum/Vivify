import ws from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'http';

interface SocketData {
    socket: ws;
    alive: boolean;
    path?: string;
}

export function setupSockets(server: Server) {
    const wss = new ws.Server({ server });
    const sockets = new Map<string, SocketData>();

    wss.on('connection', (socket) => {
        const id = uuidv4();
        sockets.set(id, { socket, alive: true });
        socket.on('pong', () => {
            if (sockets.has(id)) {
                sockets.get(id)!.alive = true;
            } else {
                socket.terminate();
            }
        });
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach((ws) => ws.ping());
        for (const [id, { socket, alive }] of sockets) {
            if (alive) {
                sockets.get(id)!.alive = false;
                continue;
            }
            socket.terminate();
            sockets.delete(id);
        }
    }, 1000);

    wss.on('close', function close() {
        clearInterval(interval);
    });
}

