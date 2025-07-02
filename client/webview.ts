import * as alt from 'alt-client';
import { useWebview } from '@Client/webview/index.js';
import { defaultChatSettings, chatSettings } from '@Plugins/chat/client/settings.js'

class SettingsViewManager {
    private isOpen = false;
    private webview: ReturnType<typeof useWebview> | null = null;

    // do init and defaults for each webview setting
    // webview is isolated in relation to the altv runtime
    initSettings() {
        this.webview.emit("webview:settings:defaults", defaultChatSettings);
        this.webview.emit("webview:settings:init", chatSettings.getSettings());
    }

    // pass webview events onto client
    initWebviewListeners() {
        this.webview.on('webview:settings:close', () => {
            this.close();
        });
        this.webview.on('webview:settings:set', (module: string, key: string, value: any) => {
            alt.emit('client:settings:set', module, key, value);
        });
        this.webview.on('webview:settings:request', (module: string) => {
            alt.emit('client:settings:request', module);
        });
    }
    closeWebviewListeners() {
        this.webview.off('webview:settings:close');
        this.webview.off('webview:settings:set');
        this.webview.off('webview:settings:request');
    }

    // open webview window
    async open() {
        if (this.isOpen) return;
        this.webview = useWebview();

        this.webview.show('Settings', 'overlay'); // overlay to see chat in the example
        alt.showCursor(true);
        alt.toggleGameControls(false);

        this.webview.focus();
        this.isOpen = true;

        this.initWebviewListeners();
        this.initSettings();

        this.sendCurrentSettings();
    }

    close() {
        if (!this.isOpen || !this.webview) return;
        
        this.webview.hide('Settings');
        
        alt.showCursor(false);
        alt.toggleGameControls(true);
        
        this.webview.unfocus();
        
        this.isOpen = false;
        this.closeWebviewListeners()
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    // pass settings to each module in webview settings window
    private sendCurrentSettings() {
        const modules = ['chat'];
        
        modules.forEach(module => {
            alt.emit('webview:settings:request', module);
        });
    }
}

export const settingsView = new SettingsViewManager();