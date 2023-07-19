const ws = new WebSocket(`ws://localhost:${window.MKPV_PORT}`);

ws.addEventListener('open', () => {
    ws.send(`PATH: ${window.MKPV_PATH}`);
});

ws.addEventListener('message', (event) => {
    const fields = event.data.toString().split(': ')
    if (fields.length != 2) return;
    const [key, value] = fields;

    switch (key) {
        case 'UPDATE':
            document.body.innerHTML = value
            break
    }
});
