import { ICell, INotebookContent, MultilineString } from '@jupyterlab/nbformat';
import renderMarkdown from './markdown';
import { Renderer } from './parser';

const renderNotebook: Renderer = (content: string): string => {
    const nb = JSON.parse(content) as INotebookContent;
    const language = nb.metadata.kernelspec?.language ?? nb.metadata.language_info?.name;

    function joinMultilineString(str: MultilineString): string {
        return Array.isArray(str) ? str.join('') : str;
    }

    function renderCell(cell: ICell): string {
        return renderMarkdown(`\`\`\`${language}\n${joinMultilineString(cell.source)}\n\`\`\``);
    }

    return nb.cells.map(renderCell).join('\n\n');
};
export default renderNotebook;
