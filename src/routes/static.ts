import { Router } from 'express';
import { readFile } from 'fs/promises';
import { dirname as pdirname, join as pjoin } from 'path';

export const router = Router();

class StaticProvider {
    private static instance = new StaticProvider();

    private _content: (path: string) => Promise<Buffer>;

    private constructor() {
        this._content = (path) =>
            this._contentDev(pjoin(pdirname(pdirname(__dirname)), 'static'), path);
    }

    private async _contentDev(staticDir: string, path: string): Promise<Buffer> {
        return readFile(pjoin(staticDir, path));
    }

    static async content(path: string): Promise<Buffer> {
        return StaticProvider.instance._content(path);
    }

    static mime(path: string): string {
        if (path.endsWith('.css')) return 'text/css';
        if (path.endsWith('.js')) return 'text/javascript';
        if (path.endsWith('.ttf')) return 'font/ttf';
        if (path.endsWith('.woff2')) return 'font/woff2';
        throw new Error('Unknown MIME type');
    }
}

router.get(/.*/, async (req, res) => {
    const path = req.path;

    try {
        res.type(StaticProvider.mime(path));
        res.send(await StaticProvider.content(path));
    } catch {
        res.status(404).send('File not found.');
    }
});
