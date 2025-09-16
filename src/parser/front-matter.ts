import MarkdownIt, { StateCore } from 'markdown-it/index.js';
import { parse } from 'yaml';

export default function parseFrontMatter(md: MarkdownIt) {
    md.core.ruler.after('block', 'convert_front_matter', (state: StateCore) => {
        const tokens = state.tokens;

        if (tokens.length && tokens[0].type === 'front_matter') {
            const token = new state.Token('html_block', '', 0);
            try {
                const frontMatterData = parse(tokens[0].meta);
                const jsonContent = JSON.stringify(frontMatterData, null, 2);
                token.content = `<script type="application/json" id="front-matter">\n${jsonContent}\n</script>\n`;
            } catch (err) {
                token.content = `<script type="text/javascript">\nconsole.error("Failed to parse front matter: ${err}")\n</script>\n`;
            }
            tokens[0] = token;
        }

        return true;
    });
}
