function viv_scrollTo(value) {
    let line = parseInt(value);
    while (line) {
        const targets = document.querySelectorAll(`[data-source-line="${line - 1}"]`);
        if (targets.length) {
            targets[0].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
            break;
        }
        line -= 1;
    }
}

const ws = new WebSocket(`ws://localhost:${window.VIV_PORT}`);

ws.addEventListener('open', () => {
    ws.send(`PATH: ${window.VIV_PATH}`);
});

ws.addEventListener('message', (event) => {
    const fields = event.data.toString().split(': ');
    if (fields.length < 2) return;
    const [key, ...values] = fields;
    const value = values.join(': ');

    switch (key) {
        case 'UPDATE':
            document.getElementById('body-content').innerHTML = value;
            break;
        case 'SCROLL':
            viv_scrollTo(value);
            break;
        case 'RELOAD':
            window.location.reload();
            break;
        case 'PRINT':
            console.log(value);
            break;
    }
});

// remove query parameters from URL so that opening the same file will direct to
// the same browser window even if it was initially opened at a given position
history.replaceState(null, '', window.location.origin + window.location.pathname);
