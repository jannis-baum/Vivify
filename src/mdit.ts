import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";

const mdit = new MarkdownIt();
mdit.use(anchor, { permalink: anchor.permalink.ariaHidden({
    placement: 'before'
}) });
mdit.use(require("markdown-it-emoji"));
mdit.use(require("markdown-it-task-lists"));
mdit.use(require("markdown-it-inject-linenumbers"));

const mdParse = (src: string) => mdit.render(src);
export default mdParse;
