import MarkdownIt from 'markdown-it';
import { basename as pbasename, extname as pextname } from 'path';

// Obsidian-style embeds use the `![[...]]` syntax to inline media files.
// The path is treated as relative to the document being viewed, exactly like
// regular wiki-links (`[[...]]`) and standard Markdown relative links, so the
// browser resolves it through Vivify's `/viewer/<...>` route.

const IMAGE_EXTS = new Set(['avif', 'bmp', 'gif', 'ico', 'jpeg', 'jpg', 'png', 'svg', 'webp']);
const VIDEO_EXTS = new Set(['mkv', 'mov', 'mp4', 'ogv', 'webm']);
const AUDIO_EXTS = new Set(['aac', 'flac', 'm4a', 'mp3', 'ogg', 'wav']);

// Explicit MIME types for <source> fallbacks; omitted when unknown so the
// browser infers from the file extension itself.
const VIDEO_MIME: Record<string, string> = {
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    mp4: 'video/mp4',
    ogv: 'video/ogg',
    webm: 'video/webm',
};
const AUDIO_MIME: Record<string, string> = {
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
};

// Escape a value for use inside a double-quoted HTML attribute.
function escAttr(value: string): string {
    return value.replace(/["&]/g, (char) => (char === '"' ? '&quot;' : '&amp;'));
}

function fileExtension(filePath: string): string {
    return pextname(filePath).slice(1).toLowerCase();
}

// Split `![[content]]` inner content into `filePath | options`.
function parseContent(content: string): { filePath: string; options: string } {
    const pipe = content.indexOf('|');
    if (pipe === -1) {
        return { filePath: content.trim(), options: '' };
    }
    return {
        filePath: content.slice(0, pipe).trim(),
        options: content.slice(pipe + 1).trim(),
    };
}

// Parse a size spec such as "300" (width) or "300x200" (width x height).
function parseSize(options: string): { width?: string; height?: string } {
    if (!options) return {};
    const match = /^(\d+)(?:x(\d+))?$/.exec(options);
    if (!match) return {};
    return { width: match[1], height: match[2] ?? undefined };
}

function sizeAttrs(size: { width?: string; height?: string }): string {
    let attrs = '';
    if (size.width) attrs += ` width="${escAttr(size.width)}"`;
    if (size.height) attrs += ` height="${escAttr(size.height)}"`;
    return attrs;
}

function renderEmbedHtml(content: string): string {
    const { filePath, options } = parseContent(content);
    const src = escAttr(filePath);
    const extn = fileExtension(filePath);
    const sizing = sizeAttrs(parseSize(options));

    // Image: inline like a regular Markdown image, honouring explicit sizing.
    if (IMAGE_EXTS.has(extn)) {
        const alt = escAttr(pbasename(filePath));
        return `<img src="${src}" alt="${alt}"${sizing}>`;
    }

    // PDF: render inside the browser's native PDF viewer via an iframe.
    if (extn === 'pdf') {
        return `<iframe src="${src}" class="wiki-embed wiki-embed-pdf"${sizing} loading="lazy"></iframe>`;
    }

    // Video: <video> player with a <source> carrying the best known MIME type.
    if (VIDEO_EXTS.has(extn)) {
        const type = VIDEO_MIME[extn];
        const typeAttr = type ? ` type="${type}"` : '';
        return `<video controls class="wiki-embed wiki-embed-video"${sizing}><source src="${src}"${typeAttr}></video>`;
    }

    // Audio: <audio> player.
    if (AUDIO_EXTS.has(extn)) {
        const type = AUDIO_MIME[extn];
        const typeAttr = type ? ` type="${type}"` : '';
        return `<audio controls class="wiki-embed wiki-embed-audio"${sizing} src="${src}"${typeAttr}></audio>`;
    }

    // Fallback: any other file type is embedded in an iframe, so e.g. other
    // Markdown notes get rendered through Vivify and displayed inline. When
    // the path has no extension, assume it is a Markdown note and append `.md`
    // so the viewer route serves it as rendered Markdown rather than raw.
    if (!extn) {
        return `<iframe src="${src}.md" class="wiki-embed wiki-embed-iframe"${sizing} loading="lazy"></iframe>`;
    }
    return `<iframe src="${src}" class="wiki-embed wiki-embed-iframe"${sizing} loading="lazy"></iframe>`;
}

export default function embeds(md: MarkdownIt): void {
    md.inline.ruler.before('link', 'wiki_embed', (state, silent) => {
        const max = state.posMax;
        const start = state.pos;

        // Look for opening `![[`
        if (state.src.charCodeAt(start) !== 0x21 /* ! */) return false;
        if (state.src.charCodeAt(start + 1) !== 0x5b /* [ */) return false;
        if (state.src.charCodeAt(start + 2) !== 0x5b /* [ */) return false;

        // Find closing `]]` (content may not contain a `]`, mirroring wiki-links)
        let end = start + 3;
        while (end < max && state.src.charCodeAt(end) !== 0x5d /* ] */) end++;
        if (end + 1 >= max || state.src.charCodeAt(end + 1) !== 0x5d /* ] */) return false;
        end += 2;

        if (!silent) {
            const content = state.src.slice(start + 3, end - 2);
            // Emit the generated HTML as raw inline markup, the same technique
            // `front-matter.ts` uses with `html_block` tokens.
            const token = state.push('html_inline', '', 0);
            token.content = renderEmbedHtml(content);
        }

        state.pos = end;
        return true;
    });
}
