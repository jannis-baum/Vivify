import { writeFileSync } from 'fs';
import { basename, extname, resolve } from 'path';

import { address } from './config.js';
import { pathToURL, preferredPath } from './utils/path.js';
import { BrowserSession, findDriver } from './utils/webdriver.js';

const CM_PER_PX = 2.54 / 96;
const PRINT_WIDTH_CM = 21; // A4 width; content is centered within this
const BOTTOM_MARGIN_PX = 40;

// Runs inside the page: hide what `@media print` hides, wait for images, fonts
// and mermaid diagrams, then report the document's scroll size.
const MEASURE_SCRIPT = `
const done = arguments[arguments.length - 1];
(async () => {
    if (document.readyState !== 'complete') {
        await new Promise((r) => window.addEventListener('load', r, { once: true }));
    }
    await Promise.all([...document.images].map((img) =>
        img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; })));
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    for (let i = 0; i < 100; i++) {
        if (!document.querySelectorAll('.mermaid:not([data-processed="true"])').length) break;
        await new Promise((r) => setTimeout(r, 100));
    }
    await new Promise((r) => setTimeout(r, 150));

    // Measure the actual print layout rather than hard-coding what print hides.
    // We temporarily activate every '@media print' rule (and switch off
    // screen-only ones) so both Vivify's built-in and any user print CSS take
    // effect, then restore the stylesheets so the real print stays pristine.
    // (Width-based media features still resolve against the window, which we
    // size to the print width.)
    const forPrint = (query) => {
        const q = query.trim().toLowerCase();
        if (q.includes('print')) return 'all';
        if (q.includes('screen')) return 'not all';
        return query;
    };
    const patched = [];
    const activatePrint = (rules) => {
        for (const rule of rules) {
            if (rule.media && rule.media.mediaText) {
                patched.push([rule.media, rule.media.mediaText]);
                rule.media.mediaText = rule.media.mediaText.split(',').map(forPrint).join(', ');
            }
            if (rule.cssRules) activatePrint(rule.cssRules);
            if (rule.styleSheet) {
                try { activatePrint(rule.styleSheet.cssRules); } catch (e) { /* cross-origin */ }
            }
        }
    };
    for (const sheet of document.styleSheets) {
        try { activatePrint(sheet.cssRules); } catch (e) { /* cross-origin */ }
    }

    // getBoundingClientRect().height is the true content height; scrollHeight is
    // clamped up to the viewport, which over-pads short documents.
    const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
    for (const [media, text] of patched) media.mediaText = text;

    done({ width: document.documentElement.scrollWidth, height });
})();
`;

interface PageSize {
    width: number;
    height: number;
}

// Firefox/Chrome print PDFs are uncompressed, so the page count is readable
// straight from the bytes.
const pageCount = (pdf: Buffer): number => {
    const text = pdf.toString('latin1');
    const count = text.match(/\/Count\s+(\d+)/);
    if (count) return parseInt(count[1], 10);
    return (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1;
};

// Render a file to a single tall "infinite scroll" PDF via a headless browser.
export const exportPdf = async (filePath: string, outPath?: string): Promise<void> => {
    const driver = findDriver();
    if (!driver) {
        console.log(
            'PDF export needs a WebDriver on your PATH.\n' +
                'Install geckodriver (for Firefox) or chromedriver (for Chrome), then try again.',
        );
        return;
    }

    const resolved = resolve(filePath);
    const url = `${address}${pathToURL(preferredPath(resolved))}`;
    const output = outPath ?? `${basename(resolved, extname(resolved))}.pdf`;

    console.log(`Exporting ${basename(resolved)} via ${driver.bin} …`);
    const session = await BrowserSession.launch(driver);
    try {
        await session.setViewportWidth(Math.round(PRINT_WIDTH_CM / CM_PER_PX));
        await session.navigate(url);
        const size = await session.evaluateAsync<PageSize>(MEASURE_SCRIPT);

        // Print onto one tall page. The browser's print layout can be a hair
        // taller than the measured scroll height, which would spill a blank
        // second page, so we verify the page count and grow the page if needed.
        let extraPx = BOTTOM_MARGIN_PX;
        let pdf = await session.print({
            widthCm: PRINT_WIDTH_CM,
            heightCm: (size.height + extraPx) * CM_PER_PX,
        });
        for (let attempt = 0; attempt < 5 && pageCount(pdf) > 1; attempt++) {
            extraPx += 64;
            pdf = await session.print({
                widthCm: PRINT_WIDTH_CM,
                heightCm: (size.height + extraPx) * CM_PER_PX,
            });
        }

        writeFileSync(output, pdf);
        console.log(`Wrote ${output}`);
    } finally {
        await session.close();
    }
};
