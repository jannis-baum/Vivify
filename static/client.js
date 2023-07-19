const ws = new WebSocket(`ws://localhost:${window.MKPV_PORT}`);

ws.addEventListener('open', () => {
    ws.send(`PATH: ${window.MKPV_PATH}`);
});

ws.addEventListener('message', (event) => {
    console.log('Message from server ', event.data);
});
