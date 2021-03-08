import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import Tracker from './main';

export interface TrackerSettings {
	target_folder: string;
    date_format: string;
}

export const DEFAULT_SETTINGS: TrackerSettings = {
	target_folder: "",
    date_format: ""
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

		new Setting(containerEl)
			.setName("Default folder location")
			.setDesc("Files in this folder will be parsed and used as input data of the tracker plugin.\nYou can also override it using 'folder' argument int the tracker codeblock.")
			.addText(text => text
				.setPlaceholder("Folder Path")
				.setValue(this.plugin.settings.target_folder)
				.onChange(async (value) => {
					this.plugin.settings.target_folder = value;
					await this.plugin.saveSettings();
				}));

        new Setting(containerEl)
			.setName("Default date format")
			.setDesc("This format is used to parse the date in your diary title.\nYou can also override it using 'date-format' argument in the tracker codeblock.")
			.addText(text => text
				.setPlaceholder("YYYY-MM-DD")
				.setValue(this.plugin.settings.date_format)
				.onChange(async (value) => {
					this.plugin.settings.date_format = value;
					await this.plugin.saveSettings();
				}));
	}
}
