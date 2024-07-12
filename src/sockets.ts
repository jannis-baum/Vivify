import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'http';

interface SocketData {
    socket: WebSocket;
    alive: boolean;
    path?: string;
}

export function setupSockets(server: Server, onNoClients: () => void, onFirstClient: () => void) {
    onNoClients();

    const wss = new WebSocketServer({ server });
    const sockets = new Map<string, SocketData>();

    wss.on('connection', (socket) => {
        if (sockets.size === 0) onFirstClient();
        const id = uuidv4();
        sockets.set(id, { socket, alive: true });

        socket.on('pong', () => {
            if (sockets.has(id)) {
                sockets.get(id)!.alive = true;
            } else {
                socket.terminate();
                if (!sockets.size) onNoClients();
            }
        });

        socket.on('message', (message) => {
            const fields = message.toString().split(': ');
            if (fields.length != 2) return;
            const [key, value] = fields;

            switch (key) {
                case 'PATH':
                    sockets.get(id)!.path = value;
                    break;
            }
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => ws.ping());
        for (const [id, { socket, alive }] of sockets) {
            if (alive) {
                sockets.get(id)!.alive = false;
                continue;
            }
            socket.terminate();
            sockets.delete(id);
            if (!sockets.size) onNoClients();
        }
    }, 1000);

    wss.on('close', () => clearInterval(interval));

    const clientsAt = (p: string) => [...sockets.values()].filter(({ path }) => path == p);
    const messageClientsAt = (p: string, message: string) =>
        clientsAt(p).forEach(({ socket }) => socket.send(message));

    return { clientsAt, messageClientsAt };
}
