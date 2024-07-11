import { execSync } from 'child_process';
import { homedir } from 'os';
import { basename as pbasename, dirname as pdirname, parse as pparse } from 'path';

export const pmime = (path: string) => execSync(`file --mime-type -b '${path}'`).toString().trim();

export const pcomponents = (path: string) => {
    const parsed = pparse(path);
    const components = new Array<string>();
    // directory
    let dir = parsed.dir;
    while (dir !== '/' && dir !== '') {
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

export const pathToURL = (path: string, route: string = 'viewer') =>
    `/${route}${encodeURIComponent(path).replaceAll('%2F', '/')}`;
