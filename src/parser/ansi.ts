import { Renderer } from './parser';

// this entire file is very ugly because ansi_up is only available as module so
// we have to use a dynamic (async) import
let _renderAnsi: Renderer | undefined = undefined;

// here we asynchronously import ansi_up
(async () => {
    const { AnsiUp } = await (async () => {
        // this gets even uglier because we can't directly use dynamic imports
        // with ts-node https://github.com/TypeStrong/ts-node/discussions/1290
        if (process.env.NODE_ENV === 'development') {
            const dynamicImport = new Function('specifier', 'return import(specifier)');
            return await dynamicImport('ansi_up');
        }
        // for compilation however we have to directly use dynamic imports
        return await import('ansi_up');
    })();
    const ansiup = new AnsiUp();
    _renderAnsi = (content: string): string => ansiup.ansi_to_html(content);
})();

// use identity while ansi_up loads
const renderAnsi: Renderer = (content: string): string =>
    _renderAnsi ? _renderAnsi(content) : content;

export default renderAnsi;
