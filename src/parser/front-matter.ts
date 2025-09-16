import MarkdownIt, { StateCore } from 'markdown-it/index.js';
import { parse } from 'yaml';

export default function parseFrontMatter(md: MarkdownIt) {
    md.core.ruler.after('block', 'convert_front_matter', (state: StateCore) => {
        const tokens = state.tokens;

        if (tokens.length && tokens[0].type === 'front_matter') {
            const yaml = tokens[0].meta;
            const displayToken = new state.Token('html_block', '', 0);
            displayToken.content = `<div id="front-matter-section">
                <div style="text-align: right">
                    <a href="" id="front-matter-button" onClick="(function(){
                        const display = document.getElementById('front-matter-display');
                        display.style.display = display.style.display == 'none' ? 'block' : 'none';
                        return false;
                    })();return false;">Front Matter</a>
                </div>
                <pre id="front-matter-display" style="display: none"><code>${yaml}</code></pre>
            </div>`;

            const scriptToken = new state.Token('html_block', '', 0);
            try {
                const frontMatterData = parse(yaml);
                const jsonContent = JSON.stringify(frontMatterData, null, 2);
                scriptToken.content = `<script type="application/json" id="front-matter">\n${jsonContent}\n</script>\n`;
            } catch (err) {
                scriptToken.content = `<script type="text/javascript">\nconsole.error("Failed to parse front matter: ${err}")\n</script>\n`;
            }
            tokens[0] = scriptToken;
            tokens.splice(1, 0, displayToken);
        }

        return true;
    });
}
