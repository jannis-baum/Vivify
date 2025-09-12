import { lstatSync, readFileSync } from 'fs';
import { join as pjoin } from 'path';
import { homedir } from 'os';

import { Request, Response, Router } from 'express';

import { clientsAt, messageClients } from '../app.js';
import config from '../config.js';
import { pcomponents, pmime, preferredPath, urlToPath } from '../utils/path.js';
import { renderDirectory, renderBody, canRenderBody } from '../parser/parser.js';

export const router = Router();

const liveContent = new Map<string, string>();

const pageTitle = (path: string) => {
    const comps = pcomponents(preferredPath(path));
    if (config.pageTitle) {
        return eval(`
            const components = ${JSON.stringify(comps)};
            ${config.pageTitle};
        `);
    } else return pjoin(...comps.slice(-2));
};

function vivClient(req: Request) {
    return `<script>
        window.VIV_PORT = "${config.port}";
        window.VIV_PATH = "${urlToPath(req.path)}";
    </script>
    <script type="module" src="/static/client.mjs"></script>
    <script type="text/javascript" src="/static/clipboard/clipboard.min.js"></script>`;
}

if (config.preferHomeTilde) {
    router.use((req, res, next) => {
        if (req.method === 'GET' && req.path.startsWith(homedir())) {
            res.redirect(req.originalUrl.replace(homedir(), '/~'));
        } else {
            next();
        }
    });
}

router.get(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;

    let body = liveContent.get(path);
    if (!body) {
        try {
            if (lstatSync(path).isDirectory()) {
                body = renderDirectory(path);
            } else {
                const mime = await pmime(path);
                const shouldRenderBody = (() => {
                    // config says render HTML as is and this is HTML -> no Vivify body rendering
                    if (config.renderHTML && mime === 'text/html') return false;
                    // Vivify rendering if request wants HTML reply
                    return (req.get('Accept') ?? '').split(',').includes('text/html');
                })();

                if (mime === undefined) throw 'Unable to determine MIME type';
                if (shouldRenderBody) body = renderBody(path, mime);
                // shouldn't render body or failed to render -> send file data instead
                if (!body || !shouldRenderBody) {
                    const data = readFileSync(path);
                    if (mime === 'text/html') {
                        // Inject Vivify client script
                        let html = data.toString();
                        // If there's one closing tag for the body we add the
                        // Vivify client script to the end of the body. If not
                        // then we try to just add it to the end of the
                        // document.
                        const bodyEndCount = (html.match(/<\/body>/g) || []).length;
                        if (bodyEndCount === 1) {
                            html = html.replace('</body>', `${vivClient(req)}</body>`);
                        } else {
                            html = html + vivClient(req);
                        }
                        res.send(html);
                    } else {
                        res.setHeader('Content-Type', mime).send(data);
                    }
                    return;
                }
            }
        } catch (error) {
            res.status(500).send(String(error));
            return;
        }
    }

    let title = 'custom title error';
    try {
        title = pageTitle(path);
    } catch (error) {
        body = `Error evaluating custom page title: ${error as string}`;
    }

    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>${title}</title>
                <link rel="stylesheet" type="text/css" href="/static/colors.css"/>
                <link rel="stylesheet" type="text/css" href="/static/style.css"/>
                <link rel="stylesheet" type="text/css" href="/static/markdown.css"/>
                <link rel="stylesheet" type="text/css" href="/static/highlight.css">
                <link rel="stylesheet" type="text/css" href="/static/ipynb.css">
                <link rel="stylesheet" type="text/css" href="/static/katex/katex.css">
                ${config.styles ? `<style type="text/css">${config.styles}</style>` : ''}
            <body>
                <div id="body-content">
                    ${body}
                </div>
            </body>

            ${vivClient(req)}
            ${config.scripts ? `<script type="text/javascript">${config.scripts}</script>` : ''}
        </html>
    `);
});

// POST:
// - `cursor`: scroll to corresponding line in source file (only works in markdown)
// - `content`: set content for live viewer
// - `reload`:
//   - for live-reloadable files, set live content to file content (overwrites `content`)
//   - for non-live-reloadable files, hard-reload page
router.post(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;
    const { cursor, reload } = req.body;
    let { content } = req.body;

    const mime = await pmime(path);
    if (!mime) {
        res.status(500).send('Unable to determine MIME type');
        return;
    }
    const isLiveReloadable = !(config.renderHTML && mime === 'text/html') && canRenderBody(mime);
    const messages = Array<string>();

    if (reload === true) {
        if (isLiveReloadable) {
            // get content from file for soft-reload below
            content = readFileSync(path).toString();
        } else {
            // hard-reload
            messages.push('RELOAD: 1');
        }
    }

    // soft-reload content
    if (content !== undefined) {
        if (!isLiveReloadable) {
            res.status(400).send('Live content is not permitted');
            return;
        }
        const rendered = renderBody(path, mime, content);
        if (!rendered) {
            res.status(500).send('Failed to render live content');
            return;
        }
        liveContent.set(path, rendered);
        messages.push(`UPDATE: ${rendered}`);
    }

    if (cursor !== undefined) {
        messages.push(`SCROLL: ${cursor}`);
    }

    const clients = clientsAt(path);
    messages.forEach((message) => messageClients(clients, message));
    res.send({ clients: clients.length });
});

router.delete(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    let clientCount = 0;

    if (path === '/') {
        const paths = [...liveContent.keys()];
        liveContent.clear();
        clientCount = paths.reduce<number>((count, path) => {
            const clients = clientsAt(path);
            messageClients(clients, 'RELOAD: 1');
            return count + clients.length;
        }, 0);
    } else {
        const clients = clientsAt(path);
        if (liveContent.delete(path)) {
            messageClients(clients, 'RELOAD: 1');
            clientCount = clients.length;
        }
    }
    res.send({ clients: clientCount });
});
