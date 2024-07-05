import { Dirent, lstatSync, readdirSync, readFileSync } from 'fs';
import { dirname as pdirname, join as pjoin } from 'path';

import { Request, Response, Router } from 'express';

import { messageClientsAt } from '../app';
import config from '../parser/config';
import renderMarkdown from '../parser/markdown';
import { pathToURL, pcomponents, pmime } from '../utils/path';
import renderFile, { pathHeading } from '../parser/parser';

export const router = Router();

const liveContent = new Map<string, string>();

const pageTitle = (path: string) => {
    const comps = pcomponents(path);
    if (config.pageTitle) {
        return eval(`
            const components = ${JSON.stringify(comps)};
            ${config.pageTitle};
        `);
    } else return pjoin(...comps.slice(-2));
};

const dirListItem = (item: Dirent, path: string) =>
    `<li class="dir-list-${item.isDirectory() ? 'directory' : 'file'}"><a href="${pathToURL(
        pjoin(path, item.name),
    )}">${item.name}</a></li>`;

router.get(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;

    let body = liveContent.get(path);
    if (!body) {
        try {
            if (lstatSync(path).isDirectory()) {
                const list = readdirSync(path, { withFileTypes: true })
                    .sort((a, b) => +b.isDirectory() - +a.isDirectory())
                    .map((item) => dirListItem(item, path))
                    .join('\n');
                body = renderMarkdown(
                    `${pathHeading(path)}\n\n<ul class="dir-list">\n${list}\n</ul>`,
                );
            } else {
                const data = readFileSync(path);
                const type = pmime(path);

                if (!type.startsWith('text/')) {
                    res.setHeader('Content-Type', type).send(data);
                    return;
                }

                body = renderFile(data.toString(), path);
            }
        } catch {
            res.status(404).send('File not found.');
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
                <link rel="stylesheet" type="text/css" href="/static/style.css"/>
                <link rel="stylesheet" type="text/css" href="/static/highlight.css">
                <link rel="stylesheet" type="text/css" href="/static/katex/katex.css">
                <style>
                  ${config.styles}
                </style>
            <body>
                <a id="parent-dir" href="${pathToURL(pdirname(path))}">↩</a>
                <div id="body-content">
                    ${body}
                </div>
            </body>
            <script>
                window.VIV_PORT = "${process.env['VIV_PORT']}";
                window.VIV_PATH = "${req.path}";
            </script>
            <script type="text/javascript" src="/static/client.js"></script>
        </html>
    `);
});

router.post(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;
    const { content, cursor } = req.body;

    if (content) {
        const rendered = renderFile(content, path);
        liveContent.set(path, rendered);
        messageClientsAt(path, `UPDATE: ${rendered}`);
    }
    if (cursor) messageClientsAt(path, `SCROLL: ${cursor}`);

    res.end();
});

router.delete(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    if (path === '/') {
        const paths = [...liveContent.keys()];
        liveContent.clear();
        paths.forEach((path) => messageClientsAt(path, 'RELOAD: 1'));
    } else {
        liveContent.delete(path) && messageClientsAt(path, 'RELOAD: 1');
    }
    res.end();
});
