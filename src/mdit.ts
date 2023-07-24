import MarkdownIt from "markdown-it";
import anchor from "markdown-it-anchor";
import emoji from "markdown-it-emoji";
var taskLists = require("markdown-it-task-lists");

const mdit = new MarkdownIt();
mdit.use(anchor, { permalink: anchor.permalink.ariaHidden({
    placement: 'before'
}) });
mdit.use(emoji);
mdit.use(taskLists);

export default mdit;
