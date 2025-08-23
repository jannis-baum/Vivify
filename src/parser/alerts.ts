/*
 * Derived and heavily modified from 'markdown-it-github-alerts':
 * https://github.com/antfu/markdown-it-github-alerts
 *
 * Original Copyright (c) 2022 Anthony Fu <https://github.com/antfu>
 * Licensed under the MIT License: https://opensource.org/licenses/MIT
 *
 * Modifications Copyright (c) 2025 Tuure Piitulainen <https://github.com/tuurep>
 */

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

const MarkdownItAlerts = (md: MarkdownIt) => {
    // Allow multi word alphanumeric markers (includes underscore)
    // Additionally allow dashes in marker
    const markerRE = '[\\w- ]+';

    // Match marker case insensitively
    // Note: config icons and titles keys must be fully lower case
    const RE = new RegExp(`^\\\\?\\[\\!(${markerRE})\\]([^\\n\\r]*)`, 'i');

    md.core.ruler.after('block', 'alerts', (state) => {
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
                const marker = match[1].toLowerCase();
                const title = match[2].trim() || (titles[marker] ?? capitalize(marker));
                const isFallback = !(marker in resolvedIcons); // For styling unconfigured markers
                const icon = isFallback ? fallbackIcon : resolvedIcons[marker];
                firstContent.content = firstContent.content.slice(match[0].length).trimStart();
                open.type = 'alert_open';
                open.tag = 'div';
                open.meta = { marker, title, icon, isFallback };
                close.type = 'alert_close';
                close.tag = 'div';
            }
        }
    });
    md.renderer.rules.alert_open = function (tokens, idx) {
        const { marker, title, icon, isFallback } = tokens[idx].meta;
        const markerId = marker.replace(/\s+/g, '-');
        return `<div class="alert alert-${markerId} ${isFallback ? 'fallback-alert' : ''}">
                    <p class="alert-title">${icon}${title}</p>`;
    };
};

const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default MarkdownItAlerts;
