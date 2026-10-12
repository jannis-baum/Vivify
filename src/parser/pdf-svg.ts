import { readFileSync, statSync } from 'fs';
import { getAsset, isSea } from 'node:sea';

// The packaged single-executable build has no wasm file on disk, so we embed it
// as a SEA asset (see sea-config.json) and hand the bytes to mupdf's Emscripten
// module via this global, which it reads when first loaded. In dev mupdf finds
// the file in node_modules itself, so we only step in for the SEA build.
if (isSea()) {
    (globalThis as { $libmupdf_wasm_Module?: unknown }).$libmupdf_wasm_Module = {
        wasmBinary: new Uint8Array(getAsset('mupdf-wasm.wasm')),
        // even with the binary provided, mupdf still resolves a wasm path via
        // `new URL(..., import.meta.url)`, which is invalid in the bundle; this
        // hook short-circuits that so it just uses the bytes above.
        locateFile: (name: string) => name,
    };
}
// mupdf initializes its wasm with a top-level await, which would make the whole
// startup import graph async and stop the SEA build from ever reaching
// server.listen. So we load it lazily on the first render instead.
let mupdfModule: typeof import('mupdf') | undefined;
async function loadMupdf() {
    if (!mupdfModule) mupdfModule = await import(/* webpackMode: "eager" */ 'mupdf');
    return mupdfModule;
}

const cache = new Map<string, string>();

export async function renderPdfPageToSvg(path: string): Promise<string> {
    const key = `${path}:${statSync(path).mtimeMs}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const mupdf = await loadMupdf();
    const doc = mupdf.Document.openDocument(readFileSync(path), 'application/pdf');
    const page = doc.loadPage(0);
    const out = new mupdf.Buffer();
    const writer = new mupdf.DocumentWriter(out, 'svg', '');

    const device = writer.beginPage(page.getBounds());
    page.run(device, mupdf.Matrix.identity);
    device.close();
    writer.endPage();
    writer.close();

    const svg = out.asString();

    device.destroy();
    writer.destroy();
    page.destroy();
    doc.destroy();
    out.destroy();

    cache.set(key, svg);
    return svg;
}
