import fs from 'fs';
import { globSync } from 'glob';
import { homedir } from 'os';
import path from 'path';

// NOTE: this type does not directly correspond to the config file: see
// defaultConfig, envConfigs and configFileBlocked
type Config = {
    // result in 1 long string which is join of all referenced files
    styles?: string;
    clientScripts?: string;
    // results in array of paths to scripts
    serverScripts?: string[];
    // results in array of ignore patterns
    dirListIgnore?: string[];
    port: number;
    timeout: number;
    pageTitle?: string;
    mdExtensions: string[];
    preferHomeTilde: boolean;
    renderHTML: boolean;
    // markdown-it plugin options
    /* eslint-disable @typescript-eslint/no-explicit-any */
    katexOptions?: any;
    tocOptions?: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    alertOptions?: {
        icons?: Record<string, string>;
        titles?: Record<string, string>;
        fallbackIcon?: string;
    };
};

// fills in values from config file config that are not present
const defaultConfig: Config = {
    port: 31622,
    mdExtensions: ['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn'],
    timeout: 10000,
    preferHomeTilde: true,
    renderHTML: false,
};

// configs that are overwritten by environment variables
const envConfigs: [string, keyof Config][] = [
    ['VIV_PORT', 'port'],
    ['VIV_TIMEOUT', 'timeout'],
];

// configs that can't be set through the config file
const configFileBlocked: (keyof Config)[] = ['port'];

const configPaths = [
    path.join(homedir(), '.config', 'vivify', 'config.json'),
    path.join(homedir(), '.config', 'vivify.json'),
    path.join(homedir(), '.vivify', 'config.json'),
    path.join(homedir(), '.vivify.json'),
];

// get all paths from glob pattern or array of glob patterns
const resolvePaths = (
    paths: string[] | string | undefined,
    baseDir: string | undefined,
): string[] => {
    if (paths === undefined) return [];

    const resolvePath = (p: string): string[] => {
        let resolved = p;
        if (resolved[0] === '~') {
            resolved = path.join(homedir(), resolved.slice(1));
        }
        if (resolved[0] !== '/' && baseDir !== undefined) {
            resolved = path.join(baseDir, resolved);
        }
        return globSync(resolved);
    };

    if (Array.isArray(paths)) return paths.map(resolvePath).flat();
    return resolvePath(paths);
};

// read contents of file at paths or files at paths
const getFileContents = (
    paths: string[] | string | undefined,
    baseDir: string | undefined,
): string => {
    return resolvePaths(paths, baseDir)
        .map((p) => fs.readFileSync(p, 'utf8'))
        .join('\n');
};

let configBaseDir: string | undefined = undefined;

const config = ((): Config => {
    let config: Config | undefined = undefined;
    // greedily find config
    for (const cp of configPaths) {
        if (!fs.existsSync(cp)) continue;
        try {
            config = JSON.parse(fs.readFileSync(cp, 'utf8'));
            configBaseDir = path.dirname(cp);
        } catch {}
        break;
    }

    // revert to default config if no config found
    config = config ?? structuredClone(defaultConfig);

    for (const key of configFileBlocked) {
        delete config[key];
    }

    // get styles, scripts and ignore files
    config.styles = getFileContents(config.styles, configBaseDir);
    config.clientScripts = getFileContents(config.clientScripts, configBaseDir);
    config.serverScripts = resolvePaths(config.serverScripts, configBaseDir);
    config.dirListIgnore = getFileContents(config.dirListIgnore, configBaseDir)
        .split('\n')
        .filter((pattern) => pattern !== '' && pattern[0] !== '#');

    // fill missing values from default config
    for (const [key, value] of Object.entries(defaultConfig)) {
        // @ts-expect-error: Typescript can't correctly pair key and value and
        // know the next line is legal
        if (config[key] === undefined) config[key] = value;
    }
    // environment overrides
    for (const [env, key] of envConfigs) {
        // @ts-expect-error: same thing
        if (process.env[env]) config[key] = process.env[env];
    }
    return config;
})();

export { config, configBaseDir };
export default config;

export const address = `http://localhost:${config.port}`;
