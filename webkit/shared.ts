import { callable } from '@steambrew/webkit';

export const VERSION = '4.14';
export const CDN = `https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@${VERSION}`;

export function getCdn(path: string): string {
  if (path.startsWith('/')) {
    return `${CDN}${path}`;
  }

  return `${CDN}/${path}`;
}

export async function loadScript(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
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

export function loadScriptWithContent(scriptString: string): void {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.innerHTML = scriptString;

  document.head.appendChild(script);
}

export async function loadStyle(src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const style = document.createElement('link');
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

const backendError = callable<[{ message: string; }]>('Logger.error');
const backendWarn = callable<[{ message: string; }]>('Logger.warn');

export const Logger = {
  error: (...message: string[]): void => {
    console.error('%c SteamDB plugin ', 'background: red; color: white', ...message);
    backendError({ message: message.join(' ') });
  },
  log: (...message: string[]): void => {
    console.log('%c SteamDB plugin ', 'background: purple; color: white', ...message);
  },
  warn: (...message: string[]): void => {
    console.warn('%c SteamDB plugin ', 'background: orange; color: white', ...message);
    backendWarn({ message: message.join(' ') });
  },
};
