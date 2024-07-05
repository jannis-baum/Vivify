import { ICell, INotebookContent, MultilineString } from '@jupyterlab/nbformat';
import renderMarkdown from './markdown';
import { Renderer } from './parser';

const renderNotebook: Renderer = (content: string): string => {
    const nb = JSON.parse(content) as INotebookContent;
    const language = nb.metadata.kernelspec?.language ?? nb.metadata.language_info?.name;

    function renderCell(cell: ICell): string {
        function joinMultilineString(str: MultilineString): string {
            return Array.isArray(str) ? str.join('') : str;
        }
        const source = joinMultilineString(cell.source);

        switch (cell.cell_type) {
            case 'code':
                return renderMarkdown(`\`\`\`${language}\n${source}\n\`\`\``);
            case 'markdown':
                return renderMarkdown(source);
            default:
                // 'raw' cells aren't normally rendered
                return '';
        }
    }

    return nb.cells.map(renderCell).join('\n\n');
};
export default renderNotebook;
