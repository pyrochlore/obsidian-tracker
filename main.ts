import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer } from 'obsidian';

import * as Yaml from 'yaml';

interface TagsStatSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TagsStatSettings = {
	mySetting: 'default'
}

export default class TagsStat extends Plugin {
	settings: TagsStatSettings;

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addRibbonIcon('dice', 'Sample Plugin', () => {
			new Notice('This is a notice!');
		});

		this.addStatusBarItem().setText('Status Bar Text');

		this.addCommand({
			id: 'open-sample-modal',
			name: 'Open Sample Modal',
			// callback: () => {
			// 	console.log('Simple Callback');
			// },
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new TagsStatModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new TagsStatSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	
		MarkdownPreviewRenderer.registerPostProcessor(TagsStat.postprocessor)
	}

	onunload() {
		console.log('unloading plugin');

		MarkdownPreviewRenderer.unregisterPostProcessor(TagsStat.postprocessor)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		
		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return;

		const yamlBlock = blockToReplace.querySelector('code.language-tags-stat')
		if (!yamlBlock) return;

		const yaml = Yaml.parse(yamlBlock.textContent);
		if (!yaml || !yaml.tagName || !yaml.chartType) return;
		console.log(yaml);
	
		const destination = document.createElement('div');
		destination.innerText = yaml.tagName;

		el.replaceChild(destination, blockToReplace)
	}
}

class TagsStatModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class TagsStatSettingTab extends PluginSettingTab {
	plugin: TagsStat;

	constructor(app: App, plugin: TagsStat) {
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
