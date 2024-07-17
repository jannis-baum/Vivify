import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import highlight from './highlight.js';
import graphviz from './dot.js';
import config from './config.js';
import { Renderer } from './parser.js';

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
mdit.use(graphviz);

// MARK: markdown-it plugins that don't have types; unfortunately we can't
// ts-expect-error for blocks so this is ugly:
// https://github.com/Microsoft/TypeScript/issues/19573

/* @ts-expect-error: markdown-it modules aren't typed */
import { full as emoji } from 'markdown-it-emoji';
mdit.use(emoji);
/* @ts-expect-error: markdown-it modules aren't typed */
import taskLists from 'markdown-it-task-lists';
mdit.use(taskLists);
/* @ts-expect-error: markdown-it modules aren't typed */
import footNote from 'markdown-it-footnote';
mdit.use(footNote);
/* @ts-expect-error: markdown-it modules aren't typed */
import lineNumbers from 'markdown-it-inject-linenumbers';
mdit.use(lineNumbers);
/* @ts-expect-error: markdown-it modules aren't typed */
import texMath from 'markdown-it-texmath';
/* @ts-expect-error: markdown-it modules aren't typed */
import katex from 'katex';
mdit.use(texMath, {
    engine: katex,
    delimiters: 'dollars',
    katexOptions: config.katexOptions,
});
/* @ts-expect-error: markdown-it modules aren't typed */
import defList from 'markdown-it-deflist';
mdit.use(defList);
/* @ts-expect-error: markdown-it modules aren't typed */
import sub from 'markdown-it-sub';
mdit.use(sub);
/* @ts-expect-error: markdown-it modules aren't typed */
import sup from 'markdown-it-sup';
mdit.use(sup);
/* @ts-expect-error: markdown-it modules aren't typed */
import mark from 'markdown-it-mark';
mdit.use(mark);

const renderMarkdown: Renderer = (content: string) => {
    return mdit.render(content);
};
export default renderMarkdown;
