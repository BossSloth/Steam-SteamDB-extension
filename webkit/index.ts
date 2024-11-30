import './browser';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { getCdn } from "./shared";

async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
        var script = document.createElement('script');
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

async function loadStyle(src: string) {
    return new Promise<void>((resolve, reject) => {
        var style = document.createElement('link');
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

async function loadPageSpecificScripts() {
    let scripts = getNeededScripts();

    for (const script of scripts.filter(script => script.includes(".js"))) {
        await loadScript(getCdn(script));
    }

    for (const style of scripts.filter(script => script.includes(".css"))) {
        await loadStyle(getCdn(style));
    }
}

export default async function WebkitMain () {
    console.log("SteamDB plugin is running...");

    await loadScript(getCdn("scripts/common.js"));
    await loadScript(getCdn("scripts/global.js"));

    loadPageSpecificScripts(); 

    if (window.location.href.includes("https://store.steampowered.com/account")) {
       injectPreferences(); 
    }
}