import { Request, Response, Router } from "express";
import { readFileSync } from "fs";
import { Converter } from "showdown";

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
        let ws = new WebSocket("ws://localhost:${process.env['PORT']}");
        ws.addEventListener("open", (event) => {
            ws.send("PATH: ${req.path}");
        });
        ws.addEventListener("message", (event) => {
            console.log("Message from server ", event.data);
        });
    </script>
</html>
        `);
    } catch {
        res.status(400);
        res.send('File not found.');
    }
})
