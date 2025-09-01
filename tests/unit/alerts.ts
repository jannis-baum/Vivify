import assert from 'node:assert';
import test, { describe } from 'node:test';

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
