import requests
import os
import json
from pathlib import Path

# Get the absolute path to the project root directory
ROOT_DIR = Path(__file__).parent.parent
BASE_URL = "https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@4.10/options/"
OPTIONS_FILES = ["options.html", "options.css", "options.js"]
TARGET_DIR = ROOT_DIR / "public" / "options"

def update_options():
    # Create target directory if it doesn't exist
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    
    for filename in OPTIONS_FILES:
        url = BASE_URL + filename
        try:
            # Fetch file from CDN
            response = requests.get(url)
            response.raise_for_status()
            
            # Save to local file
            target_path = TARGET_DIR / filename
            with open(target_path, 'w', encoding='utf-8') as f:
                f.write(response.text)
            
            print(f"Updated {filename}")
            
        except requests.RequestException as e:
            print(f"Error fetching {filename}: {e}")
        except IOError as e:
            print(f"Error writing {filename}: {e}")

if __name__ == "__main__":
    update_options()
