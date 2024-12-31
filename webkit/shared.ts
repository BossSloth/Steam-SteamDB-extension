export const VERSION = '4.10';
export const CDN = `https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@${VERSION}`;

export function getCdn(path: string) {
    if (path.startsWith('/')) {
        return `${CDN}${path}`;
    }

    return `${CDN}/${path}`;
}

export async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', src);

        script.addEventListener('load', () => {
            resolve();
        });

        script.addEventListener('error', () => {
            reject(new Error('Failed to load script'));
        });

        document.head.appendChild(script);
    });
}

export function loadScriptWithContent(scriptString: string) {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.innerHTML = scriptString;

    document.head.appendChild(script);
}

export async function loadStyle(src: string) {
    return new Promise<void>((resolve, reject) => {
        const style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('type', 'text/css');
        style.setAttribute('href', src);

        style.addEventListener('load', () => {
            resolve();
        });

        style.addEventListener('error', () => {
            reject(new Error('Failed to load style'));
        });

        document.head.appendChild(style);
    });
}


declare global {
    interface Window {
        steamDBBrowser: any;
    }
}

export const Logger = {
    Error: (...message: string[]) => {
        console.error('%c SteamDB plugin ', 'background: red; color: white', ...message);
    },
    Log: (...message: string[]) => {
        console.log('%c SteamDB plugin ', 'background: purple; color: white', ...message);
    },
    Warn: (...message: string[]) => {
        console.warn('%c SteamDB plugin ', 'background: orange; color: white', ...message);
    },
};
