import { ICell, INotebookContent, MultilineString } from '@jupyterlab/nbformat';
import renderMarkdown from './markdown';
import { Renderer } from './parser';

function joinMultilineString(str: MultilineString): string {
    return Array.isArray(str) ? str.join('') : str;
}

function renderCell(cell: ICell): string {
    return renderMarkdown(`\`\`\`\n${joinMultilineString(cell.source)}\n\`\`\``);
}

const renderNotebook: Renderer = (content: string): string => {
    const nb = JSON.parse(content) as INotebookContent;
    return nb.cells.map(renderCell).join('\n\n');
};
export default renderNotebook;
