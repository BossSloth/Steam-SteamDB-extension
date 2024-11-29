import { STORAGE_KEY } from "./browser";
import { CDN } from "./shared";

export function injectPreferences() {
    let sidebarContainer = document.querySelector('.two_column.left');
    let mainContainer = document.querySelector('.two_column.right');

    let steamdbOptions = document.createElement('div');
    steamdbOptions.setAttribute('id', 'steamdb-options');
    steamdbOptions.classList.add('nav_item');
    steamdbOptions.innerHTML = `<img class="ico16" src="${CDN}/icons/white.svg"> <span>SteamDB Options</span>`;

    sidebarContainer.appendChild(steamdbOptions);

    steamdbOptions.addEventListener('click', async () => {
        sidebarContainer.querySelectorAll('.active').forEach((element) => {
            element.classList.remove('active');
        });
        steamdbOptions.classList.toggle('active');

        let url = new URL(window.location.href);
        url.searchParams.set('steamdb', 'true');
        window.history.replaceState({}, '', url.href);

        let optionsHtml = await (await fetch(`${CDN}/options/options.html`)).text();
        loadStyle();
        loadScript();
        
        mainContainer.innerHTML = optionsHtml;

        // Create reset button
        let resetButton = document.createElement('div');
        resetButton.title = 'Will reset all options to their default values. No Warning!';
        resetButton.classList.add('queue_control_button');
        resetButton.style.marginTop = '1rem';
        resetButton.innerHTML = `<div class="btnv6_blue_hoverfade btn_medium queue_btn_inactive">
                                    <span>Reset options!</span>
                                </div>`;
        resetButton.addEventListener('click', async () => {
            if (resetButton.style.backgroundColor === 'red') {
                localStorage.removeItem(STORAGE_KEY); window.location.reload();
            } else {
                resetButton.style.backgroundColor = 'red';
                resetButton.style.color = 'white';
                resetButton.innerHTML = `<div class="btnv6_blue_hoverfade btn_medium queue_btn_inactive" style="background-color: red !important; color: white !important;">
										    <span>Are you sure?</span>
									    </div>`
            }
        });

        mainContainer.appendChild(resetButton);
    });

    let url = new URL(window.location.href);
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