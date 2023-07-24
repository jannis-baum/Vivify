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
mdit.use(require("markdown-it-emoji"));
mdit.use(require("markdown-it-task-lists"));
mdit.use(require("markdown-it-inject-linenumbers"));
mdit.use(require("markdown-it-katex"));

const mdParse = (src: string) => mdit.render(src);
export default mdParse;
