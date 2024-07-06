import { ICell, INotebookContent, MultilineString } from '@jupyterlab/nbformat';
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

    function renderCell(cell: ICell): string {
        const source = joinMultilineString(cell.source);

        switch (cell.cell_type) {
            case 'code':
                const executionCount = cell.execution_count?.toString() ?? ' ';
                return contain(
                    [
                        contain(`In [${executionCount}]:`, 'execution-count'),
                        renderMarkdown(`\`\`\`${language}\n${source}\n\`\`\``),
                    ],
                    'cell-code',
                );
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
