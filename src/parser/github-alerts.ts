// Derived from this plugin:
// https://github.com/antfu/markdown-it-github-alerts

// Copyright (c) 2022 Anthony Fu <https://github.com/antfu>
// Licensed under the MIT License: https://opensource.org/licenses/MIT

import MarkdownIt from 'markdown-it';
import config from '../config.js';
import octicons from '@primer/octicons';

// config.json alertsOptions
const icons: Record<string, string> = {};
const titles = config.alertsOptions?.titles ?? {};
const matchCaseSensitive = config.alertsOptions?.matchCaseSensitive ?? false;
const classPrefix = config.alertsOptions?.classPrefix ?? 'markdown-alert';

const githubAlertsIcons: Record<string, string> = {
    note: 'info',
    tip: 'light-bulb',
    important: 'report',
    warning: 'alert',
    caution: 'stop',
};
const mergedIcons = {
    ...githubAlertsIcons,
    ...config.alertsOptions?.icons,
};

// Icon for markers that have no configured icon
// Defaults to same as [!note]
// Can also be customized separately
mergedIcons['fallback'] ??= mergedIcons['note'];

for (const marker in mergedIcons) {
    const octicon = mergedIcons[marker] as keyof typeof octicons;
    icons[marker] = octicons[octicon].toSVG();
}

const MarkdownItGitHubAlerts = (md: MarkdownIt) => {
    const markerNameRE = '\\w+';
    const RE = new RegExp(
        `^\\\\?\\[\\!(${markerNameRE})\\]([^\\n\\r]*)`,
        matchCaseSensitive ? '' : 'i',
    );

    md.core.ruler.after('block', 'github-alerts', (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'blockquote_open') {
                const open = tokens[i];
                const startIndex = i;
                while (tokens[i]?.type !== 'blockquote_close' && i <= tokens.length) i += 1;
                const close = tokens[i];
                const endIndex = i;
                const firstContent = tokens
                    .slice(startIndex, endIndex + 1)
                    .find((token) => token.type === 'inline');
                if (!firstContent) continue;
                const match = firstContent.content.match(RE);
                if (!match) continue;
                const type = match[1].toLowerCase() as keyof typeof icons;
                const title = match[2].trim() || (titles[type] ?? capitalize(type));
                const icon = icons[type] ?? icons['fallback'];
                firstContent.content = firstContent.content.slice(match[0].length).trimStart();
                open.type = 'alert_open';
                open.tag = 'div';
                open.meta = {
                    title,
                    type,
                    icon,
                };
                close.type = 'alert_close';
                close.tag = 'div';
            }
        }
    });
    md.renderer.rules.alert_open = function (tokens, idx) {
        const { title, type, icon } = tokens[idx].meta;
        return `<div class="${classPrefix} ${classPrefix}-${type}"><p class="${classPrefix}-title">${icon}${title}</p>`;
    };
};

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default MarkdownItGitHubAlerts;
