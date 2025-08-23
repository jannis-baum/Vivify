// Derived from this plugin:
// https://github.com/antfu/markdown-it-github-alerts

// Copyright (c) 2022 Anthony Fu <https://github.com/antfu>
// Licensed under the MIT License: https://opensource.org/licenses/MIT

import MarkdownIt from 'markdown-it';
import config from '../config.js';
import octicons from '@primer/octicons';

const resolveIcon = (icon: string): string => {
    // Todo:
    //     - inline svg
    //     - svg from filepath
    const iconName = icon as keyof typeof octicons;
    return octicons[iconName]?.toSVG();
};

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

const resolvedIcons: Record<string, string> = {};

for (const marker in mergedIcons) {
    resolvedIcons[marker] = resolveIcon(mergedIcons[marker]);
}

const fallbackIconOpt = config.alertsOptions?.fallbackIcon ?? mergedIcons['note'];
const fallbackIcon = resolveIcon(fallbackIconOpt);

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
                const type = match[1].toLowerCase() as keyof typeof resolvedIcons;
                const title = match[2].trim() || (titles[type] ?? capitalize(type));
                const isFallback = !(type in resolvedIcons);
                const icon = isFallback ? fallbackIcon : resolvedIcons[type];
                firstContent.content = firstContent.content.slice(match[0].length).trimStart();
                open.type = 'alert_open';
                open.tag = 'div';
                open.meta = {
                    title,
                    type,
                    icon,
                    isFallback,
                };
                close.type = 'alert_close';
                close.tag = 'div';
            }
        }
    });
    md.renderer.rules.alert_open = function (tokens, idx) {
        const { title, type, icon, isFallback } = tokens[idx].meta;
        const classes = [classPrefix, `${classPrefix}-${type}`, isFallback ? 'fallback' : ''];
        return `<div class="${classes.join(' ')}"><p class="${classPrefix}-title">${icon}${title}</p>`;
    };
};

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default MarkdownItGitHubAlerts;
