export interface SteamDBBrowser {
  runtime: {
    getURL(res: string): string;
    sendMessage(message: { contentScriptQuery: string; [key: string]: unknown; }): Promise<unknown>;
    id: string;
  };
  storage: {
    sync: {
      get(items: string[] | Record<string, unknown>): Promise<Record<string, unknown>>;
      set(item: Record<string, unknown>): Promise<void>;
      onChanged: {
        addListener(callback: StorageListener): void;
      };
    };
  };
  permissions: {
    request(): void;
    contains(permissions: unknown, callback: (result: boolean) => void): void;
    onAdded: {
      addListener(): void;
    };
    onRemoved: {
      addListener(): void;
    };
  };
  i18n: {
    getMessage(messageKey: string, substitutions?: string | string[]): string;
    getUILanguage(): string;
  };
}

declare global {
  interface Window {
    steamDBBrowser: SteamDBBrowser;
  }
}

export type StorageListener = (changes: Record<string, { oldValue: unknown; newValue: unknown; }>) => void;
