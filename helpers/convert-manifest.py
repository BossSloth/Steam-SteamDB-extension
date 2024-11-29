import json
import re
import requests
from collections import defaultdict

filtered_scripts = ['scripts/common.js', 'scripts/global.js', 'scripts/store/invalidate_cache.js']

def url_to_regex(url):
    return re.escape(url).replace('\*', '.*')

def convert_to_js(manifest_file):
    response = requests.get(manifest_file)
    data = json.loads(response.text)

    content_scripts = data['content_scripts']
    combined_matches = defaultdict(list)

    for script in content_scripts[1:]:
        matches = script['matches']
        js_files = script['js']

        # Convert matches to regex using custom function
        combined_matches_str = ' || '.join(['href.match("{}")'.format(url_to_regex(m)) for m in matches])
        combined_matches[combined_matches_str].extend(js_files)

    for match, js_files in combined_matches.items():
        unique_js_files = list(dict.fromkeys(js_files))
        filtered_js_files = [js_file for js_file in unique_js_files if js_file not in filtered_scripts]
        if len(filtered_js_files) == 0:
            continue

        print('if ({}) {{'.format(match))
        for js_file in filtered_js_files:
            print('    scripts.push("{}");'.format(js_file))
        print('}\n')

if __name__ == "__main__":
    convert_to_js('https://cdn.jsdelivr.net/gh/SteamDatabase/BrowserExtension@4.10/manifest.json')
