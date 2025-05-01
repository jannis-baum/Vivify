import type MarkdownIt from 'markdown-it';

export default function wikiLinkPlugin(md: MarkdownIt): void {
    md.inline.ruler.before('link', 'wiki_link', (state, silent) => {
        const max = state.posMax;
        const start = state.pos;

        // Look for opening [[
        if (state.src.charCodeAt(start) !== 0x5b /* [ */) return false;
        if (state.src.charCodeAt(start + 1) !== 0x5b /* [ */) return false;

        // Find closing ]]
        let end = start + 2;
        while (end < max && state.src.charCodeAt(end) !== 0x5d /* ] */) end++;
        if (end + 1 >= max || state.src.charCodeAt(end + 1) !== 0x5d /* ] */) return false;
        end += 2;

        if (!silent) {
            const content = state.src.slice(start + 2, end - 2);
            const href = content.indexOf('.') > -1 ? content : content + '.md';

            // Create link tokens
            const token = state.push('link_open', 'a', 1);
            token.attrSet('href', href);

            state.push('text', '', 0).content = content;
            state.push('link_close', 'a', -1);
        }

        state.pos = end;
        return true;
    });
}
