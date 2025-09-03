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
import { config, configBaseDir } from '../config.js';
import octicons from '@primer/octicons';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

const icons: Record<string, string> = {
    // GitHub default alerts
    note: 'info',
    tip: 'light-bulb',
    important: 'report',
    warning: 'alert',
    caution: 'stop',

    ...config.alertOptions?.icons,
};

const fallbackIconOpt = config.alertOptions?.fallbackIcon ?? icons['note'];
const fallbackIcon = resolveIcon(fallbackIconOpt);
const resolvedIcons: Record<string, string> = {};
const titles = config.alertOptions?.titles ?? {};

for (const marker in icons) {
    resolvedIcons[marker] = resolveIcon(icons[marker]);
}

function warnAndFallback(message: string): string {
    return `<script>console.warn("${message}");</script>${fallbackIcon}`;
}

// Resolve option from alertOptions.icons into raw svg tag
function resolveIcon(iconOpt: string): string {
    // Case 1: already a raw svg tag
    if (iconOpt.startsWith('<svg')) {
        return iconOpt;
    }

    // Case 2: svg file path
    const prefix = ['/', './', '../', '~/'].find((p) => iconOpt.startsWith(p));
    if (prefix && iconOpt.endsWith('.svg')) {
        let iconPath = iconOpt;

        if (prefix === '~/') {
            iconPath = path.join(homedir(), iconPath.slice(2));
        } else if (prefix === './' || prefix === '../') {
            if (!configBaseDir) {
                return warnAndFallback(`configBaseDir not set for relative icon path: ${iconPath}`);
            }
            iconPath = path.join(configBaseDir, iconPath);
        }

        if (!existsSync(iconPath)) {
            return warnAndFallback(`Icon file not found: ${iconPath}`);
        }
        return readFileSync(iconPath).toString();
    }

    // Case 3: octicon name (in kebab-case) <https://primer.style/octicons>
    const octiconName = iconOpt as keyof typeof octicons;
    const octicon = octicons[octiconName]?.toSVG();

    if (!octicon) {
        return warnAndFallback(`Not a known octicon name: ${iconOpt}`);
    }
    return octicon;
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const MarkdownItAlerts = (md: MarkdownIt) => {
    // Alert title line example:
    // > [!marker] Optional title

    // Allow multi word alphanumeric markers (includes underscore)
    // Additionally allow dashes in marker
    // Match marker case-insensitively
    const titlePattern = /^\[!([\w\- ]+)\]([^\n\r]*)/i;

    md.core.ruler.after('block', 'alerts', (state) => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type !== 'blockquote_open') continue;

            const open = tokens[i];
            const start = i;

            while (i < tokens.length && tokens[i].type !== 'blockquote_close') i++;

            const close = tokens[i];
            const end = i;

            // Get the first inline token, consists of:
            // 1. title line e.g. [!marker] Optional title
            // 2. the first paragraph in the alert body
            let firstBlock;
            for (let j = start; j <= end; j++) {
                if (tokens[j].type === 'inline') {
                    firstBlock = tokens[j];
                    break;
                }
            }
            if (!firstBlock) continue;

            // Is this blockquote an alert?
            const match = firstBlock.content.match(titlePattern);
            if (!match) continue;

            const marker = match[1].toLowerCase();
            const title = match[2].trim() || (titles[marker] ?? capitalize(marker));
            const isFallback = !(marker in resolvedIcons); // For styling unconfigured markers
            const icon = isFallback ? fallbackIcon : resolvedIcons[marker];

            // Remove the title line, to be replaced by the final alert title
            firstBlock.content = firstBlock.content.slice(match[0].length).trimStart();

            open.type = 'alert_open';
            open.tag = 'div';
            open.meta = { marker, title, icon, isFallback };
            close.type = 'alert_close';
            close.tag = 'div';
        }
    });
    md.renderer.rules.alert_open = function (tokens, idx) {
        const { marker, title, icon, isFallback } = tokens[idx].meta;
        const markerId = marker.replace(/\s+/g, '-');
        return `<div class="alert alert-${markerId} ${isFallback ? 'fallback-alert' : ''}">
                    <p class="alert-title">${icon}${title}</p>`;
    };
};

export default MarkdownItAlerts;
export { resolveIcon }; // Exported for unit test
