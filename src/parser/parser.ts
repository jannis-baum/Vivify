import { Dirent, readFileSync, readlinkSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join as pjoin, dirname as pdirname, basename as pbasename } from 'path';
import { pathToURL } from '../utils/path.js';
import config from '../config.js';
import renderNotebook from './ipynb.js';
import renderMarkdown from './markdown.js';
import { globSync } from 'glob';
import octicons from '@primer/octicons';
import * as cheerio from 'cheerio';

const dirIcon = octicons['file-directory-fill'].toSVG({ class: 'icon-directory' });
const fileIcon = octicons['file'].toSVG({ class: 'icon-file' });
const backIcon = octicons['chevron-left'].toSVG({ class: 'icon-chevron' });
const symlinkFileIcon = octicons['file-symlink-file'].toSVG({ class: 'icon-symlink-file' });
const symlinkDestIcon = octicons['arrow-right'].toSVG({ class: 'icon-symlink-dest' });

export type Renderer = (content: string) => string;
export const moveIntoNavClass = 'MOVE-INTO-TOP-NAV';

const pathHeading: Renderer = (path: string) => `# \`${path.replace(homedir(), '~')}\``;

function wrap(contentType: string, content: string, linkPath?: string): string {
    let link = '';
    if (linkPath) {
        link = `<div id="top-nav">
                    <a id="top-nav-up" href="${pathToURL(linkPath)}">
                        ${backIcon}${pbasename(linkPath) || '/'}
                    </a>
                </div>`;
    }
    const html = `<div class="content-${contentType}">${link}\n${content}</div>`;
    // move body elements that want to be in nav bar
    const $ = cheerio.load(html);
    $(`.${moveIntoNavClass}`).each((_, el) => {
        $(el).removeClass(moveIntoNavClass);
        $('#top-nav').append(el);
    });
    return $.html();
}

export function canRenderBody(mime: string) {
    return mime.startsWith('image/') || mime.startsWith('text/') || mime === 'application/json';
}
export function renderBody(
    path: string,
    mime: string,
    // undefined to read from file, string for live reloading
    content: string | undefined = undefined,
): string | undefined {
    // render image file
    if (mime.startsWith('image/')) {
        return wrap(
            'image',
            renderMarkdown(`${pathHeading(path)}\n\n![${path}](<./${pbasename(path)}>)\n`),
            pdirname(path),
        );
    }

    // render text files
    if (mime.startsWith('text/') || mime === 'application/json') {
        const fileEnding = path?.split('.')?.at(-1);
        const text = content ?? readFileSync(path).toString();

        // markdown
        if (fileEnding && config.mdExtensions.includes(fileEnding)) {
            return wrap('markdown', renderMarkdown(text), pdirname(path));
        }

        // jupyter notebook
        if (fileEnding === 'ipynb') {
            return wrap('ipynb', renderNotebook(text), pdirname(path));
        }

        // any other plain text with syntax highlighting
        // remove trailing line break
        const code = text.replace(/\n$/, '');
        return wrap(
            'txt',
            renderMarkdown(`${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${code}\n\`\`\``),
            pdirname(path),
        );
    }
    return undefined;
}

function dirListItem(item: Dirent, path: string): string {
    if (item.isSymbolicLink()) {
        const targetPath = readlinkSync(pjoin(path, item.name));
        const isValid = existsSync(pjoin(path, targetPath));
        return `<li class="dir-list-symlink" name="${item.name}">
                    <a href="${isValid ? pathToURL(pjoin(path, targetPath)) : ''}">
                        ${symlinkFileIcon}${item.name}
                        <span class="dir-list-symlink-dest">
                            ${symlinkDestIcon}${targetPath}
                        </span>
                    </a>
                </li>`;
    } else {
        return `<li class="dir-list-${item.isDirectory() ? 'directory' : 'file'}" name="${item.name}">
                    <a href="${pathToURL(pjoin(path, item.name))}">
                        ${item.isDirectory() ? dirIcon : fileIcon}${item.name}
                    </a>
                </li>`;
    }
}

function dirUpItem(path: string): string {
    if (pbasename(path) == '') {
        return ''; // Show nothing when already at root directory
    }
    return `<li class="dir-list-directory">
                <a href="${pathToURL(pdirname(path))}">
                    ${dirIcon}..
                </a>
            </li>`;
}

export function renderDirectory(path: string): string {
    const list = globSync('*', {
        cwd: path,
        withFileTypes: true,
        ignore: config.dirListIgnore,
        dot: true,
        maxDepth: 1,
    })
        // sort directories first and alphabetically in one combined smart step
        .sort((a, b) => +b.isDirectory() - +a.isDirectory() || a.name.localeCompare(b.name))
        .map((item) => dirListItem(item, path))
        .join('\n');
    return wrap(
        'directory',
        renderMarkdown(
            `${pathHeading(path)}\n\n<ul class="dir-list">\n${dirUpItem(path)}\n${list}\n</ul>`,
        ),
    );
}
