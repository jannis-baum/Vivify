import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import highlight from './highlight';
import graphviz from './dot';
import config from './config';
import { Renderer } from './parser';

const mdit = new MarkdownIt({
    html: true,
    highlight: highlight,
    linkify: true,
});

mdit.use(anchor, {
    permalink: anchor.permalink.ariaHidden({
        placement: 'before',
    }),
});
/* eslint-disable @typescript-eslint/no-var-requires */
mdit.use(require('markdown-it-emoji'));
mdit.use(require('markdown-it-task-lists'));
mdit.use(require('markdown-it-footnote'));
mdit.use(require('markdown-it-inject-linenumbers'));
mdit.use(require('markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: config.katexOptions,
});
mdit.use(require('markdown-it-deflist'));
/* eslint-enable @typescript-eslint/no-var-requires */
mdit.use(graphviz);

const renderMarkdown: Renderer = (content: string) => {
    return mdit.render(content);
};
export default renderMarkdown;
