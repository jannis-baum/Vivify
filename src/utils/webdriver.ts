import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';
import { createServer } from 'net';
import { delimiter, join } from 'path';

export type DriverKind = 'firefox' | 'chrome';

export interface Driver {
    kind: DriverKind;
    path: string;
    bin: string;
}

// WebDriver binaries we know how to drive, in order of preference
const KNOWN_DRIVERS: { kind: DriverKind; bin: string }[] = [
    { kind: 'firefox', bin: 'geckodriver' },
    { kind: 'chrome', bin: 'chromedriver' },
];

const findExecutable = (name: string): string | undefined => {
    for (const dir of (process.env.PATH ?? '').split(delimiter)) {
        if (!dir) continue;
        const candidate = join(dir, name);
        if (existsSync(candidate)) return candidate;
    }
    return undefined;
};

// Detect an available WebDriver on the user's PATH, or undefined if none.
export const findDriver = (): Driver | undefined => {
    for (const { kind, bin } of KNOWN_DRIVERS) {
        const path = findExecutable(bin);
        if (path) return { kind, path, bin };
    }
    return undefined;
};

const freePort = (): Promise<number> =>
    new Promise((resolve, reject) => {
        const srv = createServer();
        srv.on('error', reject);
        srv.listen(0, () => {
            const addr = srv.address();
            const port = typeof addr === 'object' && addr ? addr.port : 0;
            srv.close(() => resolve(port));
        });
    });

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export interface PrintOptions {
    widthCm: number;
    heightCm: number;
}

// Minimal WebDriver (W3C) client that speaks just enough of the protocol to
// load a page, measure it, and print it. Uses Node's built-in fetch and
// child_process only — no npm dependencies.
export class BrowserSession {
    private constructor(
        private readonly process: ChildProcess,
        private readonly base: string,
        private readonly sessionId: string,
    ) {}

    static async launch(driver: Driver): Promise<BrowserSession> {
        const port = await freePort();
        const args = driver.kind === 'firefox' ? ['--port', String(port)] : [`--port=${port}`];
        const proc = spawn(driver.path, args, { stdio: 'ignore' });
        const base = `http://127.0.0.1:${port}`;

        try {
            await BrowserSession.waitUntilReady(base);
            const sessionId = await BrowserSession.createSession(base, driver.kind);
            return new BrowserSession(proc, base, sessionId);
        } catch (error) {
            proc.kill();
            throw error;
        }
    }

    private static async waitUntilReady(base: string): Promise<void> {
        for (let i = 0; i < 100; i++) {
            try {
                const res = await fetch(`${base}/status`);
                const json = (await res.json()) as { value?: { ready?: boolean } };
                if (json.value?.ready) return;
            } catch {
                // driver process not accepting connections yet
            }
            await sleep(100);
        }
        throw new Error('WebDriver did not become ready');
    }

    private static async createSession(base: string, kind: DriverKind): Promise<string> {
        const browserOptions =
            kind === 'firefox'
                ? { 'moz:firefoxOptions': { args: ['-headless'] } }
                : { 'goog:chromeOptions': { args: ['--headless=new', '--disable-gpu'] } };
        const res = await fetch(`${base}/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                capabilities: { alwaysMatch: { ...browserOptions, timeouts: { script: 60000 } } },
            }),
        });
        const json = (await res.json()) as { value?: { sessionId?: string; message?: string } };
        const sessionId = json.value?.sessionId;
        if (!sessionId) {
            throw new Error(`Could not start browser: ${json.value?.message ?? 'unknown error'}`);
        }
        return sessionId;
    }

    private async send<T>(method: string, path: string, body?: unknown): Promise<T> {
        const res = await fetch(`${this.base}/session/${this.sessionId}${path}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        const json = (await res.json()) as { value: T };
        if (!res.ok) {
            throw new Error(`WebDriver ${method} ${path} failed: ${JSON.stringify(json)}`);
        }
        return json.value;
    }

    async setViewportWidth(widthPx: number): Promise<void> {
        await this.send('POST', '/window/rect', { width: widthPx, height: 2000 });
    }

    async navigate(url: string): Promise<void> {
        await this.send('POST', '/url', { url });
    }

    async evaluateAsync<T>(script: string): Promise<T> {
        return this.send<T>('POST', '/execute/async', { script, args: [] });
    }

    async print({ widthCm, heightCm }: PrintOptions): Promise<Buffer> {
        const base64 = await this.send<string>('POST', '/print', {
            page: { width: widthCm, height: heightCm },
            margin: { top: 0, bottom: 0, left: 0, right: 0 },
            background: true,
            scale: 1,
            shrinkToFit: false,
        });
        return Buffer.from(base64, 'base64');
    }

    async close(): Promise<void> {
        try {
            await this.send('DELETE', '');
        } catch {
            // best effort; we kill the driver process regardless
        }
        this.process.kill();
    }
}
