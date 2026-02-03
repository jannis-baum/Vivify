import { homedir } from 'os';
import { basename as pbasename, dirname as pdirname, parse as pparse, extname, sep } from 'path';
import config from '../config.js';
import { isText } from 'istextorbinary';
import { readFileSync } from 'fs';
import { fileTypeFromBuffer } from 'file-type';

// Platform detection
export const isWindows = process.platform === 'win32';

export const pextension = (path: string) => extname(path).slice(1);

export const isMarkdown = (path: string) => {
    const extension = pextension(path);
    if (config.mdExtensions.includes(extension)) return true;
    if (config.mdFilePatterns.some((exp) => exp.test(path))) return true;
    return false;
};

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
    if (isMarkdown(path)) {
        return 'text/plain';
    }
    const content = readFileSync(path);
    if (isText(path, content)) {
        return relevantPlainTextMIMEs.get(pextension(path)) ?? 'text/plain';
    }
    return (await fileTypeFromBuffer(content))?.mime;
};

// Check if a path is absolute on any platform
export const isAbsolutePath = (path: string): boolean => {
    if (isWindows) {
        // Windows: C:\ or C:/ or \\ (UNC)
        return /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('\\\\');
    }
    return path.startsWith('/');
};

export const pcomponents = (path: string) => {
    const parsed = pparse(path);
    const components = new Array<string>();
    // directory
    let dir = parsed.dir;
    // Handle both Unix and Windows root detection
    while (dir !== '/' && dir !== '.' && dir !== '' && !(/^[a-zA-Z]:[\\/]?$/.test(dir))) {
        components.unshift(pbasename(dir));
        dir = pdirname(dir);
    }
    // root
    if (parsed.root !== '') {
        // On Windows, normalize root to use forward slash for consistency in URLs
        components.unshift(parsed.root.replace(/\\$/, '/'));
    }
    // base
    if (parsed.base !== '') components.push(parsed.base);
    return components;
};

export const urlToPath = (url: string) => {
    // First, decode the URL and remove the route prefix
    let path = decodeURIComponent(url.replace(/^\/(viewer|health)/, ''));
    
    // Handle tilde home directory shortcut
    path = path.replace(/^\/~/, homedir());
    
    // Remove trailing slashes
    path = path.replace(/\/+$/, '');

    // On Windows, URLs come in as /C:/path/to/file
    // We need to remove the leading slash before the drive letter
    if (isWindows) {
        // Match /C:/ or /c:/ pattern at the start
        const windowsDriveMatch = path.match(/^\/([a-zA-Z]:)(.*)$/);
        if (windowsDriveMatch) {
            // Return C:/path/to/file (with forward slashes, Node.js handles both)
            path = windowsDriveMatch[1] + windowsDriveMatch[2];
        }
    }

    return path === '' ? (isWindows ? 'C:/' : '/') : path;
};

export const pathToURL = (path: string, route: string = 'viewer') => {
    let normalizedPath = path;
    
    // On Windows, convert backslashes to forward slashes for URLs
    if (isWindows) {
        normalizedPath = path.replace(/\\/g, '/');
    }
    
    // Remove leading slash for POSIX paths
    const withoutPrefix = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
    
    // Encode the path, but keep forward slashes readable
    // Also keep colons unencoded for Windows drive letters
    return `/${route}/${encodeURIComponent(withoutPrefix).replaceAll('%2F', '/').replaceAll('%3A', ':')}`;
};

export const preferredPath = (path: string): string =>
    config.preferHomeTilde && path.startsWith(homedir()) ? path.replace(homedir(), '~') : path;
