import { callable } from '@steambrew/webkit';
import { CDN, Logger, VERSION } from './shared';

// In this file we emulate the extension browser api for the steamdb extension

window.steamDBBrowser = {};
const steamDBBrowser = window.steamDBBrowser;

steamDBBrowser.runtime = {};
steamDBBrowser.runtime.id = 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon'; // Chrome

//#region Browser storage / options
steamDBBrowser.storage = {};
steamDBBrowser.storage.sync = {};

export const STORAGE_KEY = 'steamdb-options';

function parseStoredData(): Record<string, any> {
    const storedData = localStorage.getItem(STORAGE_KEY);
    try {
        return storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        throw new Error(`Failed to parse JSON for key: ${STORAGE_KEY}`);
    }
}

steamDBBrowser.storage.sync.get = async function (items: any): Promise<any> {
    let parsedData = parseStoredData();
    let result: Record<string, any> = {};

    if (Array.isArray(items)) {
        items.forEach(key => {
            if (key in parsedData) {
                result[key] = parsedData[key];
            }
        });
    }
    if (typeof items === 'object') {
        for (let key in items) {
            result[key] = key in parsedData ? parsedData[key] : items[key];
        }
    }

    return result;
};

type StorageListener = (changes: Record<string, { oldValue: any; newValue: any; }>) => void;
let storageListeners: StorageListener[] = [];

steamDBBrowser.storage.sync.set = async function (item: Record<string, any>) {
    let parsedData = parseStoredData();

    let key = Object.keys(item)[0];
    storageListeners.forEach(callback => {
        callback({
            [key]: {
                oldValue: parsedData[key],
                newValue: item[key],
            },
        });
    });

    Object.assign(parsedData, item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
};

steamDBBrowser.storage.sync.onChanged = {};
steamDBBrowser.storage.sync.onChanged.addListener = function (callback: StorageListener) {
    storageListeners.push(callback);
};
//#endregion

//#region Fake permissions
steamDBBrowser.permissions = {};
steamDBBrowser.permissions.request = () => {};
steamDBBrowser.permissions.onAdded = {};
steamDBBrowser.permissions.onAdded.addListener = () => {};
steamDBBrowser.permissions.onRemoved = {};
steamDBBrowser.permissions.onRemoved.addListener = () => {};
steamDBBrowser.permissions.contains = (_: any, callback: (result: boolean) => void) => callback(true);
//#endregion

//#region i18n Translation
steamDBBrowser.i18n = {};
const langPrefix = 'steamDB_';
let langKey = '';

export async function getLang(): Promise<void> {
    const language = navigator.language.replace('-', '_');
    const shortLanguage = language.split('_')[0];
    langKey = langPrefix + shortLanguage;

    // Handle es-419 exception
    if (language === 'es_419') {
        langKey = langPrefix + 'es_419';
    }

    const longLangKey = langPrefix + language;

    if (!localStorage.getItem(langKey + VERSION)) {
        if (localStorage.getItem(longLangKey + VERSION)) {
            Logger.Log(`using "${language}" lang`);
            langKey = longLangKey;
            return;
        }

        Logger.Log(`fetching "${shortLanguage}" lang`);

        const fetchLangFile = async (lang: string) =>
            await fetch(`${CDN}/_locales/${lang}/messages.json`);

        let response = await fetchLangFile(shortLanguage);

        if (!response.ok) {
            Logger.Warn(`failed to fetch SteamDB lang file for "${shortLanguage}". Trying "${language}"`);
            langKey = longLangKey;

            response = await fetchLangFile(language);

            if (!response.ok) {
                Logger.Warn(`failed to fetch SteamDB lang file for "${language}". Falling back to EN.`);
                langKey = langPrefix + 'en';
                response = await fetchLangFile('en');
            }
        }

        if (response.ok) {
            localStorage.setItem(langKey + VERSION, JSON.stringify(await response.json()));
        } else {
            throw new Error('Failed to load any language file.');
        }
    }

    Logger.Log(`using "${langKey.replace(langPrefix, '')}" lang`);
}

/* example record
{
    "message": "$positive$ of the $total$ reviews are positive (all purchase types)",
    "placeholders": {
        "positive": {
            "content": "$1",
            "example": "123,456"
        },
        "total": {
            "content": "$2",
            "example": "456,789"
        }
    }
}
*/
interface Placeholder {
    content: string;
    example?: string;
}

interface LangObject {
    message: string;
    placeholders?: Record<string, Placeholder>;
}

type LangType = Record<string, LangObject>;
steamDBBrowser.i18n.getMessage = function (messageKey: string, substitutions: string | string[]) {
    // Ignore invalid message key
    if (messageKey === '@@bidi_dir') {
        return messageKey;
    }

    if (!Array.isArray(substitutions)) {
        substitutions = [substitutions];
    }
    let lang: LangType = JSON.parse(localStorage.getItem(langKey + VERSION) ?? '{}');
    if (lang === null || Object.keys(lang).length === 0) {
        Logger.Error('SteamDB lang file not loaded in.');
        return messageKey;
    }

    const langObject = lang[messageKey];
    if (langObject === undefined) {
        Logger.Error(`Unknown message key: ${messageKey}`);
        return messageKey;
    }

    let messageTemplate = langObject.message;
    if (langObject.placeholders) {
        Object.entries(langObject.placeholders).forEach(([key, value], index) => {
            const regex = new RegExp(`\\$${key}\\$`, 'g');
            messageTemplate = messageTemplate.replace(regex, substitutions[index] || value.content);
        });
    }

    return messageTemplate;
};
steamDBBrowser.i18n.getUILanguage = function () {
    return 'en-US';
};
//#endregion

//#region getResourceUrl
steamDBBrowser.runtime = {};

steamDBBrowser.runtime.getURL = function (res: string) {
    return CDN + '/' + res;
};
//#endregion

steamDBBrowser.runtime.sendMessage = async function (message: any) {
    const method = callable<[any]>(message.contentScriptQuery);
    let response = await method(message) as string;
    return JSON.parse(response);
};

//#region Open extension links in new window
const oldCreateElement = document.createElement.bind(document);

const popupLinks = [
    'steamdb.info',
    'pcgamingwiki.com',
];

function addPopupClickListener(tag: HTMLAnchorElement): void {
    popupLinks.forEach(link => {
        if (tag.href.includes(link)) {
            tag.onclick = (event) => {
                if (event.ctrlKey) {
                    return;
                }

                event.preventDefault();

                const ctrlClickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    ctrlKey: true,
                });

                tag.dispatchEvent(ctrlClickEvent);
            };
        }
    });
}

function observeAnchorTag(tag: HTMLAnchorElement): void {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                addPopupClickListener(tag);
                observer.disconnect();
            }
        });
    });

    observer.observe(tag, {attributes: true});
}

document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    const tag: HTMLAnchorElement = oldCreateElement(tagName, options);

    if (tagName.toLowerCase() === 'a') {
        observeAnchorTag(tag);
    }

    return tag;
};
//#endregion
