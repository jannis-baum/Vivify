import MarkdownIt from 'markdown-it';

export default function mermaid(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.info === 'mermaid') {
            return `<pre class="mermaid">${token.content}</pre>`;
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
