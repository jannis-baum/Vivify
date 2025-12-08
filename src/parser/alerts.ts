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
import type { Token } from 'markdown-it/index.js';
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
for (const marker in icons) {
    resolvedIcons[marker.toLowerCase()] = resolveIcon(icons[marker]);
}

const titles: Record<string, string> = {};
for (const marker in config.alertOptions?.titles ?? {}) {
    titles[marker.toLowerCase()] = config.alertOptions!.titles![marker];
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

function findBlockquoteClose(tokens: Token[], startIndex: number): number | null {
    let nested = 0;
    for (let i = startIndex + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'blockquote_open') {
            nested++;
        } else if (tokens[i].type === 'blockquote_close') {
            if (nested === 0) return i;
            nested--;
        }
    }
    return null;
}

const MarkdownItAlerts = (md: MarkdownIt) => {
    // Alert title line example:
    // > [!marker] Optional title

    // On a marker name, allow anything except a closing square bracket
    // Match case-insensitively
    // Optional title requires a leading space
    // Ignore Obsidian fold characters [!note]- and [!note]+

    const titlePattern = /^\[!([^\]]+)\]\S*( [^\n\r]*)?/i;

    md.core.ruler.after('block', 'alerts', (state) => {
        const tokens = state.tokens;

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type !== 'blockquote_open') continue;

            const start = i;
            const open = tokens[i];

            const end = findBlockquoteClose(tokens, start);
            if (end === null) continue;
            const close = tokens[end];

            // Get the first inline token, consists of:
            // 1. title line e.g. [!marker] Optional title
            // 2. the first paragraph in the alert body
            let firstInline;
            for (let j = start + 1; j <= end; j++) {
                // '>>' case
                if (tokens[j].type === 'blockquote_open') {
                    // Alert isn't allowed to nest inside regular blockquote, skip this one
                    i = end;
                    break;
                }
                if (tokens[j].type === 'inline') {
                    firstInline = tokens[j];
                    break;
                }
            }
            if (!firstInline) continue;

            // Is this blockquote an alert?
            const match = firstInline.content.match(titlePattern);

            // If not, skip this blockquote. This matches Obsidian's behavior:
            // alerts can't be nested inside regular blockquotes
            // Makes it easier not having to deal with certain edge cases
            if (!match) {
                i = end;
                continue;
            }

            const marker = match[1].toLowerCase();
            const title = match[2]?.trim() || (titles[marker] ?? capitalize(marker));
            const isFallback = !(marker in resolvedIcons); // For styling unconfigured markers
            const icon = isFallback ? fallbackIcon : resolvedIcons[marker];

            // Remove the title line, to be replaced by the final alert title
            firstInline.content = firstInline.content.slice(match[0].length).trimStart();

            open.type = 'alert_open';
            open.tag = 'div';
            open.meta = { marker, title, icon, isFallback };
            close.type = 'alert_close';
            close.tag = 'div';
        }
    });
    md.renderer.rules.alert_open = function (tokens, idx) {
        const { marker, title, icon, isFallback } = tokens[idx].meta;

        const markerId = marker
            .replace(/\s+/g, '-') // get rid of spaces in a CSS classname
            .replace(/"/g, '&quot;'); // escape quotes so they don't break the HTML tag

        return `<div class="alert alert-${markerId} ${isFallback ? 'fallback-alert' : ''}">
                    <p class="alert-title">${icon}${title}</p>`;
    };
};

export default MarkdownItAlerts;
export { resolveIcon }; // Exported for unit test
