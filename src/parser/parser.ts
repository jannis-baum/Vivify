import { Dirent, readdirSync } from 'fs';
import { homedir } from 'os';
import { join as pjoin } from 'path';
import { pathToURL } from '../utils/path';
import config from './config';
import renderNotebook from './ipynb';
import renderMarkdown from './markdown';

export type Renderer = (content: string) => string;

const pathHeading: Renderer = (path: string) => `# \`${path.replace(homedir(), '~')}\``;
const wrap = (contentType: string, content: string) =>
    `<div class="content-${contentType}">${content}</div>`;

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

export function renderTextFile(content: string, path: string): string {
    const fileEnding = path?.split('.')?.at(-1);
    const renderInformation = textRenderer(fileEnding);
    if (renderInformation === undefined) {
        return wrap(
            'txt',
            renderMarkdown(`${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${content}\n\`\`\``),
        );
    }
    const { render, contentType } = renderInformation;
    return wrap(contentType, render(content));
}

const dirListItem = (item: Dirent, path: string) =>
    `<li class="dir-list-${item.isDirectory() ? 'directory' : 'file'}"><a href="${pathToURL(
        pjoin(path, item.name),
    )}">${item.name}</a></li>`;

export function renderDirectory(path: string): string {
    const list = readdirSync(path, { withFileTypes: true })
        .sort((a, b) => +b.isDirectory() - +a.isDirectory())
        .map((item) => dirListItem(item, path))
        .join('\n');
    return wrap(
        'directory',
        renderMarkdown(`${pathHeading(path)}\n\n<ul class="dir-list">\n${list}\n</ul>`),
    );
}
