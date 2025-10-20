import { Dirent, readFileSync, readlinkSync, realpathSync, lstatSync } from 'fs';
import { homedir } from 'os';
import { join as pjoin, dirname as pdirname, basename as pbasename, isAbsolute } from 'path';
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
const symlinkDirIcon = octicons['file-submodule'].toSVG({ class: 'icon-symlink-directory' });
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

function renderDirUpItem(cwd: string): string {
    if (pbasename(cwd) == '') {
        return ''; // Show nothing when already at root directory
    }
    return `<li class="dir-list-directory">
                <a href="${pathToURL(pdirname(cwd))}">
                    ${dirIcon}..
                </a>
            </li>`;
}

type DirListItem = {
    name: string;
    isDir: boolean;
    html: string;
};

function makeDirListItem(dirent: Dirent, cwd: string): DirListItem {
    const name = dirent.name;
    const fullPath = pjoin(cwd, name);

    if (!dirent.isSymbolicLink()) {
        const isDir = dirent.isDirectory();
        const html = `<li class="dir-list-${isDir ? 'directory' : 'file'}" name="${name}">
                          <a href="${pathToURL(fullPath)}">
                              ${isDir ? dirIcon : fileIcon}${name}
                          </a>
                      </li>`;

        return { name, isDir, html };
    }

    // The path the symlink is pointing to,
    // not necessarily valid
    const symlinkDest = readlinkSync(fullPath);

    // Handle recursive symlinks
    // Don't let broken symlinks crash the viewer
    let finalDest;
    let isDir = false;
    try {
        finalDest = realpathSync(fullPath);
        isDir = lstatSync(finalDest).isDirectory();
    } catch {
        // Symlink is broken: keep the path for a 404 URL
        finalDest = symlinkDest;
    }

    if (!isAbsolute(finalDest)) {
        finalDest = pjoin(cwd, finalDest);
    }

    const symlinkIcon = isDir ? symlinkDirIcon : symlinkFileIcon;

    const html = `<li class="dir-list-symlink-${isDir ? 'directory' : 'file'}" name="${name}">
                      <a href="${pathToURL(finalDest)}">
                          ${symlinkIcon}${name}
                          <span class="dir-list-symlink-dest">
                              ${symlinkDestIcon}${symlinkDest}
                          </span>
                      </a>
                  </li>`;

    return { name, isDir, html };
}

export function renderDirectory(cwd: string): string {
    const dirListItems = globSync('*', {
        cwd: cwd,
        withFileTypes: true,
        ignore: config.dirListIgnore,
        dot: true,
        maxDepth: 1,
    })
        .map((dirent) => makeDirListItem(dirent, cwd))
        // sort directories first and alphabetically in one combined smart step
        .sort((a, b) => +b.isDir - +a.isDir || a.name.localeCompare(b.name));

    const list = dirListItems.map((item) => item.html).join('\n');

    return wrap(
        'directory',
        renderMarkdown(
            `${pathHeading(cwd)}\n\n<ul class="dir-list">\n${renderDirUpItem(cwd)}\n${list}\n</ul>`,
        ),
    );
}

export function renderErrorPage(statusCode: number, errorMessage: string): string {
    const heading = statusCode === 404 ? 'File not found' : 'Something went wrong';
    return wrap('error', renderMarkdown(`# ${heading} \n\n\`\`\`${errorMessage}\`\`\``));
}
