import { STORAGE_KEY } from './browser';
import { CDN, getCdn, loadScript, loadStyle } from './shared';

export function injectPreferences(): void {
  const sidebarContainer = document.querySelector('.two_column.left');
  const mainContainer = document.querySelector('.two_column.right');

  if (!sidebarContainer || !mainContainer) {
    return;
  }

  const steamdbOptions = document.createElement('div');
  steamdbOptions.setAttribute('id', 'steamdb-options');
  steamdbOptions.classList.add('nav_item');
  steamdbOptions.innerHTML = `<img class="ico16" src="${CDN}/icons/white.svg" alt="logo"> <span>SteamDB Options</span>`;

  sidebarContainer.appendChild(steamdbOptions);

  steamdbOptions.addEventListener('click', async () => onOptionsClick(sidebarContainer, steamdbOptions, mainContainer));

  const url = new URL(window.location.href);
  if (url.searchParams.get('steamdb') === 'true') {
    steamdbOptions.click();
  }
}

async function onOptionsClick(sidebarContainer: Element, steamdbOptions: Element, mainContainer: Element): Promise<void> {
  sidebarContainer.querySelectorAll('.active').forEach((element: Element) => {
    element.classList.remove('active');
  });
  steamdbOptions.classList.toggle('active');

  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('steamdb', 'true');
  window.history.replaceState({}, '', url.href);

  mainContainer.innerHTML = await (await fetch(`${CDN}/options/options.html`)).text();

  await Promise.all([
    loadStyle(getCdn('/options/options.css')),
    loadScript(getCdn('/options/options.js')),
  ]);

  // Create reset button
  const resetButton = document.createElement('div');
  resetButton.onclick = (): void => {
    if (!window.confirm('Are you sure you want to reset all options?')) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };
  resetButton.classList.add('store_header_btn');
  resetButton.classList.add('store_header_btn_gray');
  resetButton.style.position = 'fixed';
  resetButton.style.bottom = '1em';
  resetButton.style.right = '1em';
  resetButton.style.cursor = 'pointer';

  const span = document.createElement('span');
  span.dataset.tooltipText = 'Will reset all options to their default values.';
  span.innerText = 'Reset options!';
  span.style.margin = '1em';
  resetButton.appendChild(span);

  mainContainer.appendChild(resetButton);
}
