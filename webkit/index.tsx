import './browser';
import { getLang } from './browser';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { getCdn, loadScript, loadScriptWithContent, loadStyle, Logger } from './shared';

async function loadPageSpecificScripts() {
    let scripts = getNeededScripts();

    for (const script of scripts.filter(script => script.includes('.js'))) {
        await loadScript(getCdn(script.replace('.js', '.min.js')));
    }

    for (const style of scripts.filter(script => script.includes('.css'))) {
        await loadStyle(getCdn(style));
    }
}

export default async function WebkitMain() {
    const href = window.location.href;

    if (!href.includes('https://store.steampowered.com') && !href.includes('https://steamcommunity.com')) {
        return;
    }

    Logger.Log('plugin is running');
    let commonScript = await (await fetch(getCdn('scripts/common.min.js'))).text();
    commonScript = commonScript.replaceAll('browser', 'steamDBBrowser');
    loadScriptWithContent(commonScript);
    await getLang();
    await loadScript(getCdn('scripts/global.min.js'));

    loadPageSpecificScripts();

    if (window.location.href.includes('https://store.steampowered.com/account')) {
        injectPreferences();
    }
}
