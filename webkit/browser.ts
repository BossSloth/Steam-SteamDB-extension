import { CDN, VERSION } from "./shared";

// In this file we emulate the extension browser api for the steamdb extension

//#region Browser storage / options
window.browser = {};
window.browser.storage = {};
window.browser.storage.sync = {};
window.browser.storage.sync.onChanged = {};
window.browser.runtime = {};
window.browser.runtime.id = 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon'; // Chrome

export const STORAGE_KEY = 'steamdb-options';

window.browser.storage.sync.get = async function (items: any): Promise<any> {
    let storedData = localStorage.getItem(STORAGE_KEY);
    let result: { [key: string]: any } = {};
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        console.error('[SteamDB plugin] failed to parse JSON for steamdb-options');
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

window.browser.storage.sync.set = async function (item: { [key: string]: any }) {
    let storedData = localStorage.getItem(STORAGE_KEY);
    let parsedData: { [key: string]: any } = {};

    try {
        parsedData = storedData ? JSON.parse(storedData) : {};
    } catch (e) {
        console.error('[SteamDB plugin] failed to parse JSON for steamdb-options');
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

window.browser.storage.sync.onChanged = {};
let storageListeners: ((changes: { [key: string]: { oldValue: any; newValue: any; } }) => void)[] = [];
window.browser.storage.sync.onChanged.addListener = function (callback: (changes: { [key: string]: { oldValue: any; newValue: any; } }) => void) {
    storageListeners.push(callback);
}
//#endregion

//#region fake permissions
window.browser.permissions = {};
window.browser.permissions.request = function () {};
window.browser.permissions.onAdded = {};
window.browser.permissions.onAdded.addListener = function () {};
window.browser.permissions.onRemoved = {};
window.browser.permissions.onRemoved.addListener = function () {};
window.browser.permissions.contains = function (_: any, callback: (result: boolean) => void) {
    callback(true);
};
//#endregion

// #region i18n Translation
window.browser.i18n = {};
const langKey = "steamDB_en";
async function getLang() {
    if (localStorage.getItem(langKey + VERSION) === null) {
        console.log('[SteamDB plugin] getting EN lang');

        const response = await fetch(CDN + "/_locales/en/messages.json");
        localStorage.setItem(langKey + VERSION, JSON.stringify(await response.json()));
    }
}
getLang();

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
window.browser.i18n.getMessage = function (messageKey: string, substitutions: string|string[]) {
    if (messageKey === '@@bidi_dir') {
        return messageKey;
    }

    if (!Array.isArray(substitutions)) {
        substitutions = [substitutions];
    }

    let lang: Record<string, { message: string; placeholders?: Record<string, { content: string; }> }>|null = JSON.parse(sessionStorage.getItem(langKey) ?? '{}');
    if (lang === null || Object.keys(lang).length === 0) {
        console.error('[SteamDB plugin] SteamDB lang file not loaded in.');
        return messageKey;
    }

    const langObject = lang[messageKey];
    if (langObject === undefined) {
        console.error(`[SteamDB plugin] Unknown message key: ${messageKey}`);
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
window.browser.i18n.getUILanguage = function () {
    return 'en-US';
}
// #endregion

//#region getResourceUrl
window.browser.runtime = {};

window.browser.runtime.getURL = function (res: string) {
    return CDN + "/" + res;
}
//#endregion

window.browser.runtime.sendMessage = async function (message: any) {
    let response = await Millennium.callServerMethod(message.contentScriptQuery, message) as string; // We can't use the new callable here because it import millennium-lib which bloats the webkit.js file
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
                    if (tag.href.includes('steamdb.info')) {
                        tag.addEventListener('click', (e) => {
                            e.preventDefault();

                            // Middle click on the link
                            // if (e.button === 1) {
                            window.open(tag.href, 'BrowserViewPopup', `width=${window.screen.width*0.8},height=${window.screen.height*0.8},resizeable,status=0,toolbar=0,menubar=0,location=0`);
                            // }
                        });
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