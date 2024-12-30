import { callable } from "@steambrew/webkit";
import { CDN, Logger, VERSION } from "./shared";

// In this file we emulate the extension browser api for the steamdb extension

window.steamDBBrowser = {};
const steamDBBrowser = window.steamDBBrowser;

//#region Browser storage / options
steamDBBrowser.storage = {};
steamDBBrowser.storage.sync = {};
steamDBBrowser.storage.sync.onChanged = {};
steamDBBrowser.runtime = {};
steamDBBrowser.runtime.id = 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon'; // Chrome

export const STORAGE_KEY = 'steamdb-options';

steamDBBrowser.storage.sync.get = async function (items: any): Promise<any> {
    let storedData = localStorage.getItem(STORAGE_KEY);
    let result: { [key: string]: any } = {};
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        Logger.Error('failed to parse JSON for steamdb-options');
    }

    if (Array.isArray(items)) {
        items.forEach(key => {
            if (key in parsedData) {
                result[key] = parsedData[key];
            }
        });
    }
    if (typeof items === 'object') {
            for (let key in items) {
                let foundItem = key in parsedData ? parsedData[key] : items[key];
                if (typeof foundItem === 'boolean') {
                    result[key] = foundItem
                }
            }
    }

    return result;
}

steamDBBrowser.storage.sync.set = async function (item: { [key: string]: any }) {
    let storedData = localStorage.getItem(STORAGE_KEY);
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        Logger.Error('failed to parse JSON for steamdb-options');
    }

    let key = Object.keys(item)[0];
    storageListeners.forEach(callback => {
        callback({
            [key]: {
                oldValue: parsedData[key],
                newValue: item[key]
            }
        });
    });

    Object.assign(parsedData, item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
}

steamDBBrowser.storage.sync.onChanged = {};
let storageListeners: ((changes: { [key: string]: { oldValue: any; newValue: any; } }) => void)[] = [];
steamDBBrowser.storage.sync.onChanged.addListener = function (callback: (changes: { [key: string]: { oldValue: any; newValue: any; } }) => void) {
    storageListeners.push(callback);
}
//#endregion

//#region fake permissions
steamDBBrowser.permissions = {};
steamDBBrowser.permissions.request = function () {};
steamDBBrowser.permissions.onAdded = {};
steamDBBrowser.permissions.onAdded.addListener = function () {};
steamDBBrowser.permissions.onRemoved = {};
steamDBBrowser.permissions.onRemoved.addListener = function () {};
steamDBBrowser.permissions.contains = function (_: any, callback: (result: boolean) => void) {
    callback(true);
};
//#endregion

// #region i18n Translation
steamDBBrowser.i18n = {};
const langPrefix = "steamDB_";
let langKey = "";
export async function getLang() {
    let language = navigator.language.toLowerCase().split("-")[0];
    const longLanguage = navigator.language.replaceAll('-', "_");
    langKey = langPrefix + language;

    // Make an exception for es-419
    if (navigator.language === "es-419") {
        language = 'es_419';
        langKey = langPrefix + language;
    }

    if (localStorage.getItem(langKey + VERSION) === null) {
        if (localStorage.getItem(langPrefix + longLanguage + VERSION) !== null) {
            Logger.Log(`using "${longLanguage}" lang`);
            langKey = langPrefix + longLanguage;
            return;
        }
        Logger.Log(`getting "${language}" lang`);

        let response = await fetch(CDN + `/_locales/${language}/messages.json`);

        if (!response.ok) {
            // Try full language key
            Logger.Warn(`failed to fetch SteamDB lang file for "${language}". Trying "${longLanguage}"`);
            langKey = langPrefix + longLanguage;

            response = await fetch(CDN + `/_locales/${longLanguage}/messages.json`);

            if (!response.ok) {
                Logger.Warn(`failed to fetch SteamDB lang file for "${language}". Falling back to EN.`);
                langKey = langPrefix + "en";
                response = await fetch(CDN + "/_locales/en/messages.json");
            
            }
        }
        localStorage.setItem(langKey + VERSION, JSON.stringify(await response.json()));
    } 

    Logger.Log(`using "${language}" lang`);
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
steamDBBrowser.i18n.getMessage = function (messageKey: string, substitutions: string|string[]) {
    // Ignore invalid message key
    if (messageKey === '@@bidi_dir') {
        return messageKey;
    }

    if (!Array.isArray(substitutions)) {
        substitutions = [substitutions];
    }
    type LangType = Record<string, { message: string; placeholders?: Record<string, { content: string; }> }>|null;
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
}
steamDBBrowser.i18n.getUILanguage = function () {
    return 'en-US';
}
// #endregion

//#region getResourceUrl
steamDBBrowser.runtime = {};

steamDBBrowser.runtime.getURL = function (res: string) {
    return CDN + "/" + res;
}
//#endregion

steamDBBrowser.runtime.sendMessage = async function (message: any) {
    const method = callable<[any]>(message.contentScriptQuery);
    let response = await method(message) as string;
    return JSON.parse(response);
}

//#region add external to newly created a tags
let oldCreateElement = document.createElement.bind(document);

document.createElement = function (tagName: string, options?: ElementCreationOptions) {
    let tag: HTMLAnchorElement = oldCreateElement(tagName, options);

    if (tagName.toLowerCase() === "a") {
        var callback = function(mutationsList: MutationRecord[], observer: MutationObserver) {
            for(let mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                    // if (!tag.href.includes('steampowered.com') && !tag.href.includes('steamcommunity.com')) {
                    //     tag.href = "steam://openurl_external/" + tag.href;
                    // }
                    if (tag.href.includes('steamdb.info') || tag.href.includes('pcgamingwiki.com')) {
                        tag.onclick = (e) => {
                            if (e.ctrlKey) {
                                return;
                            }
                            e.preventDefault();

                            // Click on element with ctrl
                            const event = new MouseEvent('click', { bubbles: true,
                                cancelable: true,
                                view: window,
                                ctrlKey: true });
                            tag.dispatchEvent(event);
                        };
                    }

                    observer.disconnect();
                }
            }
        };

        var observer = new MutationObserver(callback);

        observer.observe(tag, { attributes: true });
    }

    return tag;
}
//#endregion
