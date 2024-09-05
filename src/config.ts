import fs from 'fs';
import { homedir } from 'os';
import path from 'path';

// NOTE: this type does not directly correspond to the config file: see
// defaultConfig, envConfigs and configFileBlocked
type Config = {
    styles?: string;
    scripts?: string;
    dirListIgnore?: string[];
    port: number;
    timeout: number;
    pageTitle?: string;
    mdExtensions: string[];
    preferHomeTilde: boolean;
    // markdown-it plugin options
    /* eslint-disable @typescript-eslint/no-explicit-any */
    katexOptions?: any;
    tocOptions?: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
};

// fills in values from config file config that are not present
const defaultConfig: Config = {
    port: 31622,
    mdExtensions: ['markdown', 'md', 'mdown', 'mdwn', 'mkd', 'mkdn'],
    timeout: 10000,
    preferHomeTilde: true,
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

// read contents of file at paths or files at paths
const getFileContents = (
    paths: string[] | string | undefined,
    baseDir: string | undefined,
): string => {
    if (paths === undefined) return '';

    const getFileContent = (p: string): string => {
        let resolved = p;
        if (resolved[0] === '~') {
            resolved = path.join(homedir(), p.slice(1));
        }
        if (resolved[0] !== '/' && baseDir !== undefined) {
            resolved = path.join(baseDir, resolved);
        }
        return fs.existsSync(resolved) ? fs.readFileSync(resolved, 'utf8') : '';
    };

    if (Array.isArray(paths)) {
        return paths.map(getFileContent).join('\n');
    }
    return getFileContent(paths);
};

const config = ((): Config => {
    let config = undefined;
    let configBaseDir = undefined;
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
    config.scripts = getFileContents(config.scripts, configBaseDir);
    config.dirListIgnore = getFileContents(config.dirListIgnore, configBaseDir)
        .split('\n')
        .filter((pattern) => pattern !== '' && pattern[0] !== '#');

    // fill missing values from default config
    for (const [key, value] of Object.entries(defaultConfig)) {
        if (config[key] === undefined) config[key] = value;
    }
    // environment overrides
    for (const [env, key] of envConfigs) {
        if (process.env[env]) config[key] = process.env[env];
    }
    return config;
})();

export default config;

export const address = `http://localhost:${config.port}`;
