export const VERSION = "4.10";
export const CDN = `https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@${VERSION}`;

export function getCdn(path: string) {
    return `${CDN}/${path}`;
}

declare global{
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
    }
};