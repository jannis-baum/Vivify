import { homedir } from 'os';
import fs from 'fs';

import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import highlight from './highlight';
import graphviz from './dot';

const katexConfigPath = `${homedir()}/.vivify/katex_config.json`;
let katexConfig = {};
if (fs.existsSync(katexConfigPath)) {
    katexConfig = JSON.parse(fs.readFileSync(katexConfigPath, 'utf8'));
}

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
    katexOptions: katexConfig,
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
