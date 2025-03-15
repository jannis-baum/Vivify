import MarkdownIt from 'markdown-it';
import octicons from '@primer/octicons';

const copyIcon = octicons['copy'].toSVG({ class: 'icon-copy' });
const checkIcon = octicons['check'].toSVG({ class: 'icon-check' });
const xIcon = octicons['x'].toSVG({ class: 'icon-x' });

export default function copycode(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.fence!;
    md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const renderedPreBlock = defaultRender(tokens, idx, options, env, self);
        const content = tokens[idx].content;
        return `
<div class="pre-wrapper" style="position: relative">
    ${renderedPreBlock}
    <div class="copy-wrapper">
        <button class="copy-button" data-clipboard-text="${content.replaceAll('"', '&quot;')}">
            ${copyIcon}
        </button>
        <div class="copy-success" style="display: none">
            ${checkIcon}
        </div>
        <div class="copy-fail" style="display: none">
            ${xIcon}
        </div>
    </div>
</div>
`;
    };
}
