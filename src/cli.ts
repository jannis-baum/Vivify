import { existsSync } from 'fs';
import { resolve as presolve } from 'path';
import config from './parser/config.js';
import open from 'open';
import { pathToURL, preferredPath } from './utils/path.js';
import axios from 'axios';

export const address = `http://localhost:${config.port}`;

const openTarget = async (path: string, scroll: string | undefined) => {
    if (!existsSync(path)) {
        console.log(`File not found: ${path}`);
        return;
    }

    const resolvedPath = presolve(path);
    if (scroll !== undefined) {
        await axios.post(`${address}/_queue`, {
            path: resolvedPath,
            command: 'SCROLL',
            value: scroll,
        });
    }
    await open(`${address}${pathToURL(preferredPath(resolvedPath))}`);
};

export const handleArgs = async () => {
    try {
        const args = process.argv.slice(2);
        const parsed: { target?: string; scroll?: string } = {};
        const setArg = (arg: keyof typeof parsed, value: string) => {
            if (arg in parsed) {
                console.log(`Duplicate argument for "${arg}", skipping`);
            } else {
                parsed[arg] = value;
            }
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (!arg.startsWith('-')) {
                setArg('target', arg);
                continue;
            }
            switch (arg) {
                case '-v':
                case '--version':
                    console.log(`vivify-server ${process.env.VERSION ?? 'dev'}`);
                    break;
                case '-s':
                case '--scroll':
                    setArg('scroll', args[++i]);
                    break;
                default:
                    console.log(`Unknown option "${arg}"`);
            }
        }
        if (parsed.target) {
            await openTarget(parsed.target, parsed.scroll);
        }
    } finally {
        if (process.env['NODE_ENV'] !== 'development') {
            // - viv executable waits for this string and then stops printing
            //   vivify-server's output and terminates
            // - the string itself is not shown to the user
            console.log('STARTUP COMPLETE');
        }
    }
};
