import { execSync } from 'child_process';
import { homedir } from 'os';
import { basename as pbasename, dirname as pdirname, parse as pparse } from 'path';
import config from '../parser/config.js';

export const pmime = (path: string) => execSync(`file --mime-type -b '${path}'`).toString().trim();

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

export const absPath = (path: string) => path.replace(/^\/~/, homedir()).replace(/\/+$/, '');

export const urlToPath = (url: string) => {
    const path = absPath(decodeURIComponent(url.replace(/^\/(viewer|health)/, '')));
    return path === '' ? '/' : path;
};

export const pathToURL = (path: string, route: string = 'viewer') => {
    const withoutPrefix = path.startsWith('/') ? path.slice(1) : path;
    return `/${route}/${encodeURIComponent(withoutPrefix).replaceAll('%2F', '/')}`;
};

export const preferredPath = (path: string): string =>
    config.preferHomeTilde && path.startsWith(homedir()) ? path.replace(homedir(), '~') : path;

export const isTextFile = (path: string): [boolean, string] => {
    const type = pmime(path);
    return [type.startsWith('text/') || type === 'application/json', type];
};
