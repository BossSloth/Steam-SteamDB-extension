import './browser';
// eslint-disable-next-line no-duplicate-imports
import { getLang } from './browser';
import { createFakeApplicationConfig } from './fakeApplicationConfig';
import { injectPreferences } from './preferences';
import { getNeededScripts } from './script-loading';
import { getCdn, loadScript, loadScriptWithContent, loadStyle, Logger } from './shared';

async function loadJsScripts(scripts: string[]): Promise<void> {
  const jsScripts = scripts.filter(script => script.includes('.js'));
  for (const script of jsScripts) {
    // we need to wait for the previous script to load before loading the next one to avoid race conditions where variables are undefined
    // eslint-disable-next-line no-await-in-loop
    await loadScript(getCdn(script.replace('.js', '.min.js')));
  }
}

async function loadCssStyles(scripts: string[]): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const style of scripts.filter(script => script.includes('.css'))) {
    promises.push(loadStyle(getCdn(style)));
  }
  await Promise.all(promises);
}

async function initCommonScript(): Promise<void> {
  let commonScript = await (await fetch(getCdn('scripts/common.min.js'))).text();
  commonScript = commonScript.replaceAll('browser', 'steamDBBrowser');
  loadScriptWithContent(commonScript);
}

const applicationConfigUrls = [
  /steamcommunity\.com\/stats\//,
  /steamcommunity\.com\/id\/.+?\/stats\//,
];

function addPreferencesButton(): void {
  const defaultPreferencesButton = document.evaluate('//a[contains(@class, "popup_menu_item") and contains(text(), "Preferences")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLAnchorElement | null;
  if (defaultPreferencesButton !== null) {
    const newButton = defaultPreferencesButton.cloneNode() as HTMLAnchorElement;
    newButton.href += '&steamdb=true';
    newButton.innerHTML = `
            <img class="ico16" style="background: none" src="${getCdn('/icons/white.svg')}" alt="logo">
            <span>${window.steamDBBrowser.i18n.getMessage('steamdb_options')}</span>
        `;
    defaultPreferencesButton.after(newButton);
  }
}

export default async function WebkitMain(): Promise<void> {
  const href = window.location.href;

  if (!href.includes('https://store.steampowered.com') && !href.includes('https://steamcommunity.com')) {
    return;
  }

  Logger.log('plugin is running');

  const scripts = getNeededScripts();

  await Promise.all([
    initCommonScript(),
    getLang(),
    loadCssStyles(scripts),
  ]);
  await loadScript(getCdn('scripts/global.min.js'));

  for (const url of applicationConfigUrls) {
    if (url.test(href)) {
      createFakeApplicationConfig();
      break;
    }
  }

  await loadJsScripts(scripts);

  addPreferencesButton();

  if (window.location.href.includes('https://store.steampowered.com/account')) {
    injectPreferences();
  }
}
