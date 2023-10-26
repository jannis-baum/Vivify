import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

type Config = {
    styles?: string;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    katexOptions?: any;
    pageTitle?: string;
};
let config: Config = {};

const configPaths = [
    path.join(homedir(), '.vivify', 'config.json'),
    path.join(homedir(), '.vivify.json'),
];

for (const cp of configPaths) {
    if (!fs.existsSync(cp)) continue;
    try {
        config = JSON.parse(fs.readFileSync(cp, 'utf8'));
        break;
    } catch {}
}

export default config;
