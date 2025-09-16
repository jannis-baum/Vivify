import octicons from '@primer/octicons';
import MarkdownIt, { StateCore } from 'markdown-it/index.js';
import { parse } from 'yaml';

const upIcon = octicons['chevron-up'].toSVG({ class: 'icon-chevron' });
const downIcon = octicons['chevron-down'].toSVG({ class: 'icon-chevron' });

export default function parseFrontMatter(md: MarkdownIt) {
    md.core.ruler.after('block', 'convert_front_matter', (state: StateCore) => {
        const tokens = state.tokens;
        if (!tokens.length || tokens[0].type !== 'front_matter') return true;

        const yaml = tokens[0].meta;

        // front matter data injection so it's available to client
        const scriptToken = new state.Token('html_block', '', 0);
        try {
            const frontMatterData = parse(yaml);
            const jsonContent = JSON.stringify(frontMatterData, null, 2);
            scriptToken.content = `<script type="application/json" id="front-matter">\n${jsonContent}\n</script>\n`;
        } catch (err) {
            scriptToken.content = `<script type="text/javascript">\nconsole.error("Failed to parse front matter: ${err}")\n</script>\n`;
        }
        tokens[0] = scriptToken;

        // collapsible front matter section
        const displayToken = new state.Token('html_block', '', 0);
        displayToken.content = `<div id="front-matter-section">
            <script type="text/javascript">
                function frontMatterButtonClicked() {
                    const display = document.getElementById('front-matter-display');
                    if (display.style.display == 'none') {
                        display.style.display = 'block';
                        document.getElementById('front-matter-collapse-icon').innerHTML = '${upIcon}';
                    } else {
                        display.style.display = 'none';
                        document.getElementById('front-matter-collapse-icon').innerHTML = '${downIcon}';
                    }
                }
            </script>
            <div style="text-align: right">
                <a href="" id="front-matter-button" onClick="frontMatterButtonClicked(); return false;">
                    Front Matter <span id="front-matter-collapse-icon">${downIcon}</span>
                </a>
            </div>
            <pre id="front-matter-display" style="display: none"><code>${yaml}</code></pre>
        </div>`;
        tokens.splice(1, 0, displayToken);

        return true;
    });
}
