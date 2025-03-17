/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export function createFakeApplicationConfig(): void {
  // #region code taken from the Steamdb extension
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let applicationConfig: any
        = {
          WEBAPI_BASE_URL: 'https://api.steampowered.com/',
        };

  for (const script of document.querySelectorAll<HTMLScriptElement>('script[src]')) {
    const scriptLanguage = new URL(script.src).searchParams.get('l');

    if (scriptLanguage !== null) {
      applicationConfig.LANGUAGE = scriptLanguage;
      break;
    }
  }

  // Game logo cdn
  const gameLogoUrl = document.querySelector<HTMLImageElement>('.profile_small_header_additional .gameLogo img')?.src;
  if (gameLogoUrl === undefined) {
    return;
  }
  const gameLogoUrlAppsIndex = gameLogoUrl.lastIndexOf('/apps/');

  if (gameLogoUrlAppsIndex > 0) {
    applicationConfig.STORE_ICON_BASE_URL = gameLogoUrl.substring(0, gameLogoUrlAppsIndex + '/apps/'.length);
  }

  // Media cdn
  for (const image of document.querySelectorAll<HTMLImageElement>('.achieveImgHolder > img')) {
    const index = image.src.lastIndexOf('/images/apps/');

    if (index > 0) {
      applicationConfig.MEDIA_CDN_COMMUNITY_URL = image.src.substring(0, index + 1);
      break;
    }
  }
  // #endregion

  applicationConfig = {
    ...applicationConfig,
    COUNTRY: navigator.language.split('-')[1],
    STORE_ITEM_BASE_URL: 'https://shared.fastly.steamstatic.com/store_item_assets/',
  };

  const applicationConfigElement = document.createElement('div');
  applicationConfigElement.id = 'application_config';
  applicationConfigElement.dataset.config = JSON.stringify(applicationConfig);
  // eslint-disable-next-line camelcase
  applicationConfigElement.dataset.loyalty_webapi_token = 'false';

  document.body.appendChild(applicationConfigElement);
}
