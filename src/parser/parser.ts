import { homedir } from 'os';
import config from './config';
import renderNotebook from './ipynb';
import renderMarkdown from './markdown';

export type Renderer = (content: string) => string;

export const pathHeading: Renderer = (path: string) => `# \`${path.replace(homedir(), '~')}\``;

const mdExtensions = config.mdExtensions ?? ['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn'];
function renderer(fileEnding: string | undefined): Renderer | undefined {
    if (!fileEnding) return undefined;
    if (mdExtensions.includes(fileEnding)) return renderMarkdown;
    if (fileEnding === 'ipynb') return renderNotebook;
}

export default function renderFile(content: string, path: string): string {
    const fileEnding = path?.split('.')?.at(-1);
    const render = renderer(fileEnding);
    if (render) return render(content);
    return renderMarkdown(`${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${content}\n\`\`\``);
}
