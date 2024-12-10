import Millennium, PluginUtils # type: ignore
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.142.86 Safari/537.36',
}

def GetPluginDir():
    return os.path.abspath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..'))

def Request(url: str, params: dict) -> str:
    try:
        response = requests.get(url, params=params, headers=DEFAULT_HEADERS)
        response.raise_for_status()
        return response.text
    except Exception as error:
        return json.dumps({
            'success': False,
            'error': str(error) + ' ' + response.text
        })

def GetApp(appid: int, contentScriptQuery: str) -> str:
    logger.log(f"Getting app info for {appid}")

    return Request(
        f'https://steamdb.info/api/ExtensionApp/',
        {'appid': int(appid)}   
    )

def GetAppPrice(appid: int, currency: str, contentScriptQuery: str) -> str:
    logger.log(f"Getting app price for {appid} in {currency}")
    
    return Request(
        f'https://steamdb.info/api/ExtensionAppPrice/',
        {'appid': int(appid), 'currency': currency}
    )
    
def GetAchievementsGroups(appid: int, contentScriptQuery: str) -> str:
    logger.log(f"Getting achievements groups for {appid}")

    return Request(
        f'https://steamdb.info/api/ExtensionGetAchievements/',
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

        Millennium.ready() # this is required to tell Millennium that the backend is ready.

    def _unload(self):
        logger.log("unloading")
        if (CSS_ID != None):
            Millennium.remove_browser_module(CSS_ID)