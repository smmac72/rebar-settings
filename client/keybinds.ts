import * as alt from 'alt-client';
import { settingsView } from './webview.js';

// activate setting menu on F7
alt.on('keydown', (key: number) => {
    if (key === 118 && !alt.isConsoleOpen() && !alt.isMenuOpen()) {
        settingsView.toggle();
    }
});