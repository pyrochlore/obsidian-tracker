import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import Tracker from './main';

export interface TrackerSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: TrackerSettings = {
	mySetting: 'default'
}

export class TrackerSettingTab extends PluginSettingTab {
	plugin: Tracker;

	constructor(app: App, plugin: Tracker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
