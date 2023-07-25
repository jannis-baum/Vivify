import { homedir } from "os";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import anchor from "markdown-it-anchor";

const mdit = new MarkdownIt({
    html: true,
    highlight: (str, lang) => {
        let content = str;
        if (lang && hljs.getLanguage(lang)) {
            try {
              content = hljs.highlight(content, { language: lang, ignoreIllegals: true }).value;
            } catch (_) {}
        }
        return `<pre class="language-${lang}"><code>${content}</code></pre>`;
    },
});

mdit.use(anchor, { permalink: anchor.permalink.ariaHidden({
    placement: 'before'
}) });
/* eslint-disable @typescript-eslint/no-var-requires */
mdit.use(require("markdown-it-emoji"));
mdit.use(require("markdown-it-task-lists"));
mdit.use(require("markdown-it-inject-linenumbers"));
mdit.use(require("markdown-it-katex"));
/* eslint-enable @typescript-eslint/no-var-requires */

export const pathHeading = (path: string) =>
    `# \`${path.replace(homedir(), '~')}\``

export default function parse(src: string, path?: string) {
    let md = src;

    const fileEnding = path?.split('.')?.at(-1);
    if (fileEnding && fileEnding !== 'md') {
        md = `${pathHeading(path!)}\n\n\`\`\`${fileEnding}\n${src}\n\`\`\``
    }

    return mdit.render(md);
}
