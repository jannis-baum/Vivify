import type { MarkdownIt } from 'markdown-it';

export default function pdfImage(md: MarkdownIt) {
    const defaultRender = md.renderer.rules.image!;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet('src');
        if (typeof src === 'string' && /\.pdf$/i.test(src.replace(/[?#].*$/, ''))) {
            token.attrSet('src', `${src}?viv=svg`);
            token.attrJoin('class', 'pdf-image');
        }
        return defaultRender(tokens, idx, options, env, self);
    };
}
