import { App, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer } from 'obsidian';
import { FileSystemAdapter, TFile, TFolder, normalizePath} from 'obsidian';
import * as Yaml from 'yaml';
import * as d3 from 'd3';
import * as fs from 'fs';
import * as path from 'path';

type DataPoint = {
	date: Date,
	value: number
}

class GraphInfo {
	title: string;
	tagName: string;
	dates: Date[];
	tagMeasures: number[];

	constructor (tagName: string) {
		this.title = "";
		this.tagName = tagName;
		this.dates = [];
		this.tagMeasures = [];
	}
}

interface TagsStatSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: TagsStatSettings = {
	mySetting: 'default'
}

export default class TagsStat extends Plugin {
	settings: TagsStatSettings;

	static app: App;
	static plugin: TagsStat;
	static rootPath: string;

	async onload() {
		console.log('loading plugin');
		
		TagsStat.app = this.app;

		if (this.app.vault.adapter instanceof FileSystemAdapter) {
			TagsStat.rootPath = this.app.vault.adapter.getBasePath();
			// console.log(TagsStat.rootPath);
		}

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

	static plot(el: HTMLElement, graphInfo: GraphInfo) {
		let margin = {top: 10, right: 30, bottom: 60, left: 60};
    	let width = 460 - margin.left - margin.right;
    	let height = 400 - margin.top - margin.bottom;

		let svg = d3.select(el)
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");

			let data: DataPoint[] = [];
			let i;
			for (i = 0; i < graphInfo.dates.length; i++) {
				data.push({date: graphInfo.dates[i], value: graphInfo.tagMeasures[i]});
			} 
			
			// Add caption
			svg.append("text")
				.text(graphInfo.title)
				.attr("transform", "translate(" + width/2 + "," + height/10 + ")")
				.style("text-anchor", "middle")
				.style("stroke", "white");

			// Add X axis
			let xDomain = d3.extent(graphInfo.dates);
			let xScale = d3.scaleTime()
				.domain(xDomain)
				.range([ 0, width ]);
			let xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d"));
			let xAxisGroup = svg.append("g");
			xAxisGroup.attr("transform", "translate(0," + height + ")")
				.call(xAxis)
				.selectAll("text")
				.attr("y", 0)
				.attr("x", 9)
				.attr("dy", ".35em")
				.attr("transform", "rotate(90)")
				.style("text-anchor", "start");
	
			// Add Y axis
			let yMax = d3.max(graphInfo.tagMeasures);
			let yScale = d3.scaleLinear()
				.domain([0, yMax])
				.range([ height, 0 ]);
			let yAxis = d3.axisLeft(yScale);
			let yAxisGroup = svg.append("g").call(yAxis);
			
			// Add line
			let line = d3.line()
				.x(function(p) { return xScale(p.date); })
				.y(function(p) { return yScale(p.value); });

			svg.append("path")
				.datum(data)
				.attr("fill", "none")
				.attr("stroke", "steelblue")
				.attr("stroke-width", 1.5)
				.attr("d", line);
	}

	static getFilesInFolder(folder: TFolder): TFile[] {
		let files: TFile[] = [];

        for (let item of folder.children) {
            if (item instanceof TFile) {
                files.push(item);
            }
            else {
                if (item instanceof TFolder) {
                    files = files.concat(TagsStat.getFilesInFolder(item));
                }
                else {
                    throw new Error("Unknown TAbstractFile type");
                }
            }
        }
        return files;
	}

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {

		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return;

		const yamlBlock = blockToReplace.querySelector('code.language-tags-stat')
		if (!yamlBlock) return;

		const yaml = Yaml.parse(yamlBlock.textContent);
		if (!yaml || !yaml.tagName) return;
		// console.log(yaml);

		// Prepare graph info
		let graphInfo = new GraphInfo(yaml.tagName);
		graphInfo.tagName = yaml.tagName;
		if (yaml.title) {
			graphInfo.title = yaml.title;
		}

		// Get files
		let files: TFile[] = [];
		if (yaml.folder && yaml.folder !== "") {
			if (yaml.folder === "") {
				files = files.concat(TagsStat.app.vault.getMarkdownFiles());
			}
			else {
				let folder = TagsStat.app.vault.getAbstractFileByPath(normalizePath(yaml.folder));
				if (!folder) {
					throw new Error(folder + " folder doesn't exist");
				}
				if (!(folder instanceof TFolder)) {
					throw new Error(folder + " is a file, not a folder");
				}
				files = files.concat(TagsStat.getFilesInFolder(folder));
			}
		}
		// console.log(files);

		// Get stats from files
		for (let file of files) {
			let fileBaseName = file.basename;
			// console.log(fileBaseName);
			let fileDate = d3.timeParse("%Y-%m-%d")(fileBaseName);
			graphInfo.dates.push(fileDate);
			// console.log(fileDate);

			let filePath = path.join(TagsStat.rootPath, file.path);
			// console.log(filePath);
			
			let content = fs.readFileSync(filePath, { encoding: "utf-8" });
			// console.log(content);
			let strHashtagRegex = "(^|\\s)#" + yaml.tagName + "(:(?<number>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?(\\s|$)";
			let hashTagRegex = new RegExp(strHashtagRegex, "gm");
			let match;
			let tagMeasure = 0.0;
			while (match = hashTagRegex.exec(content)) {
				console.log(match);
				if (match[0].includes(":")) {
					// console.log("valued-tag");
					let value = parseFloat(match.groups.number);
					// console.log(value);
					tagMeasure += value;
				}
				else {
					// console.log("simple-tag");
					tagMeasure = tagMeasure + 1.0;
				}
			}
			graphInfo.tagMeasures.push(tagMeasure);
		}	
		// console.log(graphInfo);	

		const destination = document.createElement('div');

		TagsStat.plot(destination, graphInfo);

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
