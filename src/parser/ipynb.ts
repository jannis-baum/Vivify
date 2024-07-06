import {
    ICell,
    ICodeCell,
    INotebookContent,
    IOutput,
    IStream,
    MultilineString,
} from '@jupyterlab/nbformat';
import renderAnsi from './ansi';
import renderMarkdown from './markdown';
import { Renderer } from './parser';

function joinMultilineString(str: MultilineString): string {
    return Array.isArray(str) ? str.join('') : str;
}

function contain(
    content: MultilineString,
    classNames: string | string[],
    tag: string = 'div',
): string {
    function prefix(classNames: string | string[]): string {
        if (Array.isArray(classNames)) {
            return classNames.map((c) => prefix(c)).join(' ');
        }
        return `ipynb-${classNames}`;
    }
    classNames = prefix(classNames);

    return `<${tag} class="${classNames}">${joinMultilineString(content)}</${tag}>`;
}

const renderNotebook: Renderer = (content: string): string => {
    const nb = JSON.parse(content) as INotebookContent;
    const language = nb.metadata.kernelspec?.language ?? nb.metadata.language_info?.name;

    function renderOutput(output: IOutput): string {
        switch (output.output_type) {
            case 'stream':
                const text = joinMultilineString((output as IStream).text);
                return contain(renderAnsi(text), 'output-stream', 'pre');
            case 'error':
            case 'execute_result':
            case 'display_data':
            default:
                return '';
        }
    }

    function renderCell(cell: ICell): string {
        const source = joinMultilineString(cell.source);

        switch (cell.cell_type) {
            case 'code':
                const executionCount = cell.execution_count?.toString() ?? ' ';
                const content = [
                    contain(`In [${executionCount}]:`, 'execution-count'),
                    renderMarkdown(`\`\`\`${language}\n${source}\n\`\`\``),
                ];
                if (Array.isArray(cell.outputs)) {
                    content.push(...(cell as ICodeCell).outputs.map(renderOutput));
                }
                return contain(content, 'cell-code');
            case 'markdown':
                return contain(renderMarkdown(source), 'cell-markdown');
            default:
                // 'raw' cells aren't normally rendered
                return '';
        }
    }

    return nb.cells.map(renderCell).join('\n\n');
};
export default renderNotebook;
