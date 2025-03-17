import Millennium
import PluginUtils  # type: ignore

logger = PluginUtils.Logger("steam-db")

import json
import os
import shutil

import requests

WEBKIT_CSS_FILE = "steamdb-webkit.css"
CSS_ID = None
DEFAULT_HEADERS = {
    'Accept': 'application/json',
    'X-Requested-With': 'SteamDB',
    'User-Agent': 'https://github.com/BossSloth/Steam-SteamDB-extension',
    'Origin': 'https://github.com/BossSloth/Steam-SteamDB-extension',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
}
API_URL = 'https://extension.steamdb.info/api'

class Logger:
    @staticmethod
    def warn(message: str) -> None:
        logger.warn(message)

    @staticmethod
    def error(message: str) -> None:
        logger.error(message)

def GetPluginDir():
    return os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..'))

def Request(url: str, params: dict) -> str:
    response = None
    try:
        response = requests.get(url, params=params, headers=DEFAULT_HEADERS)
        response.raise_for_status()
        return response.text
    except Exception as error:
        return json.dumps({
            'success': False,
            'error': str(error) + ' ' + (response.text if response else 'No response')
        })

def GetApp(appid: int, contentScriptQuery: str) -> str:
    logger.log(f"Getting app info for {appid}")

    return Request(
        f'{API_URL}/ExtensionApp/',
        {'appid': int(appid)}
    )

def GetAppPrice(appid: int, currency: str, contentScriptQuery: str) -> str:
    logger.log(f"Getting app price for {appid} in {currency}")

    return Request(
        f'{API_URL}/ExtensionAppPrice/',
        {'appid': int(appid), 'currency': currency}
    )

def GetAchievementsGroups(appid: int, contentScriptQuery: str) -> str:
    logger.log(f"Getting achievements groups for {appid}")

    return Request(
        f'{API_URL}/ExtensionGetAchievements/',
        {'appid': int(appid)}
    )

class Plugin:
    def copy_webkit_files(self):
        webkitCssFilePath = os.path.join(GetPluginDir(), "public", WEBKIT_CSS_FILE)
        steamUIPath = os.path.join(Millennium.steam_path(), "steamui", "SteamDB", WEBKIT_CSS_FILE)

        logger.log(f"Copying css webkit file from {webkitCssFilePath} to {steamUIPath}")
        try:
            os.makedirs(os.path.dirname(steamUIPath), exist_ok=True)
            shutil.copy(webkitCssFilePath, steamUIPath)
        except Exception as e:
            logger.error(f"Failed to copy webkit file, {e}")

        CSS_ID = Millennium.add_browser_css(os.path.join("SteamDB", WEBKIT_CSS_FILE))

    def _front_end_loaded(self):
        self.copy_webkit_files()

    def _load(self):
        logger.log(f"bootstrapping SteamDB plugin, millennium {Millennium.version()}")
        self.copy_webkit_files()

        Millennium.ready()  # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading")
