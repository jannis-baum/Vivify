import { execSync } from "child_process";
import { Request, Response, Router } from "express";
import { readFileSync } from "fs";

import { messageClientsAt } from "../app";
import mdParse from "../mdit";

export const router = Router()

const liveContent = new Map<string, string>()

const getMimeFromPath = (path: string) =>
    execSync(`file --mime-type -b '${path}'`).toString().trim();

router.get(/.*/, async (req: Request, res: Response) => {
    const path = res.locals.filepath;

    let body = liveContent.get(path);
    if (!body) {
        try {
            const data = readFileSync(path);
            const type = getMimeFromPath(path);

            if (type !== 'text/plain') {
                res.setHeader('Content-Type', type).send(data);
                return;
            }

            body = mdParse(data.toString());
        } catch {
            res.status(404).send('File not found.');
            return;
        }
    }

    res.send(`
        <html>
            <head><link rel="stylesheet" type="text/css" href="/static/style.css"/></head>
            <body>${body}</body>
            <script>
                window.VIV_PORT = "${process.env['VIV_PORT']}";
                window.VIV_PATH = "${req.path}";
            </script>
            <script type="text/javascript" src="/static/client.js"></script>
        </html>
    `);
})

router.post(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    const { content, cursor } = req.body;

    if (content) {
        const parsed = mdParse(content);
        liveContent.set(path, parsed);
        messageClientsAt(path, `UPDATE: ${parsed}`);
    }
    if (cursor) messageClientsAt(path, `SCROLL: ${cursor}`);

    res.end();
})

router.delete(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    if (path === '/') {
        const paths = [...liveContent.keys()]
        liveContent.clear();
        paths.forEach((path) => messageClientsAt(path, 'RELOAD: 1'));
    }
    else {
        liveContent.delete(path) && messageClientsAt(path, 'RELOAD: 1');
    }
    res.end();
});
