import { Router } from 'express';
import { readFile } from 'fs/promises';
import { dirname as pdirname, join as pjoin } from 'path';

/* eslint-disable @typescript-eslint/no-var-requires */
const { isSea } = require('node:sea');
/* eslint-enable @typescript-eslint/no-var-requires */

export const router = Router();

class StaticProvider {
    private static instance = new StaticProvider();

    private _content: (path: string) => Promise<Buffer>;

    private constructor() {
        if (isSea()) {
            this._content = this._contentProd;
        } else {
            this._content = (path) =>
                this._contentDev(pjoin(pdirname(pdirname(__dirname)), 'static'), path);
        }
    }

    private async _contentDev(staticDir: string, path: string): Promise<Buffer> {
        return readFile(pjoin(staticDir, path));
    }

    private async _contentProd(path: string): Promise<Buffer> {
        throw new Error('Not implemented' + path);
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
