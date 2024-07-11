import { homedir } from 'os';
import config from './config';
import renderNotebook from './ipynb';
import renderMarkdown from './markdown';

export type Renderer = (content: string) => string;

export const pathHeading: Renderer = (path: string) => `# \`${path.replace(homedir(), '~')}\``;

const mdExtensions = config.mdExtensions ?? ['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn'];
function renderer(
    fileEnding: string | undefined,
): { render: Renderer; contentType: string } | undefined {
    if (!fileEnding) return undefined;
    if (mdExtensions.includes(fileEnding)) {
        return { render: renderMarkdown, contentType: 'markdown' };
    }
    if (fileEnding === 'ipynb') {
        return { render: renderNotebook, contentType: 'ipynb' };
    }
}

export default function renderTextFile(content: string, path: string): string {
    const fileEnding = path?.split('.')?.at(-1);
    const renderInformation = renderer(fileEnding);
    if (renderInformation === undefined) {
        return renderMarkdown(`${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${content}\n\`\`\``);
    }
    const { render, contentType } = renderInformation;
    return `<div class="content-${contentType}">${render(content)}</div>`;
}
