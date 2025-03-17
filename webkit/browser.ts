/* eslint-disable require-atomic-updates */
import { callable } from '@steambrew/webkit';
import { StorageListener } from './browser-types';
import { CDN, Logger, VERSION } from './shared';

// In this file we emulate the extension browser api for the steamdb extension

window.steamDBBrowser = {
  runtime: {
    id: 'kdbmhfkmnlmbkgbabkdealhhbfhlmmon', // Chrome
    getURL: (res: string): string => `${CDN}/${res}`,
    sendMessage,
  },
  storage: {
    sync: {
      onChanged: {
        addListener(callback: StorageListener): void {
          storageListeners.push(callback);
        },
      },
      get: getStorage,
      set: setStorage,
    },
  },
  /** Fake permissions */
  permissions: {
    request(): void {},
    contains: (_: unknown, callback: (result: boolean) => void): void => { callback(true); },
    onAdded: {
      addListener(): void {},
    },
    onRemoved: {
      addListener(): void {},
    },
  },
  i18n: {
    getMessage,
    getUILanguage: (): string => 'en-US',
  },
};

// #region Browser storage / options
export const STORAGE_KEY = 'steamdb-options';

function parseStoredData(): Record<string, unknown> {
  const storedData = localStorage.getItem(STORAGE_KEY);
  try {
    return storedData !== null ? JSON.parse(storedData) as Record<string, unknown> : {};
  } catch {
    throw new Error(`Failed to parse JSON for key: ${STORAGE_KEY}`);
  }
}

async function getStorage(items: string[] | Record<string, unknown>): Promise<Record<string, unknown>> {
  const parsedData = parseStoredData();
  const result: Record<string, unknown> = {};

  if (Array.isArray(items)) {
    items.forEach((key) => {
      if (key in parsedData) {
        result[key] = parsedData[key];
      }
    });
  } else if (typeof items === 'object') {
    for (const key in items) {
      result[key] = key in parsedData ? parsedData[key] : items[key];
    }
  }

  return Promise.resolve(result);
}

const storageListeners: StorageListener[] = [];

async function setStorage(item: Record<string, unknown>): Promise<void> {
  const parsedData = parseStoredData();

  const key = Object.keys(item)[0];
  if (key === undefined) {
    return;
  }
  storageListeners.forEach((callback) => {
    callback({
      [key]: {
        oldValue: parsedData[key],
        newValue: item[key],
      },
    });
  });

  Object.assign(parsedData, item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

  return Promise.resolve();
}
// #endregion

// #region i18n Translation
const langPrefix = 'steamDB_';
let langKey = '';

export async function getLang(): Promise<void> {
  const language = navigator.language.replace('-', '_');
  const shortLanguage = language.split('_')[0] ?? 'en';
  langKey = langPrefix + shortLanguage;

  // Handle es-419 exception
  if (language === 'es_419') {
    langKey = `${langPrefix}es_419`;
  }

  const longLangKey = langPrefix + language;

  if (localStorage.getItem(langKey + VERSION) === null) {
    if (localStorage.getItem(longLangKey + VERSION) !== null) {
      Logger.log(`using "${language}" lang`);
      langKey = longLangKey;

      return;
    }

    Logger.log(`fetching "${shortLanguage}" lang`);

    async function fetchLangFile(lang: string): Promise<Response> {
      return fetch(`${CDN}/_locales/${lang}/messages.json`);
    }

    let response = await fetchLangFile(shortLanguage);

    if (!response.ok) {
      Logger.warn(`failed to fetch SteamDB lang file for "${shortLanguage}". Trying "${language}"`);
      langKey = longLangKey;

      response = await fetchLangFile(language);

      if (!response.ok) {
        Logger.warn(`failed to fetch SteamDB lang file for "${language}". Falling back to EN.`);
        langKey = `${langPrefix}en`;
        response = await fetchLangFile('en');
      }
    }

    if (response.ok) {
      localStorage.setItem(langKey + VERSION, JSON.stringify(await response.json()));
    } else {
      throw new Error('Failed to load any language file.');
    }
  }

  Logger.log(`using "${langKey.replace(langPrefix, '')}" lang`);
}

/**
 * @example
 * Example record
 * {
 *    "message": "$positive$ of the $total$ reviews are positive (all purchase types)",
 *    "placeholders": {
 *        "positive": {
 *            "content": "$1",
 *            "example": "123,456"
 *        },
 *        "total": {
 *            "content": "$2",
 *            "example": "456,789"
 *        }
 *    }
 * }
 */
interface Placeholder {
  content: string;
  example?: string;
}

interface LangObject {
  message: string;
  placeholders?: Record<string, Placeholder>;
}

type LangType = Record<string, LangObject | undefined>;

function getMessage(messageKey: string, substitutions: string | string[]): string {
  // Ignore invalid message key
  if (messageKey === '@@bidi_dir') {
    return messageKey;
  }

  if (!Array.isArray(substitutions)) {
    substitutions = [substitutions];
  }
  const lang = JSON.parse(localStorage.getItem(langKey + VERSION) ?? '{}') as LangType | null;
  if (lang === null || Object.keys(lang).length === 0) {
    Logger.error('SteamDB lang file not loaded in.');

    return messageKey;
  }

  const langObject = lang[messageKey];
  if (langObject === undefined) {
    Logger.error(`Unknown message key: ${messageKey}`);

    return messageKey;
  }

  let messageTemplate = langObject.message;
  if (langObject.placeholders) {
    Object.entries(langObject.placeholders).forEach(([key, value], index) => {
      const regex = new RegExp(`\\$${key}\\$`, 'g');
      messageTemplate = messageTemplate.replace(regex, substitutions[index] ?? value.content);
    });
  }

  return messageTemplate;
}
// #endregion

async function sendMessage(message: { contentScriptQuery: string; [key: string]: unknown; }): Promise<unknown> {
  const method = callable<[unknown]>(message.contentScriptQuery);
  const response = await method(message) as string;

  return JSON.parse(response);
}

// #region Open extension links in new window
// eslint-disable-next-line @typescript-eslint/no-deprecated
const oldCreateElement = document.createElement.bind(document) as (tagName: string, options?: ElementCreationOptions) => HTMLElement;

const externalLinks = ['pcgamingwiki.com'];

const popupLinks = ['steamdb.info'];

const EXTERNAL_PROTOCOL = 'steam://openurl_external/';

function modifyHrefForExternalLinks(tag: HTMLAnchorElement): void {
  externalLinks.forEach((link) => {
    if (tag.href.includes(link)) {
      tag.href = EXTERNAL_PROTOCOL + tag.href;
    }
  });
}

function addPopupClickListener(tag: HTMLAnchorElement): void {
  popupLinks.forEach((link) => {
    if (tag.href.includes(link)) {
      tag.onclick = (event): void => {
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
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
        modifyHrefForExternalLinks(tag);
        addPopupClickListener(tag);
        observer.disconnect();
      }
    });
  });

  observer.observe(tag, { attributes: true });
}

// eslint-disable-next-line @typescript-eslint/no-deprecated
document.createElement = function createElement(tagName: string, options?: ElementCreationOptions): HTMLElement {
  const tag = oldCreateElement(tagName, options);

  if (tagName.toLowerCase() === 'a') {
    observeAnchorTag(tag as HTMLAnchorElement);
  }

  return tag;
};
// #endregion
