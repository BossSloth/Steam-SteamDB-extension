/* eslint-disable @typescript-eslint/no-loop-func */
import clipboard from 'clipboardy';
import escapeStringRegexp from 'escape-string-regexp';
import { getCdn } from '../webkit/shared';

interface ContentScript {
  matches: string[];
  exclude_matches?: string[];
  js?: string[];
  css?: string[];
}

interface ManifestData {
  content_scripts: ContentScript[];
}

function urlToRegex(url: string): string {
  return `^${escapeStringRegexp(url).replace(/\\\*/g, '.*').replace(/\//g, '\\/')}$`;
}

const filtered = [
  'scripts/common.js',
  'scripts/global.js',
  'scripts/store/invalidate_cache.js',
  'scripts/steamdb/global.js',
  'styles/global.css',
  'styles/store.css',
  'styles/community.css',
];

async function convertToJs(): Promise<void> {
  const response = await fetch(getCdn('manifest.json'));
  const data = await response.text();
  const manifestData = JSON.parse(data) as ManifestData;
  const contentScripts = manifestData.content_scripts;
  const combinedMatches: Record<string, { js: string[]; css: string[]; }> = {};

  let output = '';

  for (const script of contentScripts) {
    const matches = script.matches;
    const excludes = script.exclude_matches;
    const jsFiles = script.js ?? [];
    const cssFiles = script.css ?? [];

    let combinedMatchesStr = matches.map(m => `href.match(/${urlToRegex(m)}/)`).join(' || ');
    combinedMatchesStr = `(${combinedMatchesStr})`;
    // Add the exclude_matches to the combinedMatchesStr
    if (excludes) {
      combinedMatchesStr += ` && !(${excludes.map(m => `href.match(/${urlToRegex(m)}/)`).join(' || ')})`;
    }
    if (combinedMatches[combinedMatchesStr] === undefined) {
      combinedMatches[combinedMatchesStr] = { js: [], css: [] };
    }
    combinedMatches[combinedMatchesStr]?.js.push(...jsFiles);
    combinedMatches[combinedMatchesStr]?.css.push(...cssFiles);
  }

  for (const [match, { js, css }] of Object.entries(combinedMatches)) {
    let uniqueJsFiles = Array.from(new Set(js));
    let uniqueCssFiles = Array.from(new Set(css));

    uniqueJsFiles = uniqueJsFiles.filter(file => !filtered.includes(file));
    uniqueCssFiles = uniqueCssFiles.filter(file => !filtered.includes(file));

    if (uniqueJsFiles.length === 0 && uniqueCssFiles.length === 0) {
      continue;
    }

    output += `    if (${match}) {\n`;
    uniqueJsFiles.forEach((jsFile) => {
      output += `        scripts.push('${jsFile}');\n`;
    });
    uniqueCssFiles.forEach((cssFile) => {
      output += `        scripts.push('${cssFile}');\n`;
    });
    output += '    }\n\n';
  }

  output = output.trimEnd();

  // Copy text to clipboard
  clipboard.writeSync(output);

  console.log('Copied to clipboard.');
}

convertToJs();
