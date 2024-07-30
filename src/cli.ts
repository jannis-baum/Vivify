import { existsSync } from 'fs';
import { resolve as presolve } from 'path';
import config from './parser/config.js';
import axios from 'axios';

export const address = `http://localhost:${config.port}`;

export const getPathAndLine = (
    target: string,
): { path: string | undefined; line: number | undefined } => {
    const exp = /^(?<path>(?:.*?)(?<!\\)(?:\\\\)*)(?::(?<line>\d+))?$/;
    const groups = target.match(exp)?.groups;
    if (groups === undefined || !groups['path']) {
        return { path: undefined, line: undefined };
    }
    const path = groups['path'].replace('\\:', ':').replace('\\\\', '\\');
    const line = groups['line'] ? parseInt(groups['line']) : undefined;
    return { path, line };
};

const openTarget = async (target: string) => {
    const { path, line } = getPathAndLine(target);
    if (!path) {
        console.log(`Invalid target: ${target}`);
        return;
    }
    if (!existsSync(path)) {
        console.log(`File not found: ${path}`);
        return;
    }

    const resolvedPath = presolve(path);
    await axios.post(`${address}/_open`, {
        path: resolvedPath,
        command: line !== undefined ? 'SCROLL' : undefined,
        value: line,
    });
};

export const handleArgs = async () => {
    try {
        const args = process.argv.slice(2);
        const positional: string[] = [];
        let parseOptions = true;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (!(arg.startsWith('-') && parseOptions)) {
                positional.push(arg);
                continue;
            }
            switch (arg) {
                case '-v':
                case '--version':
                    console.log(`vivify-server ${process.env.VERSION ?? 'dev'}`);
                    break;
                case '--':
                    parseOptions = false;
                    break;
                default:
                    console.log(`Unknown option "${arg}"`);
            }
        }
        await Promise.all(positional.map((target) => openTarget(target)));
    } finally {
        if (process.env['NODE_ENV'] !== 'development') {
            // - viv executable waits for this string and then stops printing
            //   vivify-server's output and terminates
            // - the string itself is not shown to the user
            console.log('STARTUP COMPLETE');
        }
    }
};
