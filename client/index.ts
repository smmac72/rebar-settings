import * as alt from 'alt-client';
import { useRebarClient } from '@Client/index.js'
import { settingsAPI } from './settings-manager.js';
import './keybinds.js'

// webview requests an update, pass onto client
alt.on('client:settings:set', (module: string, key: string, value: any) => {
    settingsAPI.set(module, key, value);
})

// webview requests settings, pass onto client
alt.on('webview:settings:request', (module: string) => {
    const settings = settingsAPI.getAll(module);
    useRebarClient().webview.useWebview().emit('webview:settings:data', { module, settings });
})