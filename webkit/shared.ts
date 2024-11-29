import type { Millennium as MillType } from "millennium-lib";

export const VERSION = "4.10";
export const CDN = `https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@${VERSION}`;

export function getCdn(path: string) {
    return `${CDN}/${path}`;
}

declare global{
    interface Window {
        browser: any;
    }
    const Millennium: MillType;
}