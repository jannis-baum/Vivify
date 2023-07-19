import express, { Application , Request, Response} from 'express';
import { readFileSync } from 'fs';

const app: Application = express()

const port: number = 31622

app.get(/.*/, async (req: Request, res: Response) => {
    try {
        const content = readFileSync(req.path).toString();
        res.send(content)
    } catch {
        res.status(400);
        res.send('File not found.');
    }
})

app.listen(port, function () {
    console.log(`App is listening on port ${port} !`)
})
