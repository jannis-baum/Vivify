/* --------------------------------------------------------------------------
 * MERMAID ------------------------------------------------------------------ */

import mermaid from '/static/mermaid/mermaid.esm.min.mjs';

const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
mermaid.initialize({ startOnLoad: true, theme: darkModePreference.matches ? 'dark' : 'default' });

function updateTheme() {
    if (document.getElementsByClassName('mermaid').length > 0) {
        window.location.reload();
    }
}
try {
    darkModePreference.addEventListener('change', () => updateTheme());
} catch {
    try {
        // deprecated method for backward compatibility
        darkModePreference.addEventListener(() => updateTheme());
    } catch {}
}

/* --------------------------------------------------------------------------
 * WEBSOCKET COMMUNICATION WITH SERVER -------------------------------------- */

const ws = new WebSocket(`ws://localhost:${window.VIV_PORT}`);

ws.addEventListener('message', async (event) => {
    const fields = event.data.toString().split(': ');
    if (fields.length < 2) return;
    const [key, ...values] = fields;
    const value = values.join(': ');

    switch (key) {
        case 'UPDATE':
            document.getElementById('body-content').innerHTML = value;
            await mermaid.run({ querySelector: '.mermaid' });
            break;

        case 'SCROLL':
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
            break;

        case 'RELOAD':
            window.location.reload();
            break;

        case 'PRINT':
            console.log(value);
            break;
    }
});

ws.addEventListener('open', () => {
    ws.send(`PATH: ${window.VIV_PATH}`);
});
