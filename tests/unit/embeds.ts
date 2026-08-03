import assert from 'node:assert';
import test, { describe } from 'node:test';
import MarkdownIt from 'markdown-it';
import embeds from '../../src/parser/embeds.js';

// A MarkdownIt instance with just the embeds plugin (mirroring how it is
// registered in `parser/markdown.ts`) for focused unit testing.
const md = new MarkdownIt({ html: true });
md.use(embeds);

const render = (input: string): string => md.render(input);

describe('Embeds: ![[...]]', () => {
    test('embeds an image', () => {
        assert.strictEqual(
            render('![[image.jpg]]'),
            '<p><img src="image.jpg" alt="image.jpg"></p>\n',
        );
    });

    test('embeds an image with a relative path', () => {
        assert.strictEqual(
            render('![[photos/image.png]]'),
            '<p><img src="photos/image.png" alt="image.png"></p>\n',
        );
    });

    test('supports resizing images with a width', () => {
        assert.strictEqual(
            render('![[image.jpg|300]]'),
            '<p><img src="image.jpg" alt="image.jpg" width="300"></p>\n',
        );
    });

    test('supports resizing images with width x height', () => {
        assert.strictEqual(
            render('![[image.jpg|300x200]]'),
            '<p><img src="image.jpg" alt="image.jpg" width="300" height="200"></p>\n',
        );
    });

    test('does not interfere with standard Markdown images', () => {
        assert.strictEqual(
            render('![alt text](image.jpg)'),
            '<p><img src="image.jpg" alt="alt text"></p>\n',
        );
        assert.strictEqual(render('![](image.jpg)'), '<p><img src="image.jpg" alt=""></p>\n');
    });

    test('embeds a PDF in an iframe', () => {
        assert.strictEqual(
            render('![[document.pdf]]'),
            '<p><iframe src="document.pdf" class="wiki-embed wiki-embed-pdf" loading="lazy"></iframe></p>\n',
        );
    });

    test('embeds a video', () => {
        assert.strictEqual(
            render('![[clip.mp4]]'),
            '<p><video controls class="wiki-embed wiki-embed-video"><source src="clip.mp4" type="video/mp4"></video></p>\n',
        );
    });

    test('embeds an audio file', () => {
        assert.strictEqual(
            render('![[song.mp3]]'),
            '<p><audio controls class="wiki-embed wiki-embed-audio" src="song.mp3" type="audio/mpeg"></audio></p>\n',
        );
    });

    test('applies sizing to a video player', () => {
        assert.strictEqual(
            render('![[clip.mp4|320]]'),
            '<p><video controls class="wiki-embed wiki-embed-video" width="320"><source src="clip.mp4" type="video/mp4"></video></p>\n',
        );
    });

    test('applies sizing to an audio player', () => {
        assert.strictEqual(
            render('![[song.mp3|400x80]]'),
            '<p><audio controls class="wiki-embed wiki-embed-audio" width="400" height="80" src="song.mp3" type="audio/mpeg"></audio></p>\n',
        );
    });

    test('falls back to an iframe for unknown file types', () => {
        assert.strictEqual(
            render('![[archive.zip]]'),
            '<p><iframe src="archive.zip" class="wiki-embed wiki-embed-iframe" loading="lazy"></iframe></p>\n',
        );
    });

    test('appends .md when no extension is given (markdown embed)', () => {
        assert.strictEqual(
            render('![[note]]'),
            '<p><iframe src="note.md" class="wiki-embed wiki-embed-iframe" loading="lazy"></iframe></p>\n',
        );
    });

    test('renders an embed inline within a paragraph', () => {
        assert.strictEqual(
            render('See ![[image.jpg]].'),
            '<p>See <img src="image.jpg" alt="image.jpg">.</p>\n',
        );
    });

    test('leaves a lone exclamation mark untouched', () => {
        assert.strictEqual(render('Hello!'), '<p>Hello!</p>\n');
    });

    test('treats an invalid size spec as no sizing', () => {
        assert.strictEqual(
            render('![[image.jpg|nope]]'),
            '<p><img src="image.jpg" alt="image.jpg"></p>\n',
        );
    });
});
