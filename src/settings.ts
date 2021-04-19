import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import Tracker from "./main";

export interface TrackerSettings {}

export const DEFAULT_SETTINGS: TrackerSettings = {};

export class TrackerSettingTab extends PluginSettingTab {
    plugin: Tracker;

    constructor(app: App, plugin: Tracker) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();
        containerEl.createEl("h2", {
            text: "Obsidian Tracker Plugin - Settings",
        });

        containerEl.createEl("div", {
            text:
                "The default folder and date format align the settings in the core plugin 'Daily notes'. If the plugin isn't installed, the default values would be '/' and 'YYYY-MM-DD'. You can still override them by using the keys 'folder' and 'dateFormat' in YAML.",
        });
    }
}
