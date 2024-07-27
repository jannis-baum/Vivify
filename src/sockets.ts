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
    // queue of initial messages to be sent to new clients
    const messageQueue = new Map<string, string[]>();

    const terminateSocket = (id: string) => {
        const socket = sockets.get(id);
        if (!socket) return;
        socket.socket.terminate();
        sockets.delete(id);
        if (!sockets.size) onNoClients();
    };

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
                    const messages = messageQueue.get(value);
                    if (messages) {
                        messageQueue.delete(value);
                        messages.forEach((msg) => socket.send(msg));
                    }
                    break;
            }
        });

        socket.on('close', () => {
            terminateSocket(id);
        });
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => ws.ping());
        for (const [id, { alive }] of sockets) {
            if (alive) {
                sockets.get(id)!.alive = false;
                continue;
            }
            terminateSocket(id);
        }
    }, 1000);

    wss.on('close', () => clearInterval(interval));

    const clientsAt = (p: string) => [...sockets.values()].filter(({ path }) => path == p);
    const messageClients = (clients: SocketData[], message: string) =>
        clients.forEach(({ socket }) => socket.send(message));
    const queueMessage = (path: string, message: string) => {
        const messages = messageQueue.get(path);
        if (messages) {
            messages.push(message);
        } else {
            messageQueue.set(path, [message]);
        }
    };

    return { clientsAt, messageClients, queueMessage };
}
