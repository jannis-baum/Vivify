import { Dirent } from 'fs';
import { homedir } from 'os';
import { join as pjoin, dirname as pdirname, basename as pbasename } from 'path';
import { pathToURL } from '../utils/path.js';
import config from './config.js';
import renderNotebook from './ipynb.js';
import renderMarkdown from './markdown.js';
import { globSync } from 'glob';

export type Renderer = (content: string) => string;

const pathHeading: Renderer = (path: string) => `# \`${path.replace(homedir(), '~')}\``;

function wrap(contentType: string, content: string, linkPath?: string): string {
    let link = '';
    if (linkPath) {
        link = `\n<div id="top-nav">\n<a id="top-nav-up" href="${pathToURL(linkPath)}"> ${
            pbasename(linkPath) || '/'
        }</a>\n</div>`;
    }
    return `<div class="content-${contentType}">${link}\n${content}</div>`;
}

function textRenderer(
    fileEnding: string | undefined,
): { render: Renderer; contentType: string } | undefined {
    if (!fileEnding) return undefined;
    if (config.mdExtensions.includes(fileEnding)) {
        return { render: renderMarkdown, contentType: 'markdown' };
    }
    if (fileEnding === 'ipynb') {
        return { render: renderNotebook, contentType: 'ipynb' };
    }
}

export const shouldRender = (mime: string): boolean =>
    mime.startsWith('text/') || mime === 'application/json';

export function renderTextFile(content: string, path: string): string {
    const fileEnding = path?.split('.')?.at(-1);
    const renderInformation = textRenderer(fileEnding);
    if (renderInformation === undefined) {
        return wrap(
            'txt',
            renderMarkdown(`${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${content}\n\`\`\``),
            pdirname(path),
        );
    }
    const { render, contentType } = renderInformation;
    return wrap(contentType, render(content), pdirname(path));
}

const dirListItem = (item: Dirent, path: string) =>
    `<li class="dir-list-${item.isDirectory() ? 'directory' : 'file'}" name="${item.name}"><a href="${pathToURL(
        pjoin(path, item.name),
    )}">${item.name}</a></li>`;

function dirUpItem(path: string): string {
    if (pbasename(path) == '') {
        return ''; // Show nothing when already at root directory
    }
    return `<li class="dir-list-directory"><a href="${pathToURL(pdirname(path))}">.. (${pbasename(pdirname(path)) || '/'})</a></li>`;
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
