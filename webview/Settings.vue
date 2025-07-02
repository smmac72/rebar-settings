<template>
    <div class="settings-overlay" @click.self="close">
        <div class="settings-window">
            <!-- header -->
            <div class="settings-header">
                <h2>Settings</h2>
                <button @click="close" class="close-button">✕</button>
            </div>
            
            <!-- category navigation -->
            <div class="settings-body">
                <nav class="settings-nav">
                    <button 
                        v-for="category in categories" 
                        :key="category.id"
                        @click="activeCategory = category.id"
                        :class="{ active: activeCategory === category.id }"
                        class="nav-button"
                    >
                        <i :class="category.icon"></i>
                        {{ category.name }}
                    </button>
                </nav>
                
                <!-- category settings - depends on the active category -  -->
                <div v-if="settings.chat" class="settings-content">
                    <!-- preview - chat settings -->
                    <div v-if="activeCategory === 'chat'" class="settings-section">
                        <h3>Chat Module Settings</h3>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                Font Family
                            </label>
                            <select 
                                v-model="settings.chat.fontFamily"
                                @change="updateSetting('chat', 'fontFamily', settings.chat.fontFamily)"
                                class="select-input"
                            >
                                <option value="Tahoma">Tahoma</option>
                                <option value="Arial">Arial</option>
                                <option value="Verdana">Verdana</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                                <option value="Trebuchet MS">Trebuchet MS</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label class="setting-label">
                                Font Size
                                <span class="value">{{ settings.chat.fontSize }}px</span>
                            </label>
                            <input 
                                type="range" 
                                min="12" 
                                max="24" 
                                v-model.number="settings.chat.fontSize"
                                @input="updateSetting('chat', 'fontSize', settings.chat.fontSize)"
                                class="slider"
                            />
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    v-model="settings.chat.showTimestamp"
                                    @change="updateSetting('chat', 'showTimestamp', settings.chat.showTimestamp)"
                                />
                                <span>Show Timestamp</span>
                            </label>
                        </div>
                    </div>

                    <!-- insert other categories here -->
                </div>
            </div>
            
            <!-- footer with resulting buttons -->
            <div class="settings-footer">
                <button @click="resetCategory" class="btn-secondary">
                    Reset to default
                </button>
                <button @click="close" class="btn-primary">
                    Close
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useEvents } from '../../../../webview/composables/useEvents';
import { defaultChatSettings, chatSettings, ChatSettings } from '@Plugins/chat/client/settings.js'

const events = useEvents();

interface SettingsCategory {
    id: string;
    name: string;
    icon: string;
}

interface Settings {
    chat: ChatSettings;
    [key: string]: any;
}

const categories: SettingsCategory[] = [
    { id: 'chat', name: 'Чат', icon: 'fa-comment' }
];

const activeCategory = ref('chat');
const settings = ref<Settings>({
    chat: null
});

const defaults = ref<Settings>({
    chat: null
});

function updateSetting(module: string, key: string, value: any) {
    events.emitClient('webview:settings:set', module, key, value);
}

function close() {
    events.emitClient('webview:settings:close');
}

function resetCategory() {
    const currentCategory = activeCategory.value;
    const defaultSetting = defaults.value[currentCategory];
    if (defaultSetting) {
        Object.entries(defaultSetting).forEach(([key, value]) => {
            updateSetting(currentCategory, key, value);
        });
        settings.value[currentCategory] = { ...defaultSetting };
    }
    else {
        console.warn("[Settings.vue] resetCategory - no defaults for", currentCategory);
    }
}

function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        close();
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown);

    events.on('webview:settings:defaults', (data) => {
        defaults.value.chat = data;
    });
    events.on('webview:settings:init', (data) => {
        settings.value.chat = data;
    });

    events.on('webview:settings:data', (data: { module: string, settings: any }) => {
        if (settings.value[data.module]) {
            settings.value[data.module] = { ...settings.value[data.module], ...data.settings };
        }
    });
    
    Object.keys(settings.value).forEach(module => {
        events.emitClient('webview:settings:request', module);
    });
});

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.settings-window {
    background: #1a1a1a;
    border-radius: 12px;
    width: 800px;
    max-height: 600px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.settings-header {
    padding: 20px;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.settings-header h2 {
    margin: 0;
    color: white;
    font-size: 24px;
}

.close-button {
    background: none;
    border: none;
    color: #999;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
}

.close-button:hover {
    color: white;
}

.settings-body {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.settings-nav {
    width: 200px;
    background: #0f0f0f;
    padding: 10px;
}

.nav-button {
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    color: #999;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.nav-button:hover {
    background: #222;
    color: white;
}

.nav-button.active {
    background: #333;
    color: white;
}

.settings-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}

.settings-section h3 {
    margin: 0 0 20px 0;
    color: white;
}

.setting-group {
    margin-bottom: 20px;
}

.setting-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #ccc;
}

.value {
    color: #666;
}

.slider {
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #333;
    outline: none;
    cursor: pointer;
}

.checkbox-label {
    display: flex;
    align-items: center;
    color: #ccc;
    cursor: pointer;
}

.checkbox-label input {
    margin-right: 10px;
}

.settings-footer {
    padding: 20px;
    border-top: 1px solid #333;
    display: flex;
    justify-content: space-between;
}

.btn-primary, .btn-secondary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
}

.btn-secondary {
    background: #333;
    color: #ccc;
}

.btn-secondary:hover {
    background: #444;
}

.select-input {
    width: 100%;
    padding: 8px 12px;
    background: #2a2a2a;
    border: 1px solid #444;
    border-radius: 6px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}

.select-input:hover {
    border-color: #666;
}

.select-input:focus {
    border-color: #007bff;
}

.select-input option {
    background: #1a1a1a;
    color: white;
}
</style>