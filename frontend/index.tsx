import { findModuleByExport } from '@steambrew/client';
import { render } from 'react-dom';
import { FC } from 'react';

declare const SteamUIStore: any;

const AchievementComponent = findModuleByExport((e) => e?.toString?.().includes('bleedGlyphs')).JZ as FC<any>;

// @ts-ignore
window.myTest = () => {
    const mainWindow: Window = SteamUIStore.WindowStore.SteamUIWindows[0].m_BrowserWindow;
    const achievementsElement = mainWindow.document.querySelector('._2JobstxtZVYF3078DblN2M');
    const fiberKey = Object.keys(achievementsElement).find(key => key.includes('__reactFiber$'));
    // @ts-ignore
    const reactFiber: any = achievementsElement[fiberKey];
    const previousProps: any = reactFiber.child.memoizedProps;
    previousProps.tabs = previousProps.tabs.concat([
        {
            id: 'tab1',
            'title': 'Tab 1',
            content: <span>This is tab 1 content</span>,
        },
        {
            id: 'tab2',
            'title': 'Tab 2',
            content: <span>This is tab 2 content</span>,
        },
    ])
    const originalOnShowTab: Function = previousProps.onShowTab;
    previousProps.onShowTab = (tabId: string) => {
        console.log(tabId);
        originalOnShowTab(tabId);
    }
    // previousProps.activeTab = 'tab1';
    render(<AchievementComponent {...previousProps}/>, achievementsElement);
};

// Entry point on the front end of your plugin
export default async function PluginMain() {

}
