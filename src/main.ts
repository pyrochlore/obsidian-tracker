import { App, Modal, Notice, Plugin } from 'obsidian';
import { MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer } from 'obsidian';
import { FileSystemAdapter, TFile, TFolder, normalizePath} from 'obsidian';

import { TrackerSettings, DEFAULT_SETTINGS, TrackerSettingTab } from './settings';
import { DataPoint, GraphInfo, renderLine} from './graph';

import * as Yaml from 'yaml';
import * as d3 from 'd3';
import moment from 'moment';

export default class Tracker extends Plugin {
	public settings: TrackerSettings;

	public static app: App;
	public static plugin: Tracker;
	public static rootPath: string;
	public static dateFormat: string;

	async onload() {
		console.log('loading obsidian-tracker plugin');
		
		Tracker.app = this.app;
		Tracker.plugin = this;

		if (this.app.vault.adapter instanceof FileSystemAdapter) {
			Tracker.rootPath = this.app.vault.adapter.getBasePath();
			// console.log(Tracker.rootPath);
		}

		await this.loadSettings();

		this.addSettingTab(new TrackerSettingTab(this.app, this));

		MarkdownPreviewRenderer.registerPostProcessor(Tracker.postprocessor)
	}

	onunload() {
		console.log('unloading obsidian-tracker plugin');

		MarkdownPreviewRenderer.unregisterPostProcessor(Tracker.postprocessor)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	static renderText(canvas: HTMLElement, graphInfo: GraphInfo) {
		let svg = d3.select(canvas)
			.append("div")
			.text("'Output type 'text' is an upcoming feature")
			.style("background-color", "white")
			.style("margin-bottom", "20px")
			.style("padding", "10px")
			.style("color", "red");
	}

	static renderErrorMessage(canvas: HTMLElement, errorMessage: string) {
		let svg = d3.select(canvas)
			.append("div")
			.text(errorMessage)
			.style("background-color", "white")
			.style("margin-bottom", "20px")
			.style("padding", "10px")
			.style("color", "red");
	}

	static render(canvas: HTMLElement, graphInfo: GraphInfo) {
		// console.log(graphInfo.data);

		// Data preprocessing
		let tagMeasureAccum = 0.0;
		for (let dataPoint of graphInfo.data) {
			if (graphInfo.penalty !== 0.0) {
				if (dataPoint.value === null) {
					dataPoint.value = graphInfo.penalty;
				}
			}
			if (graphInfo.accum) {
				if (dataPoint.value !== null) {
					tagMeasureAccum += dataPoint.value;
					dataPoint.value = tagMeasureAccum;
				}
			}
		}

		if (graphInfo.output === "line") {
			renderLine(canvas, graphInfo);
		}
		else if (graphInfo.output == "text") {
			Tracker.renderText(canvas, graphInfo);
		}
	}

	public getFilesInFolder(folder: TFolder, includeSubFolders: boolean = true): TFile[] {
		let files: TFile[] = [];

        for (let item of folder.children) {
            if (item instanceof TFile) {
                files.push(item);
            }
            else {
                if (item instanceof TFolder && includeSubFolders) {
                    files = files.concat(this.getFilesInFolder(item));
                }
            }
        }

        return files;
	}

	public getFiles(folderToSearch: string, includeSubFolders: boolean = true) {
		let files: TFile[] = [];

		let folder = this.app.vault.getAbstractFileByPath(normalizePath(folderToSearch));
		if (!folder || !(folder instanceof TFolder)) {
			// Folder not exists
		}
		else{
			files = files.concat(this.getFilesInFolder(folder));
		}

		return files;
	}

	static getGraphInfoFromYaml(yamlBlock: Element): GraphInfo | string {
		
		let yaml;
		try {
			yaml = Yaml.parse(yamlBlock.textContent);
		}
		catch (err) {
			let errorMessage = "Error parsing YAML";
			console.log(err);
			return errorMessage;
		}
		if (!yaml) {
			let errorMessage = "Error parsing YAML";
			return errorMessage;
		}
		// console.log(yaml);

		// Search type
		let searchType = "";
		if (yaml.searchType === "tag" || yaml.searchType === "text") {
			searchType = yaml.searchType;
		}
		else {
			let errorMessage = "Invalid search type (searchType), choose 'tag' or 'text'";
			return errorMessage;
		}
		// console.log(searchType);

		// Search target
		let searchTarget = "";
		if ((typeof yaml.searchTarget === "string") && yaml.searchTarget !== "") {
			if (yaml.searchTarget === "tag") {
				if (yaml.searchTarget.startsWith("#") && yaml.searchTarget.length > 2) {
					searchTarget = yaml.searchTarget.substring(1);
				}
				else {
					searchTarget = yaml.searchTarget;
				}				
			}
			else { // yaml.searchTarget === "text"
				searchTarget = yaml.searchTarget;
			}
		}
		else {
			let errorMessage = "Invalid search target (searchTarget)";
			return errorMessage;
		}
		// console.log(searchTarget);

		// Create grarph info
		let graphInfo = new GraphInfo(searchType, searchTarget);

		// Root folder to search
		let defaultSearchFolder = Tracker.plugin.settings.folderToSearch;
		if (typeof yaml.folder === "undefined") {
			if (defaultSearchFolder === "") {
				graphInfo.folder = "/";
			}
			else {
				graphInfo.folder = defaultSearchFolder;
			}
		}
		else {
			if (yaml.folder === "") {
				graphInfo.folder = "/";
			}
			else {
				graphInfo.folder = yaml.folder;
			}
		}
		let abstractFolder = this.app.vault.getAbstractFileByPath(normalizePath(graphInfo.folder));
		if (!abstractFolder || !(abstractFolder instanceof TFolder)) {
			let errorMessage = "Folder '" + graphInfo.folder + "' doesn't exist";
			return errorMessage;
		}
		// console.log(graphInfo.folder);

		// startDate, endDate
		Tracker.dateFormat = Tracker.plugin.settings.dateFormat;
		if (Tracker.dateFormat === "") {
			Tracker.dateFormat = "YYYY-MM-DD";
		}		
		if (typeof yaml.startDate === "string") {
			graphInfo.startDate = moment(yaml.startDate, Tracker.dateFormat);
		}
		if (typeof yaml.endDate === "string") {
			graphInfo.endDate = moment(yaml.endDate, Tracker.dateFormat);
		}
		if (graphInfo.startDate.isValid() && graphInfo.endDate.isValid()) {
			// Make sure endDate > startDate
			if (graphInfo.endDate < graphInfo.startDate) {
				let errorMessage = "Invalid date range (startDate and endDate)";
				return errorMessage;
			}
		}
		// console.log(graphInfo.startDate);
		// console.log(graphInfo.endDate);

		// constValue
		if (typeof yaml.constValue === "number") {
			graphInfo.constValue = yaml.constValue;
		}

		// ignoreAttachedValue
		if (typeof yaml.ignoreAttachedValue === "boolean") {
			graphInfo.ignoreAttchedValue = yaml.ignoreAttachedValue;
		}

		// accum
		if (typeof yaml.accum === "boolean") {
			graphInfo.accum = yaml.accum;
		}
		// console.log(graphInfo.accum);

		// penalty
		if (typeof yaml.penalty === "number") {
			graphInfo.penalty = yaml.penalty;
		}
		// console.log(graphInfo.penalty);

		// output, default 'line'
		if (yaml.output === "line" || yaml.output === "text") {
			graphInfo.output = yaml.output;
		}
		// console.log(graphInfo.output);

		// line related parameters
		if (typeof yaml.line !== "undefined") {
			// title
			if (typeof yaml.line.title === "string") {
				graphInfo.line.title = yaml.line.title;
			}
			// xAxisLabel
			if (typeof yaml.line.xAxisLabel === "string") {
				graphInfo.line.xAxisLabel = yaml.line.xAxisLabel;
			}
			// yAxisLabel
			if (typeof yaml.line.yAxisLabel === "string") {
				graphInfo.line.yAxisLabel = yaml.line.yAxisLabel;
			}
			// labelColor
			if (typeof yaml.line.labelColor === "string") {
				graphInfo.line.labelColor = yaml.line.labelColor;
			}
			// yAxisUnit
			if (typeof yaml.line.yAxisUnit === "string") {
				graphInfo.line.yAxisUnit = yaml.line.yAxisUnit;
			}
			// yMin
			if (typeof yaml.line.yMin === "number") {
				graphInfo.line.yMin = yaml.line.yMin;
			}
			// yMax
			if (typeof yaml.line.yMax === "number") {
				graphInfo.line.yMax = yaml.line.yMax;
			}
			// axisColor
			if (typeof yaml.line.axisColor === "string") {
				graphInfo.line.axisColor = yaml.line.axisColor;
			}
			// lineColor
			if (typeof yaml.line.lineColor === "string") {
				graphInfo.line.lineColor = yaml.line.lineColor;
			}
			// lineWidth
			if (typeof yaml.line.lineWidth === "number") {
				graphInfo.line.lineWidth = yaml.line.lineWidth;
			}
			// showLine
			if (typeof yaml.line.showLine === "boolean") {
				graphInfo.line.showLine = yaml.line.showLine;
			}
			// showPoint
			if (typeof yaml.line.showPoint === "boolean") {
				graphInfo.line.showPoint = yaml.line.showPoint;
			}
			// pointColor
			if (typeof yaml.line.pointColor === "string") {
				graphInfo.line.pointColor = yaml.line.pointColor;
			}
			// pointBorderColor
			if (typeof yaml.line.pointBorderColor === "string") {
				graphInfo.line.pointBorderColor = yaml.line.pointBorderColor;
			}
			// pointBorderWidth
			if (typeof yaml.line.pointBorderWidth === "number") {
				graphInfo.line.pointBorderWidth = yaml.line.pointBorderWidth;
			}
			// pointSize
			if (typeof yaml.line.pointSize === "number") {
				graphInfo.line.pointSize = yaml.line.pointSize;
			}
			// allowInspectData
			if (typeof yaml.line.allowInspectData === "boolean") {
				graphInfo.line.allowInspectData = yaml.line.allowInspectData;
			}
			// fillGap
			if (typeof yaml.line.fillGap === "boolean") {
				graphInfo.line.fillGap = yaml.line.fillGap;
			}
			// console.log(graphInfo.line.fillGap)
		}// line related parameters

		return graphInfo;
	}

	static async postprocessor(el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<MarkdownPostProcessor> {

		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return;

		const yamlBlock = blockToReplace.querySelector('code.language-tracker')
		if (!yamlBlock) return;// It is not a block we want to deal with.

		const canvas = document.createElement('div');

		let graphInfo = Tracker.getGraphInfoFromYaml(yamlBlock);
		if (typeof graphInfo === "string") {
			let errorMessage = graphInfo;
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}

		// Get files
		let files: TFile[];
		try {
			files = Tracker.plugin.getFiles(graphInfo.folder);
		}
		catch(e) {
			let errorMessage = e.message;
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}
		// console.log(files);

		// Get data from files
		let minDate = moment("");
		let maxDate = moment("");
		let fileCounter = 0;
		let data: DataPoint[] = [];
		for (let file of files) {
			let fileBaseName = file.basename;
			// console.log(fileBaseName);
			let fileDateString = fileBaseName;
			let fileDate = moment(fileDateString, Tracker.dateFormat);
			// console.log(fileDate);
			if (!fileDate.isValid()) continue;
			fileCounter++;

			// Get min/max date
			if (fileCounter == 1) {
				minDate = fileDate.clone();
				maxDate = fileDate.clone();
			}
			else {
				if (fileDate < minDate) {
					minDate = fileDate.clone();
				}
				if (fileDate > maxDate) {
					maxDate = fileDate.clone();
				}
			}

			// console.log("Search frontmatter tags");
			if (graphInfo.searchType === "tag") {
				// Add frontmatter tags, allow simple tag only
				let fileCache = Tracker.app.metadataCache.getFileCache(file);
				let frontMatter = fileCache.frontmatter;
				let frontMatterTags: string[] = [];
				if (frontMatter && frontMatter.tags) {
					// console.log(frontMatter.tags);
					let tagMeasure = 0.0;
					let tagExist = false;
					if (Array.isArray(frontMatter.tags)) {
						frontMatterTags = frontMatterTags.concat(frontMatter.tags);
					}
					else {
						frontMatterTags.push(frontMatter.tags);
					}

					for (let tag of frontMatterTags) {
						if (tag === graphInfo.searchTarget) {
							tagMeasure = tagMeasure + graphInfo.constValue;
							tagExist = true;
						}
						if (tag.startsWith(graphInfo.searchTarget + "/")) {
							// nested simple tag does not support for now
						}
					}

					let newPoint = new DataPoint();
					newPoint.date = fileDate.clone();
					if (tagExist) {
						newPoint.value = tagMeasure;
					}
					else {
						newPoint.value = null;
					}	
					data.push(newPoint);
					//console.log(newPoint);
				}
			}

			// console.log("Search inline tags");
			if (graphInfo.searchType === "tag") {
				// Add inline tags
				let content = await Tracker.app.vault.adapter.read(file.path);
				
				// console.log(content);
				let strHashtagRegex = "(^|\\s)#" + graphInfo.searchTarget + "(\\/[\\w]+)*" + "(:(?<number>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?(\\s|$)";
				// console.log(strHashtagRegex);
				let hashTagRegex = new RegExp(strHashtagRegex, "gm");
				let match;
				let tagMeasure = 0.0;
				let tagExist = false;
				while (match = hashTagRegex.exec(content)) {
					// console.log(match);
					tagExist = true;
					if (!graphInfo.ignoreAttchedValue && match[0].includes(":")) {
						// console.log("valued-tag");
						let value = parseFloat(match.groups.number);
						// console.log(value);
						tagMeasure += value;
					}
					else {
						// console.log("simple-tag");
						tagMeasure = tagMeasure + graphInfo.constValue;
					}
				}

				let newPoint = new DataPoint();
				newPoint.date = fileDate.clone();
				if (tagExist) {
					newPoint.value = tagMeasure;
				}
				else {
					newPoint.value = null;
				}			
				// console.log(newPoint);
				
				data.push(newPoint);
			}

			if (graphInfo.searchType === "text") {
				let content = await Tracker.app.vault.adapter.read(file.path);
				// console.log(content);
				
				let strHashtagRegex = graphInfo.searchTarget.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
				// console.log(strHashtagRegex);
				let hashTagRegex = new RegExp(strHashtagRegex, "gm");
				let match;
				let tagMeasure = 0.0;
				let tagExist = false;
				while (match = hashTagRegex.exec(content)) {
					// console.log(match);
					tagExist = true;
					tagMeasure = tagMeasure + graphInfo.constValue;
				}

				let newPoint = new DataPoint();
				newPoint.date = fileDate.clone();
				if (tagExist) {
					newPoint.value = tagMeasure;
				}
				else {
					newPoint.value = null;
				}			
				// console.log(newPoint);
				
				data.push(newPoint);
			}
		}// end loof of files
		// console.log(minDate);
		// console.log(maxDate);
		// console.log(data);

		// Check date range
		if (!minDate.isValid() || !maxDate.isValid()) {
			let errorMessage = "Invalid date range";
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}
		if (!graphInfo.startDate.isValid() && !graphInfo.endDate.isValid()) {
			// No date arguments
			graphInfo.startDate = minDate.clone();
			graphInfo.endDate = maxDate.clone();
		}
		else if (graphInfo.startDate.isValid() && !graphInfo.endDate.isValid()) {
			if (graphInfo.startDate < maxDate) {
				graphInfo.endDate = maxDate.clone();
			}
			else {
				let errorMessage = "Invalid date range";
				Tracker.renderErrorMessage(canvas, errorMessage);
				el.replaceChild(canvas, blockToReplace);
				return;
			}
		}
		else if (graphInfo.endDate.isValid() && !graphInfo.startDate.isValid()) {
			if (graphInfo.endDate > minDate) {
				graphInfo.startDate = minDate.clone();
			}
			else {
				let errorMessage = "Invalid date range";
				Tracker.renderErrorMessage(canvas, errorMessage);
				el.replaceChild(canvas, blockToReplace);
				return;
			}			
		}
		else {
			// startDate and endDate are valid
			if ((graphInfo.startDate < minDate && graphInfo.endDate < minDate) || (graphInfo.startDate > maxDate && graphInfo.endDate > maxDate)) {
				let errorMessage = "Invalid date range";
				Tracker.renderErrorMessage(canvas, errorMessage);
				el.replaceChild(canvas, blockToReplace);
				return;
			}
		}
		// console.log(startDate);
		// console.log(endDate);

		// Preprocess data
		for (let curDate = graphInfo.startDate.clone(); curDate <= graphInfo.endDate; curDate.add(1, 'days')) {
			// console.log(curDate);
			let dataPoints = data.filter(p => curDate.isSame(p.date));
			
			if (dataPoints.length > 0) {
				// Add point to graphInfo

				// Merge data points of the same day
				let dataPoint = dataPoints[0];
				for (let indDataPoint = 1; indDataPoint < dataPoints.length; indDataPoint++) {
					if (dataPoints[indDataPoint].value !== null) {
						dataPoint.value += dataPoints[indDataPoint].value;
					}
				}
				
				graphInfo.data.push(dataPoint);
			}
			else {
				// Add missing point of this day
				
				let newPoint = new DataPoint();
				newPoint.date = curDate.clone();
				newPoint.value = null;

				graphInfo.data.push(newPoint);
			}
		}

		// console.log(graphInfo);	

		Tracker.render(canvas, graphInfo);

		el.replaceChild(canvas, blockToReplace);
	}
}

class TrackerModal extends Modal {
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