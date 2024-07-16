import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

type Config = {
    styles?: string;
    port: number;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    katexOptions?: any;
    pageTitle?: string;
    mdExtensions: string[];
    timeout: number;
    preferHomeTilde: boolean;
};

const defaultConfig: Config = {
    port: 31622,
    mdExtensions: ['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn'],
    timeout: 10000,
    preferHomeTilde: true,
};

const envConfigs: [string, keyof Config][] = [
    ['VIV_PORT', 'port'],
    ['VIV_TIMEOUT', 'timeout'],
];

const configPaths = [
    path.join(homedir(), '.vivify', 'config.json'),
    path.join(homedir(), '.vivify.json'),
];

// read contents of file at paths or files at paths
const getFileContents = (paths: string[] | string | undefined): string => {
    if (paths === undefined) return '';
    const getFileContent = (p: string): string => {
        const resolved = p[0] === '~' ? path.join(homedir(), p.slice(1)) : p;
        return fs.existsSync(resolved) ? fs.readFileSync(resolved, 'utf8') : '';
    };

    if (Array.isArray(paths)) {
        return paths.map(getFileContent).join('\n');
    }
    return getFileContent(paths);
};

const getConfig = (): Config => {
    let config = undefined;
    // greedily get config
    for (const cp of configPaths) {
        if (!fs.existsSync(cp)) continue;
        try {
            config = JSON.parse(fs.readFileSync(cp, 'utf8'));
            break;
        } catch {}
    }

    if (config === undefined) return defaultConfig;

    // get styles
    config.styles = getFileContents(config.styles);

    // fill missing values from default config
    for (const [key, value] of Object.entries(defaultConfig)) {
        if (config[key] === undefined) config[key] = value;
    }
    // environment overrides
    for (const [env, key] of envConfigs) {
        if (process.env[env]) config[key] = process.env[env];
    }
    return config;
};

export default getConfig();
