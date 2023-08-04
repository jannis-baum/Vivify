import hljs from 'highlight.js';

export default function highlight(str: string, lang: string) {
    let content = str;
    if (lang) {
        if (hljs.getLanguage(lang)) {
            try {
                content = hljs.highlight(content, {
                    language: lang,
                    ignoreIllegals: true,
                }).value;
            } catch (_) {}
        }
    }
    return `<pre class="language-${lang}"><code>${content}</code></pre>`;
}
