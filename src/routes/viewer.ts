import { execSync } from 'child_process';
import { Dirent, lstatSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';

import { Request, Response, Router } from 'express';

import { messageClientsAt } from '../app';
import parse, { pathHeading } from '../parser/parser';
import config from '../parser/config';

export const router = Router();

const liveContent = new Map<string, string>();

const getMimeFromPath = (path: string) =>
    execSync(`file --mime-type -b '${path}'`).toString().trim();

const pageTitle = (path: string) => {
    if (config.pageTitle) return eval(`const path = "${path}"; ${config.pageTitle}`);
    else return join(basename(dirname(path)), basename(path));
};

const formatByFileType = (item: Dirent) => {
    const link = (label: string, classSuffix: string) =>
        `<li class="dir-list-${classSuffix}"><a href="/viewer${join(
            item.path,
            item.name,
        )}">${label}</a></li>`;

    if (item.isDirectory()) return link(`${item.name}/`, 'directory');
    return link(item.name, 'file');
};

router.get(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;

    let body = liveContent.get(path);
    if (!body) {
        try {
            if (lstatSync(path).isDirectory()) {
                const list = readdirSync(path, { withFileTypes: true })
                    .sort((a, b) => +b.isDirectory() - +a.isDirectory())
                    .map((item) => formatByFileType(item))
                    .join('\n');
                body = parse(`${pathHeading(path)}\n\n<ul class="dir-list">\n${list}\n</ul>`);
            } else {
                const data = readFileSync(path);
                const type = getMimeFromPath(path);

                if (!type.startsWith('text/')) {
                    res.setHeader('Content-Type', type).send(data);
                    return;
                }

                body = parse(data.toString(), path);
            }
        } catch {
            res.status(404).send('File not found.');
            return;
        }
    }

    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>${pageTitle(path)}</title>
                <link rel="stylesheet" type="text/css" href="/static/style.css"/>
                <link rel="stylesheet" type="text/css" href="/static/highlight.css">
                <link rel="stylesheet" type="text/css" href="/static/katex/katex.css">
                <style>
                  ${config.styles}
                </style>
            <body>
                <a id="parent-dir" href="/viewer${dirname(path)}">↩</a>
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
        const parsed = parse(content, path);
        liveContent.set(path, parsed);
        messageClientsAt(path, `UPDATE: ${parsed}`);
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
