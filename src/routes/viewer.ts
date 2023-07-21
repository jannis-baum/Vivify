import { execSync } from "child_process";
import { Request, Response, Router } from "express";
import { readFileSync } from "fs";
import { Converter } from "showdown";

import { messageClientsAt } from "../app";

export const router = Router()

const converter = new Converter();
converter.setFlavor('github');
converter.setOption('simpleLineBreaks', false);

const liveContent = new Map<string, string>()

const getMimeFromPath = (path: string) =>
    execSync(`file --mime-type -b '${path}'`).toString().trim();

router.get(/.*/, async (req: Request, res: Response) => {
    const path = req.path.replace(/^.*~/, process.env['HOME']!);

    let body = liveContent.get(path);
    if (!body) {
        try {
            const data = readFileSync(path);
            const type = getMimeFromPath(path);

            if (type !== 'text/plain') {
                res.setHeader('Content-Type', type).send(data);
                return;
            }

            body = converter.makeHtml(data.toString());
        } catch {
            res.status(404).send('File not found.');
            return;
        }
    }

    res.send(`
        <html>
            <body>${body}</body>
            <script>
                window.MKPV_PORT = "${process.env['MKPV_PORT']}";
                window.MKPV_PATH = "${req.path}";
            </script>
            <script type="text/javascript" src="/static/client.js"></script>
        </html>
    `);
})

router.post(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    const { content, cursor } = req.body;

    const parsed = converter.makeHtml(content);
    liveContent.set(path, parsed);

    messageClientsAt(path, `UPDATE: ${parsed}`);
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
