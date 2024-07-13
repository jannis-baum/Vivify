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
    if (config.styles && config.styles.length > 0) {
        const stylePath =
            config.styles[0] === '~' ? path.join(homedir(), config.styles.slice(1)) : config.styles;
        config.styles = fs.existsSync(stylePath) ? fs.readFileSync(stylePath, 'utf8') : '';
    }
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
