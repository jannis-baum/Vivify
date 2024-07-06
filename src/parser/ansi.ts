import { Renderer } from './parser';

// very ugly dynamic (async) import because ansi_up is a module
let _renderAnsi: Renderer | undefined = undefined;
(async () => {
    // even uglier because we can't directly use dynamic imports with ts-node
    // https://github.com/TypeStrong/ts-node/discussions/1290
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const { AnsiUp } = await dynamicImport('ansi_up');
    const ansiup = new AnsiUp();
    _renderAnsi = (content: string): string => ansiup.ansi_to_html(content);
})();
// use identity while ansi_up loads
const renderAnsi: Renderer = (content: string): string =>
    _renderAnsi ? _renderAnsi(content) : content;

export default renderAnsi;
