import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import copycode from './copycode.js';
import frontMatter from 'markdown-it-front-matter';
import highlight from './highlight.js';
import graphviz from './dot.js';
import mermaid from './mermaid.js';
import wikiLinks from './wiki-links.js';
import githubAlerts from 'markdown-it-github-alerts';
import config from '../config.js';
import { Renderer } from './parser.js';

const mdit = new MarkdownIt({
    html: true,
    highlight: highlight,
    linkify: true,
});

// MARK: markdown-it plugins that don't have types; unfortunately we can't
// ts-expect-error for blocks so this is ugly:
// https://github.com/Microsoft/TypeScript/issues/19573

/* @ts-expect-error: module not typed */
import { full as emoji } from 'markdown-it-emoji';
mdit.use(emoji);
/* @ts-expect-error: module not typed */
import taskLists from 'markdown-it-task-lists';
mdit.use(taskLists);
/* @ts-expect-error: module not typed */
import footNote from 'markdown-it-footnote';
mdit.use(footNote);
/* @ts-expect-error: most module not typed */
import lineNumbers from 'markdown-it-inject-linenumbers';
mdit.use(lineNumbers);
/* @ts-expect-error: module not typed */
import texMath from 'markdown-it-texmath';
/* @ts-expect-error: module not typed */
import defList from 'markdown-it-deflist';
mdit.use(defList);
/* @ts-expect-error: module not typed */
import sub from 'markdown-it-sub';
mdit.use(sub);
/* @ts-expect-error: module not typed */
import sup from 'markdown-it-sup';
mdit.use(sup);
/* @ts-expect-error: module not typed */
import mark from 'markdown-it-mark';
mdit.use(mark);
/* @ts-expect-error: module not typed */
import attributes from 'markdown-it-attrs';
mdit.use(attributes);
/* @ts-expect-error: module not typed */
import toc from 'markdown-it-table-of-contents';
mdit.use(toc, config.tocOptions);

// MARK: untyped plugins done

import katex from 'katex';
mdit.use(texMath, {
    engine: katex,
    delimiters: 'dollars',
    katexOptions: config.katexOptions,
});
// markdown-it-front-matter requires a callback function but we aren’t doing
// anything with it, so we just pass in a noop.
mdit.use(frontMatter, () => {});
// anchor has to be added after attribute plugin for ids to work
mdit.use(anchor, {
    permalink: anchor.permalink.ariaHidden({
        placement: 'before',
    }),
});
mdit.use(copycode);
mdit.use(graphviz);
mdit.use(githubAlerts);
mdit.use(mermaid);
mdit.use(wikiLinks);

const renderMarkdown: Renderer = (content: string) => {
    return mdit.render(content);
};
export default renderMarkdown;
