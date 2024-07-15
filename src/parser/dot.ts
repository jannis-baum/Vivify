import { instance } from '@viz-js/viz';
import MarkdownIt from 'markdown-it';

let viz: Awaited<ReturnType<typeof instance>> | undefined = undefined;
(async () => {
    viz = await instance();
})();

function renderDot(str: string) {
    if (!viz) return '<p>Please reload the page to see graphs rendered.</p>';
    try {
        return viz.renderString(str, { format: 'svg' });
    } catch (e) {
        return `<p>Error while parsing dot: ${e}</p>`;
    }
}

export default function graphviz(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info === 'graphviz' || token.info === 'dot') {
            return renderDot(token.content);
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
