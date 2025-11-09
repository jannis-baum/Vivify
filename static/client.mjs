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
            const container = document.getElementById('body-content');
            container.innerHTML = value;

            await mermaid.run({ querySelector: '.mermaid' });

            // find & execute <script> tags in updated content to prevent
            // having to hard-reload page for added JS
            const scripts = container.querySelectorAll('script');
            scripts.forEach((script) => {
                // create new script element that is copy of original
                const newScript = document.createElement('script');
                // copy attributes (like type, src, etc.)
                for (let attr of script.attributes) {
                    newScript.setAttribute(attr.name, attr.value);
                }
                // if it's an inline script, copy its content
                if (!script.src) newScript.textContent = script.textContent;

                // replace the old script with the new one to trigger execution
                script.parentNode.replaceChild(newScript, script);
            });
            break;

        case 'SCROLL':
            // remove cursor class from elements that have it
            const cursorElements = document.querySelectorAll('.has-vim-cursor');
            cursorElements.forEach((el) => el.classList.remove('has-vim-cursor'));

            let line = parseInt(value);
            while (line) {
                const targets = document.querySelectorAll(`[data-source-line="${line - 1}"]`);
                if (targets.length) {
                    const target = targets[0];
                    // add cursor class
                    target.classList.add('has-vim-cursor');
                    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    break;
                }
                line -= 1;
            }
            // no element above scroll line found, i.e. scroll to top
            if (!line) window.scrollTo({ top: 0, behavior: 'smooth' });
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

/* --------------------------------------------------------------------------
 * COPY CODE BUTTONS -------------------------------------------------------- */

const clipboard = new ClipboardJS('.copy-button');
clipboard.on('success', (e) => showNotification(e.trigger, '.copy-success'));
clipboard.on('error', (e) => showNotification(e.trigger, '.copy-fail'));

function showNotification(btn, notify) {
    const notificationElement = btn.parentElement.querySelector(notify);
    notificationElement.style.display = 'flex';
    setTimeout(() => {
        notificationElement.style.display = 'none';
    }, 2000);
}
