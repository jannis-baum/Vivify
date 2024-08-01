import assert from 'node:assert';
import test, { describe } from 'node:test';

import { getPathAndLine } from '../../src/cli.js';

describe('CLI target parsing for path:line', () => {
    const testParsing = (
        name: string,
        input: string,
        expectedPath: string | undefined,
        expectedLine: number | undefined,
    ) => {
        return test(name, () => {
            const { path, line } = getPathAndLine(input);
            assert.strictEqual(path, expectedPath);
            assert.strictEqual(line, expectedLine);
        });
    };

    testParsing('empty string', '', undefined, undefined);

    // paths without line
    testParsing('simple path only', 'path/to/file', 'path/to/file', undefined);
    testParsing('path with backslashes', 'path/to\\hehe/file', 'path/to\\hehe/file', undefined);
    testParsing('path with backslashes', 'path/to\\\\hehe/file', 'path/to\\hehe/file', undefined);
    testParsing('path with colon', 'path/to:hehe/file', 'path/to:hehe/file', undefined);
    testParsing('path with escaped colon', 'path/to\\:hehe/file', 'path/to:hehe/file', undefined);
    testParsing(
        'path with escaped colon and backslashes',
        'path/to\\:hehe\\\\\\/file',
        'path/to:hehe\\\\/file',
        undefined,
    );
    testParsing('path with colon at end', 'path/to/file:', 'path/to/file:', undefined);
    testParsing('path with backslashes at end', 'path/to/file\\', undefined, undefined);
    testParsing(
        'path with escaped backslashes at end',
        'path/to/file\\\\',
        'path/to/file\\',
        undefined,
    );
    testParsing('escaped colon suppressing line', 'path/to/file\\:1', 'path/to/file:1', undefined);

    // with line
    testParsing('simple path with line', 'path/to/file:123', 'path/to/file', 123);
    testParsing('colon path with line', 'path/to:hehe/file:123', 'path/to:hehe/file', 123);
    testParsing(
        'escaped colon path with line',
        'path/to\\:hehe/file:123',
        'path/to:hehe/file',
        123,
    );
    testParsing('colon at end with line', 'path/to/file::123', 'path/to/file:', 123);
});
