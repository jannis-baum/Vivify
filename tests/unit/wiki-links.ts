import assert from 'node:assert';
import test, { describe } from 'node:test';
import MarkdownIt from 'markdown-it';
import wikiLinkPlugin from '../../src/parser/wiki-links.js';

const md = new MarkdownIt({ html: true });
md.use(wikiLinkPlugin);

const render = (input: string): string => md.render(input);

describe('Wiki-links: [[...]]', () => {
    test('renders a wiki-link to a Markdown file', () => {
        assert.strictEqual(render('[[note.md]]'), '<p><a href="note.md">note.md</a></p>\n');
    });

    test('appends .md when no extension is given', () => {
        assert.strictEqual(render('[[note]]'), '<p><a href="note.md">note</a></p>\n');
    });

    test('supports custom display text after a pipe', () => {
        assert.strictEqual(render('[[note.md|My Note]]'), '<p><a href="note.md">My Note</a></p>\n');
    });

    test('applies .md extension when no extension and custom text are given', () => {
        assert.strictEqual(render('[[note|My Note]]'), '<p><a href="note.md">My Note</a></p>\n');
    });

    test('handles paths with subdirectories', () => {
        assert.strictEqual(
            render('[[posts/hello.md]]'),
            '<p><a href="posts/hello.md">posts/hello.md</a></p>\n',
        );
    });
});
