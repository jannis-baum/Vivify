import { Router } from 'express';
import { writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import StreamZip from 'node-stream-zip';
import { getAsset, isSea } from 'node:sea';
import { dirname as pdirname, join as pjoin } from 'path';
import tmp from 'tmp';
import { fileURLToPath } from 'url';

tmp.setGracefulCleanup();

export const router = Router();

class StaticProvider {
    private static instance = new StaticProvider();

    private _content: (path: string) => Promise<Buffer>;

    private constructor() {
        if (isSea()) {
            const assets = getAsset('static.zip');
            const buffer = Buffer.from(assets);

            const archiveFile = tmp.fileSync({ postfix: '.zip' }).name;
            writeFileSync(archiveFile, buffer);
            const zip = new StreamZip.async({ file: archiveFile });

            this._content = (path) => zip.entryData(`static${path}`);
        } else {
            const staticDir = pjoin(
                pdirname(pdirname(pdirname(fileURLToPath(import.meta.url)))),
                'static',
            );
            this._content = (path) => readFile(pjoin(staticDir, path));
        }
    }

    static async content(path: string): Promise<Buffer> {
        return StaticProvider.instance._content(path);
    }

    static mime(path: string): string {
        if (path.endsWith('.css')) return 'text/css';
        if (path.endsWith('.js')) return 'text/javascript';
        if (path.endsWith('.mjs')) return 'text/javascript';
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
