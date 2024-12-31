import { STORAGE_KEY } from './browser';
import { CDN } from './shared';

export function injectPreferences() {
    const sidebarContainer = document.querySelector('.two_column.left');
    const mainContainer = document.querySelector('.two_column.right');

    const steamdbOptions = document.createElement('div');
    steamdbOptions.setAttribute('id', 'steamdb-options');
    steamdbOptions.classList.add('nav_item');
    steamdbOptions.innerHTML = `<img class="ico16" src="${CDN}/icons/white.svg" alt="logo"> <span>SteamDB Options</span>`;

    sidebarContainer.appendChild(steamdbOptions);

    steamdbOptions.addEventListener('click', async () => {
        sidebarContainer.querySelectorAll('.active').forEach((element) => {
            element.classList.remove('active');
        });
        steamdbOptions.classList.toggle('active');

        const url = new URL(window.location.href);
        url.search = '';
        url.searchParams.set('steamdb', 'true');
        window.history.replaceState({}, '', url.href);

        const optionsHtml = await (await fetch(`${CDN}/options/options.html`)).text();
        await Promise.all([
            loadStyle(),
            loadScript(),
        ]);

        mainContainer.innerHTML = optionsHtml;

        // Create reset button
        let resetButton = document.createElement('button');
        resetButton.onclick = () => {
            if (!window.confirm('Are you sure you want to reset all options?')) {
                return;
            }

            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        };
        resetButton.classList.add('queue_control_button');
        resetButton.style.marginTop = '1rem';

        const span = document.createElement('span');
        span.dataset.tooltipText = 'Will reset all options to their default values.';
        span.innerText = 'Reset options!';
        resetButton.appendChild(span);

        mainContainer.appendChild(resetButton);
    });

    const url = new URL(window.location.href);
    if (url.searchParams.get('steamdb') === 'true') {
        steamdbOptions.click();
    }
}

async function loadStyle() {
    let styleContent = await (await fetch(`${CDN}/options/options.css`)).text();

    let style = document.createElement('style');
    style.innerHTML = styleContent;
    document.head.appendChild(style);
}

async function loadScript() {
    let scriptContent = await (await fetch(`${CDN}/options/options.js`)).text();

    let script = document.createElement('script');
    script.innerHTML = scriptContent;
    document.head.appendChild(script);
}
