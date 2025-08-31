import hljs from 'highlight.js';

export default function highlight(str: string, lang: string) {
    let content = str;
    if (!hljs.getLanguage(lang)) lang = 'plaintext';
    try {
        content = hljs.highlight(content, {
            language: lang,
            ignoreIllegals: true,
        }).value;
    } catch {}

    return `<pre class="language-${lang}"><code>${content}</code></pre>`;
}
