import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'http';
import { openFileAt } from './cli.js';
import fs from 'fs';

interface SocketData {
    socket: WebSocket;
    alive: boolean;
    path?: string;
    watcher?: fs.FSWatcher;
}

export function setupSockets(
    server: Server,
    onNoClients: () => void,
    onFirstClient: () => void,
    onWrite: (path: string) => void,
) {
    onNoClients();

    const wss = new WebSocketServer({ server });
    const sockets = new Map<string, SocketData>();
    // queue of messages to be sent to clients after they have connected
    const openQueue = new Map<string, { message: string; timeout: number }[]>();

    const terminateSocket = (id: string) => {
        const socket = sockets.get(id);
        if (!socket) return;
        socket.socket.terminate();
        socket.watcher?.close();
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
                    console.log('setting up watcher for', value);
                    sockets.get(id)!.watcher = fs.watch(value, (eventType) => {
                        console.log('watcher triggered for', value, 'with', eventType);
                        if (eventType !== 'change') return;
                        onWrite(value);
                    });
                    const queue = openQueue.get(value);
                    if (!queue) return;

                    let message: string | undefined = undefined;
                    while (queue.length) {
                        const item = queue.shift();
                        if (item && item.timeout > Date.now()) {
                            message = item.message;
                            break;
                        }
                    }
                    if (!queue.length) openQueue.delete(value);
                    if (message) socket.send(message);
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

    // NOTE: The message queuing relies on the server running on the same
    // machine that is used to view the files. if we ever want to consider
    // having a "real" server with other machine(s) acting as client(s), we
    // have to switch to query parameters instead of queued messages (this
    // would currently not be smart anyways because the server's entire
    // file system would be exposed).
    // The reason we don't use query parameters is because this would not allow
    // reusing the same tab when (re)opening a file on browsers that support it
    // (e.g. Safari)
    const openAndMessage = async (path: string, message: string) => {
        const queue = openQueue.get(path);
        const newItem = { message, timeout: Date.now() + 1000 };
        if (queue) {
            queue.push(newItem);
        } else {
            openQueue.set(path, [newItem]);
        }
        await openFileAt(path);
    };

    return { clientsAt, messageClients, openAndMessage };
}
