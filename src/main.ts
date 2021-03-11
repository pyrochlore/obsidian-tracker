import { App, Modal, Notice, Plugin } from 'obsidian';
import { MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer } from 'obsidian';
import { FileSystemAdapter, TFile, TFolder, normalizePath} from 'obsidian';

import { TrackerSettings, DEFAULT_SETTINGS, TrackerSettingTab } from './settings';

import * as Yaml from 'yaml';
import * as d3 from 'd3';
import * as fs from 'fs';
import * as path from 'path';
import moment from 'moment';

class DataPoint {
	date: moment.Moment;
	value: number | null;
}

class GraphInfo {
	searchType: string;// a must
	searchTarget: string;// a must
	title: string;
	data: DataPoint[];
	output: string;
	accum: boolean;
	showDataPoint: boolean;
	penalty: number;
	backgroundColor: string;
	showTooltipData: boolean;

	constructor (searchType: string, searchTarget: string) {
		this.searchType = searchType;
		this.searchTarget = searchTarget;
		this.title = "";
		this.data = [];
		this.output = "line";
		this.accum = false;
		this.showDataPoint = true;
		this.penalty = 0.0;
		this.backgroundColor = "SteelGray";
		this.showTooltipData = true;
	}
}

export default class Tracker extends Plugin {
	public settings: TrackerSettings;

	public static app: App;
	public static plugin: Tracker;
	public static rootPath: string;
	public static dateFormat: string;

	async onload() {
		console.log('loading plugin');
		
		Tracker.app = this.app;
		Tracker.plugin = this;

		if (this.app.vault.adapter instanceof FileSystemAdapter) {
			Tracker.rootPath = this.app.vault.adapter.getBasePath();
			// console.log(Tracker.rootPath);
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
						new TrackerModal(this.app).open();
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new TrackerSettingTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log('codemirror', cm);
		});

		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	
		MarkdownPreviewRenderer.registerPostProcessor(Tracker.postprocessor)
	}

	onunload() {
		console.log('unloading plugin');

		MarkdownPreviewRenderer.unregisterPostProcessor(Tracker.postprocessor)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	static renderLine(canvas: HTMLElement, graphInfo: GraphInfo) {
		let margin = {top: 10, right: 30, bottom: 60, left: 60};
    	let width = 460 - margin.left - margin.right;
    	let height = 400 - margin.top - margin.bottom;

		let svg = d3.select(canvas)
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.style("background-color", graphInfo.backgroundColor)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		// Add caption
		svg.append("text")
			.text(graphInfo.title)
			.attr("transform", "translate(" + width/2 + "," + height/10 + ")")
			.style("text-anchor", "middle")
			.style("stroke", "white");

		// Add X axis
		let xDomain = d3.extent(graphInfo.data, function(p) { return p.date; });
		let xScale = d3.scaleTime()
			.domain(xDomain)
			.range([ 0, width ]);

		let xAxis = d3.axisBottom(xScale).ticks(graphInfo.data.length).tickFormat(d3.timeFormat("%m/%d"));
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
		let yMin = d3.min(graphInfo.data, function(p) { return p.value; });
		let yMax = d3.max(graphInfo.data, function(p) { return p.value; });
		let yExtent = yMax - yMin;

		let yScale = d3.scaleLinear();
		if (yExtent > 0) {
			yScale.domain([yMin - yExtent * 0.2, yMax + yExtent * 0.2]).range([ height, 0 ]);
		}
		else {
			yScale.domain([0, yMax * 1.2]).range([ height, 0 ]);
		}
		let yAxis = d3.axisLeft(yScale);
		let yAxisGroup = svg.append("g").call(yAxis);
		
		// Add lines
		let line = d3.line<DataPoint>()
			.defined(function(p) { return p.value !== null; })
			.x(function(p) { return xScale(p.date); })
			.y(function(p) { return yScale(p.value); });

		svg.append("g")
			.append("path")
			.datum(graphInfo.data)
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-width", 1.5)
			.attr("d", line as any);

		// Add dots
		if (graphInfo.showDataPoint) {
			let dots = svg.append("g")
				.selectAll("dot")
				.data(graphInfo.data.filter(function(p) { return p.value != null; }))
				.enter().append("circle")
				.attr("r", 3.5)
				.attr("cx", function(p) { return xScale(p.date); })
				.attr("cy", function(p) { return yScale(p.value); })
				.attr("stroke", "#69b3a2")
				.attr("stroke-width", 3)
				.attr("fill", "#69b3a2");

			if (graphInfo.showTooltipData) {
				let tooltips = dots.append('title')
				.text(function(p) {
				  return ("date: " + p.date.format(Tracker.dateFormat) + "\nvalue: " + p.value.toString()); 
				});
			}
		}
	}

	static renderBar(canvas: HTMLElement, graphInfo: GraphInfo) {
		let margin = {top: 10, right: 30, bottom: 60, left: 60};
    	let width = 460 - margin.left - margin.right;
    	let height = 400 - margin.top - margin.bottom;

		let svg = d3.select(canvas)
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.style("background-color", graphInfo.backgroundColor)
				.append("g")
				.attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");

		// Add caption
		svg.append("text")
			.text(graphInfo.title)
			.attr("transform", "translate(" + width/2 + "," + height/10 + ")")
			.style("text-anchor", "middle")
			.style("stroke", "white");

		let xDomain = graphInfo.data.map( function(p) { return (p.date.format(Tracker.dateFormat)); });
		let xScale = d3.scaleBand()
			.domain(xDomain)
			.range([ 0, width ]).padding(0.4);

		//let xAxis = d3.axisBottom(xScale).ticks(graphInfo.data.length).tickFormat(d3.timeFormat("%m/%d"));
		let xAxis = d3.axisBottom(xScale).ticks(graphInfo.data.length);
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
		let yMin = d3.min(graphInfo.data, function(p) { return p.value; });
		let yMax = d3.max(graphInfo.data, function(p) { return p.value; });
		let yExtent = yMax - yMin;
		
		let yScale = d3.scaleLinear();
		yScale.domain([0, yMax * 1.2]).range([ height, 0 ]);
			
		let yAxis = d3.axisLeft(yScale);
		let yAxisGroup = svg.append("g").call(yAxis);

		// Add bar
		let bars = svg.append("g")
			.selectAll("bar")
			.data(graphInfo.data)
			.enter()
			.append("rect")
			.attr("x", function(p) { return xScale(p.date.format(Tracker.dateFormat)); })
			.attr("y", function(p) { return yScale(p.value); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(p) { return height - yScale(p.value); })
			.attr("fill", "#69b3a2");
		
		if (graphInfo.showTooltipData) {
			let tooltips = bars.append('title')
			.text(function(p) {
				 return ("date: " + p.date.format(Tracker.dateFormat) + "\nvalue: " + p.value.toString()); 
			});
		}
	}

	static renderErrorMessage(canvas: HTMLElement, errorMessage: string) {
		let margin = {top: 10, right: 30, bottom: 60, left: 60};
    	let width = 460 - margin.left - margin.right;
    	let height = 400 - margin.top - margin.bottom;

		let svg = d3.select(canvas)
			.append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

		svg.append("text")
			.text(errorMessage)
			.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
			.style("text-anchor", "middle")
			.style("stroke", "red");	

		console.log(errorMessage);
	}

	static render(canvas: HTMLElement, graphInfo: GraphInfo) {
		// console.log(graphInfo.data);

		// Preprocess of data
		
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

		if (graphInfo.output == "line") {
			Tracker.renderLine(canvas, graphInfo);
		}
		else if (graphInfo.output == "bar") {
			Tracker.renderBar(canvas, graphInfo);
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

	public getFiles(yaml: any, includeSubFolders: boolean = true) {
		let files: TFile[] = [];

		// Get folder
		let folderToSearch = "/";// root
		if (!yaml.folder) {
			if (this.settings.folderToSearch === "") {
				folderToSearch = "/";
			}
			else {
				folderToSearch = this.settings.folderToSearch;
			}
		}
		else {
			if (yaml.folder === "") {
				folderToSearch = "/";
			}
			else {
				folderToSearch = yaml.folder;
			}
		}

		let folder = this.app.vault.getAbstractFileByPath(normalizePath(folderToSearch));
		if (!folder || !(folder instanceof TFolder)) {
			throw new Error("Folder '" + folderToSearch + "' doesn't exist");
		}

		files = files.concat(this.getFilesInFolder(folder));

		return files;
	}

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {

		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return;

		const yamlBlock = blockToReplace.querySelector('code.language-tracker')
		if (!yamlBlock) return;// It is not a block we want to deal with.

		const canvas = document.createElement('div');

		const yaml = Yaml.parse(yamlBlock.textContent);
		// console.log(yaml);
		if (!yaml) {
			let errorMessage = "Error Parsing YAML";
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}

		// Search type
		if ((typeof yaml.searchType === 'undefined') || (yaml.searchType !== "tag" && yaml.searchType !== "text")) {
			let errorMessage = "Invalid search type (searchType)";
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}
		let searchType = yaml.searchType;

		// Search target
		let searchTarget = "";
		if ((typeof yaml.searchTarget !== "string") || yaml.searchTarget === "") {
			let errorMessage = "Invalid search target (searchTarget)";
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}
		if (searchType === "tag" && yaml.searchTarget.startsWith("#") && yaml.searchTarget.length > 2) {
			searchTarget = yaml.searchTarget.substring(1);
		}
		else {
			searchTarget = yaml.searchTarget;
		}
		// console.log(searchTarget);

		// Prepare graph info
		let graphInfo = new GraphInfo(searchType, searchTarget);

		// output
		let output = "line";
		if (typeof yaml.output !== 'undefined') {
			output = yaml.output;
		}
		if (output !== "line" && output !== "bar") {
			let errorMessage = "Unknown output type! Allow 'line' or 'bar' only";
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}
		else {
			graphInfo.output = output;
		}
		// accum
		if (typeof yaml.accum !== 'undefined') {
			graphInfo.accum = yaml.accum;
		}
		// title
		if (typeof yaml.title !== 'undefined') {
			graphInfo.title = yaml.title;
		}
		// show data point
		let showDataPoint = true;
		if (typeof yaml.showDataPoint !== 'undefined') {
			showDataPoint = yaml.showDataPoint;
		}
		graphInfo.showDataPoint = showDataPoint;
		// penalty
		if (typeof yaml.penalty === "number") {
			graphInfo.penalty = yaml.penalty;
		}
		// background color
		let backgroundColor = "SteelGray";
		if (typeof yaml.backgroundColor === "string") {
			backgroundColor = yaml.backgroundColor;
		}
		graphInfo.backgroundColor = backgroundColor;
		// show tooltip data
		let showTooltipData = true;
		if (typeof yaml.showTooltipData === "boolean") {
			showTooltipData = yaml.showTooltipData;
		}
		graphInfo.showTooltipData = showTooltipData;

		// Get files
		let files: TFile[];
		try {
			files = Tracker.plugin.getFiles(yaml);
		}
		catch(e) {
			let errorMessage = e.message;
			Tracker.renderErrorMessage(canvas, errorMessage);
			el.replaceChild(canvas, blockToReplace);
			return;
		}

		// console.log(files);

		// Get dates
		Tracker.dateFormat = Tracker.plugin.settings.dateFormat;
		if (Tracker.dateFormat === "") {
			Tracker.dateFormat = "YYYY-MM-DD";
		}
		let startDate = moment("");// use invalid initial value
		if (yaml.startDate) {
			startDate = moment(yaml.startDate, Tracker.dateFormat);
		}
		let endDate = moment("");
		if (yaml.endDate) {
			endDate = moment(yaml.endDate, Tracker.dateFormat);
		}
		if (startDate.isValid() && endDate.isValid()) {
			// Make sure endDate > startDate
			if (endDate < startDate) {
				startDate = moment("");
				endDate = moment("");
			}
		}

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
			if (searchType === "tag") {
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
						if (tag === searchTarget) {
							tagMeasure = tagMeasure + 1.0;
							tagExist = true;
						}
						if (tag.startsWith(searchTarget + "/")) {
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
			if (searchType === "tag") {
				// Add inline tags
				let filePath = path.join(Tracker.rootPath, file.path);
				// console.log(filePath);
				
				let content = fs.readFileSync(filePath, { encoding: "utf-8" });
				// console.log(content);
				let strHashtagRegex = "(^|\\s)#" + searchTarget + "(\\/[\\w]+)*" + "(:(?<number>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?(\\s|$)";
				let hashTagRegex = new RegExp(strHashtagRegex, "gm");
				let match;
				let tagMeasure = 0.0;
				let tagExist = false;
				while (match = hashTagRegex.exec(content)) {
					// console.log(match);
					tagExist = true;
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

			if (searchType === "text") {
				let filePath = path.join(Tracker.rootPath, file.path);
				// console.log(filePath);

				let content = fs.readFileSync(filePath, { encoding: "utf-8" });
				// console.log(content);
				let strHashtagRegex = searchTarget.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
				let hashTagRegex = new RegExp(strHashtagRegex, "gm");
				let match;
				let tagMeasure = 0.0;
				let tagExist = false;
				while (match = hashTagRegex.exec(content)) {
					// console.log(match);
					tagExist = true;
					tagMeasure = tagMeasure + 1.0;
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
		if (!startDate.isValid() && !endDate.isValid()) {
			// No date arguments
			startDate = minDate.clone();
			endDate = maxDate.clone();
		}
		else if (startDate.isValid()) {
			if (startDate < maxDate) {
				endDate = maxDate.clone();
			}
			else {
				let errorMessage = "Invalid date range";
				Tracker.renderErrorMessage(canvas, errorMessage);
				el.replaceChild(canvas, blockToReplace);
				return;
			}
		}
		else if (endDate.isValid()) {
			if (endDate > minDate) {
				startDate = minDate.clone();
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
			if ((startDate < minDate && endDate < minDate) || (startDate > maxDate && endDate > maxDate)) {
				let errorMessage = "Invalid date range";
				Tracker.renderErrorMessage(canvas, errorMessage);
				el.replaceChild(canvas, blockToReplace);
				return;
			}
		}

		// Preprocess data
		for (let curDate = startDate.clone(); curDate <= endDate; curDate.add(1, 'days')) {
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