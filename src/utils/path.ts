import { homedir } from 'os';
import { basename as pbasename, dirname as pdirname, parse as pparse, extname } from 'path';
import config from '../config.js';
import { isText } from 'istextorbinary';
import { readFileSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

const relevantPlainTextMIMEs = new Map<string, string>([
    ['html', 'text/html'],
    ['js', 'text/javascript'],
    ['mjs', 'text/javascript'],
    ['css', 'text/css'],
    ['json', 'application/json'],
    ['svg', 'image/svg+xml'],
]);
// returns
// - hopefully correct MIME for binary files based on magic number,
// - extension-based MIME from the table above for plain text files we do need
//   correct MIME types for
// - text/plain for all other plain text files that only need to be rendered as
//   code
export const pmime = async (path: string) => {
    const ext = extname(path).slice(1);
    if (config.mdExtensions.includes(ext)) {
        return 'text/plain';
    }
    const content = readFileSync(path);
    if (isText(path, content)) {
        return relevantPlainTextMIMEs.get(ext) ?? 'text/plain';
    }
    return (await fileTypeFromBuffer(content))?.mime;
};

export const pcomponents = (path: string) => {
    const parsed = pparse(path);
    const components = new Array<string>();
    // directory
    let dir = parsed.dir;
    while (dir !== '/' && dir !== '.') {
        components.unshift(pbasename(dir));
        dir = pdirname(dir);
    }
    // root
    if (parsed.root !== '') components.unshift(parsed.root);
    // base
    if (parsed.base !== '') components.push(parsed.base);
    return components;
};

export const urlToPath = (url: string) => {
    const path = decodeURIComponent(url.replace(/^\/(viewer|health)/, ''))
        .replace(/^\/~/, homedir())
        .replace(/\/+$/, '');
    return path === '' ? '/' : path;
};

export const pathToURL = (path: string, route: string = 'viewer') => {
    const withoutPrefix = path.startsWith('/') ? path.slice(1) : path;
    return `/${route}/${encodeURIComponent(withoutPrefix).replaceAll('%2F', '/')}`;
};

export const preferredPath = (path: string): string =>
    config.preferHomeTilde && path.startsWith(homedir()) ? path.replace(homedir(), '~') : path;
