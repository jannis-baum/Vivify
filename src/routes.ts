import { Request, Response, Router } from "express";
import { readFileSync } from "fs";
import { Converter } from "showdown";
import { messageClientsAt } from "./app";

export const router = Router()

const converter = new Converter();
converter.setFlavor('github');

router.get(/.*/, async (req: Request, res: Response) => {
    try {
        const content = readFileSync(req.path).toString();
        res.send(`
<html>
    <body>
        ${converter.makeHtml(content)}
    </body>
    <script>
        window.MKPV_PORT = "${process.env['PORT']}"
        window.MKPV_PATH = "${req.path}"
    </script>
    <script type="text/javascript" src="/static/client.js"></script>
</html>
        `);
    } catch {
        res.status(404).send('File not found.');
    }
})

router.post(/.*/, async (req: Request, res: Response) => {
    const path = req.path;
    const { content, cursor } = req.body;
    messageClientsAt(path, content);
    res.end();
})
