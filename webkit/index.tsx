import './browser';
import { getLang } from './browser';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { getCdn, Logger } from "./shared";

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

function loadScriptWithContent(scriptString: string) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.innerHTML = scriptString;

    document.head.appendChild(script);
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
        await loadScript(getCdn(script.replace('.js', '.min.js')));
    }

    for (const style of scripts.filter(script => script.includes(".css"))) {
        await loadStyle(getCdn(style));
    }
}

export default async function WebkitMain () {
    const href = window.location.href;

    if (!href.includes("https://store.steampowered.com") && !href.includes("https://steamcommunity.com")) {
        return;
    }

    Logger.Log("plugin is running");
    let commonScript = await (await fetch(getCdn('scripts/common.min.js'))).text();
    commonScript = commonScript.replaceAll('browser', 'steamDBBrowser');
    loadScriptWithContent(commonScript);
    await getLang();
    await loadScript(getCdn("scripts/global.min.js"));

    loadPageSpecificScripts(); 

    if (window.location.href.includes("https://store.steampowered.com/account")) {
       injectPreferences(); 
    }
}