import MarkdownIt from 'markdown-it';
import octicons from '@primer/octicons';

const copyIcon = octicons['copy'].toSVG({ class: 'icon-copy' });

export default function copycode(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const renderedPreBlock = defaultRender(tokens, idx, options, env, self);
        return `
<div class="pre-wrapper" style="position: relative">
    ${renderedPreBlock}
    <div class="copy-wrapper">
        <button class="copy-button">${copyIcon}</button>
    </div>
</div>
`;
    };
}
