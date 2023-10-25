import { homedir } from 'os';

import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import highlight from './highlight';
import graphviz from './dot';

const mdit = new MarkdownIt({
    html: true,
    highlight: highlight,
});

mdit.use(anchor, {
    permalink: anchor.permalink.ariaHidden({
        placement: 'before',
    }),
});
/* eslint-disable @typescript-eslint/no-var-requires */
mdit.use(require('markdown-it-emoji'));
mdit.use(require('markdown-it-task-lists'));
mdit.use(require('markdown-it-inject-linenumbers'));
mdit.use(require('markdown-it-texmath'), {
	engine: require('katex'),
	delimiters: 'dollars',
	katexOptions: { errorColor: '#cc0000', macros: { '\\RR': '\\mathbb{R}' } }
});
/* eslint-enable @typescript-eslint/no-var-requires */
mdit.use(graphviz);

export const pathHeading = (path: string) => `# \`${path.replace(homedir(), '~')}\``;

export default function parse(src: string, path?: string) {
    let md = src;

    const fileEnding = path?.split('.')?.at(-1);
    if (fileEnding && fileEnding !== 'md') {
        md = `${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${src}\n\`\`\``;
    }

    return mdit.render(md);
}
