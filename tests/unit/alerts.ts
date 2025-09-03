import assert from 'node:assert';
import test, { describe } from 'node:test';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { homedir, tmpdir } from 'os';
import path from 'path';

import { configBaseDir } from '../../src/config.js';
import { resolveIcon } from '../../src/parser/alerts.js';

const assertFallback = (result: string) => {
    // We know a fallback icon is returned when result starts with this
    assert.match(result, /^<script>console\.warn\(/);
    // Contains the actual fallback icon
    assert.match(result, /<svg/);
};

// Tests to make sure vivify-server isn't crashing on invalid options in
// config.alertOptions
describe('resolveIcon returns fallback icon', () => {
    test('empty string', () => {
        assertFallback(resolveIcon('')); // empty string is considered (invalid) octicon name
    });

    test('invalid octicon name', () => {
        assertFallback(resolveIcon('foo-bar'));         // nonexistent
        assertFallback(resolveIcon('04trweäöcaöe'));    // garbage
        assertFallback(resolveIcon('CircleSlashIcon')); // real icon but should be kebab-case
    });

    test('valid paths but icon not found', () => {
        assertFallback(resolveIcon('/home/john/icons/flower.svg'));
        assertFallback(resolveIcon('~/icons/flower.svg'));
        assertFallback(resolveIcon('./alert-icons/gear.svg'));
        assertFallback(resolveIcon('../../svgs/dog.svg'));
    });

    test('invalid paths', () => {
        assertFallback(resolveIcon('//home/john/icons/flower.svg')); // double slash
        assertFallback(resolveIcon('/home/john//icons/flower.svg')); // double slash alt
        assertFallback(resolveIcon('./alert icons/gear.svg'));       // unescaped space
    });

    test('misclassified invalid paths', () => {
        // Considered to be (invalid) octicon names
        assertFallback(resolveIcon('home/john/icons/flower.svg')); // missing beginning slash
        assertFallback(resolveIcon('~icons/flower.svg'));
    });

    test('missing .svg extension', () => {
        // Considered to be (invalid) octicon names
        assertFallback(resolveIcon('/home/john/icons/flower'));
        assertFallback(resolveIcon('~/icons/flower'));
        assertFallback(resolveIcon('./alert-icons/gear'));
        assertFallback(resolveIcon('../../svgs/dog'));
    });

    test('wrong file extension', () => {
        // Considered to be (invalid) octicon names
        assertFallback(resolveIcon('/home/john/icons/flower.png'));
        assertFallback(resolveIcon('~/icons/flower.jpg'));
        assertFallback(resolveIcon('./alert-icons/gear.txt'));
        assertFallback(resolveIcon('../../svgs/dog.ico'));
    });

    test('wrong tag', () => {
        // Considered to be (invalid) octicon names
        assertFallback(resolveIcon("<img src='flower.png' alt='Alert icon hehe'>"));
        assertFallback(resolveIcon('<script>document.createElement("svg");</script>'));
    });
});

// Helper: create a temporary SVG file and dir
const makeTempSvg = (baseDir?: string) => {
    const dir = mkdtempSync(path.join(baseDir ?? tmpdir(), 'alerts-test-'));
    const file = path.join(dir, 'icon.svg');
    const svg = '<svg><circle cx="5" cy="5" r="5"/></svg>';
    writeFileSync(file, svg);
    return { dir, file, svg };
};

// Helper: cleanup temporary file and dir
const cleanupTempSvg = ({ dir, file }: { dir: string; file: string }) => {
    unlinkSync(file);
    rmdirSync(dir);
};

describe('resolveIcon positive cases', () => {
    test('valid octicon name', () => {
        const result = resolveIcon('alert');
        assert.match(result, /^<svg/);
        assert.match(result, /<\/svg>$/);
    });

    test('raw svg string', () => {
        const raw = '<svg><rect/></svg>';
        assert.strictEqual(resolveIcon(raw), raw);
    });

    test('absolute path to existing svg file', () => {
        const tmp = makeTempSvg();
        const result = resolveIcon(tmp.file);
        assert.strictEqual(result, tmp.svg);
        cleanupTempSvg(tmp);
    });

    test('tilde path to existing svg file', () => {
        const tmp = makeTempSvg(homedir());
        const rel = path.relative(homedir(), tmp.file);
        const result = resolveIcon(`~/${rel}`);
        assert.strictEqual(result, tmp.svg);
        cleanupTempSvg(tmp);
    });

    test('path to existing svg file relative to configBaseDir (current dir)', () => {
        // Skip test in the CI where configBaseDir is undefined
        if (!configBaseDir) return;

        const tmp = makeTempSvg(configBaseDir);
        const result = resolveIcon(`./${path.basename(tmp.dir)}/icon.svg`);
        assert.strictEqual(result, tmp.svg);
        cleanupTempSvg(tmp);
    });

    test('path to existing svg file relative to configBaseDir (parent dir)', () => {
        // Skip test in the CI where configBaseDir is undefined
        if (!configBaseDir) return;

        const parentDir = path.dirname(configBaseDir);
        const tmp = makeTempSvg(parentDir);
        const result = resolveIcon(`../${path.basename(tmp.dir)}/icon.svg`);
        assert.strictEqual(result, tmp.svg);
        cleanupTempSvg(tmp);
    });
});
