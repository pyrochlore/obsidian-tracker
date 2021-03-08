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
	target: string;// minimum requirement for input arguments
	title: string;
	data: DataPoint[];
	output: string;
	accum: boolean;

	constructor (target: string) {
		this.target = target;
		this.title = "";
		this.data = [];
		this.output = "line";
		this.accum = false;
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

	static renderLine(el: HTMLElement, graphInfo: GraphInfo) {
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
		let yMax = d3.max(graphInfo.data, function(p) { return p.value; });
		let yScale = d3.scaleLinear()
			.domain([0, yMax])
			.range([ height, 0 ]);
		let yAxis = d3.axisLeft(yScale);
		let yAxisGroup = svg.append("g").call(yAxis);
		
		// Add lines
		let line = d3.line()
			.defined(function(p) { return p.value; })
			.x(function(p) { return xScale(p.date); })
			.y(function(p) { return yScale(p.value); });

		svg.append("g")
			.append("path")
			.datum(graphInfo.data)
			.attr("fill", "none")
			.attr("stroke", "white")
			.attr("stroke-width", 1.5)
			.attr("d", line);

		// Add dots
		svg.append("g")
			.selectAll("dot")
			.data(graphInfo.data.filter(function(p) { return p.value != null; }))
			.enter().append("circle")
			.attr("r", 3.5)
			.attr("cx", function(p) { return xScale(p.date); })
			.attr("cy", function(p) { return yScale(p.value); })
			.attr("stroke", "#69b3a2")
			.attr("stroke-width", 3)
			.attr("fill", "#69b3a2");
	}

	static renderBar(el: HTMLElement, graphInfo: GraphInfo) {
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
		let yMax = d3.max(graphInfo.data, function(p) { return p.value; });
		let yScale = d3.scaleLinear()
			.domain([0, yMax])
			.range([ height, 0 ]);
		let yAxis = d3.axisLeft(yScale);
		let yAxisGroup = svg.append("g").call(yAxis);

		// Add bar
		svg.append("g")
			.selectAll("bar")
			.data(graphInfo.data)
			.enter()
			.append("rect")
			.attr("x", function(p) { return xScale(p.date.format(Tracker.dateFormat)); })
			.attr("y", function(p) { return yScale(p.value); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(p) { return height - yScale(p.value); })
			.attr("fill", "#69b3a2");
	}

	static render(el: HTMLElement, graphInfo: GraphInfo) {
		// console.log(graphInfo.data);

		if (graphInfo.output == "line") {
			Tracker.renderLine(el, graphInfo);
		}
		else if (graphInfo.output == "bar") {
			Tracker.renderBar(el, graphInfo);
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
		let targetFolder = "/";// root
		if (!yaml.folder) {
			if (this.settings.targetFolder === "") {
				targetFolder = "/";
			}
			else {
				targetFolder = this.settings.targetFolder;
				// TODO: check the folder exists
			}
		}
		else {
			if (yaml.folder === "") {
				targetFolder = "/";
			}
			else {
				targetFolder = yaml.folder;
			}
		}

		let folder = this.app.vault.getAbstractFileByPath(normalizePath(targetFolder));
		if (!folder) {
			throw new Error(folder + " folder doesn't exist");
		}
		if (!(folder instanceof TFolder)) {
			throw new Error(folder + " is a file, not a folder");
		}
		files = files.concat(this.getFilesInFolder(folder));

		return files;
	}

	static postprocessor: MarkdownPostProcessor = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {

		const blockToReplace = el.querySelector('pre')
		if (!blockToReplace) return;

		const yamlBlock = blockToReplace.querySelector('code.language-tracker')
		if (!yamlBlock) return;

		const yaml = Yaml.parse(yamlBlock.textContent);
		if (!yaml || !yaml.target) return;// Minimum requirements
		// console.log(yaml);

		// Prepare graph info
		let graphInfo = new GraphInfo(yaml.target);
		if (yaml.title) {
			graphInfo.title = yaml.title;
		}
		if (yaml.output) {
			graphInfo.output = yaml.output;
		}
		if (yaml.accum) {
			graphInfo.accum = yaml.accum;
		}

		// Get files
		let files = Tracker.plugin.getFiles(yaml);
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

			let filePath = path.join(Tracker.rootPath, file.path);
			// console.log(filePath);
			
			let content = fs.readFileSync(filePath, { encoding: "utf-8" });
			// console.log(content);
			let strHashtagRegex = "(^|\\s)#" + yaml.target + "(:(?<number>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?(\\s|$)";
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
		// console.log(minDate);
		// console.log(maxDate);
		// console.log(data);

		// Check date range
		if (!minDate.isValid() || !maxDate.isValid()) {
			// Not a valid date range
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
				// Not a valid date range
				return;
			}
		}
		else if (endDate.isValid()) {
			if (endDate > minDate) {
				startDate = minDate.clone();
			}
			else {
				// Not a valid date range
				return;
			}			
		}
		else {
			// startDate and endDate are valid
			if ((startDate < minDate && endDate < minDate) || (startDate > maxDate && endDate > maxDate)) {
				// Not a valid date range
				return;
			}
		}

		// Preprocess data
		let tagMeasureAccum = 0.0;
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
				
				// Accumulte data value
				if (graphInfo.accum) {
					tagMeasureAccum = dataPoint.value + tagMeasureAccum;
					dataPoint.value = tagMeasureAccum;
				}

				graphInfo.data.push(dataPoint);
			}
			else {
				// Add missing point of this day
				
				let newPoint = new DataPoint();
				newPoint.date = curDate.clone();
				if (graphInfo.accum) {
					tagMeasureAccum = newPoint.value + tagMeasureAccum;
					newPoint.value = tagMeasureAccum;
				}
				else {
					newPoint.value = null;
				}

				graphInfo.data.push(newPoint);
			}
		}

		// console.log(graphInfo);	

		const destination = document.createElement('div');

		Tracker.render(destination, graphInfo);

		el.replaceChild(destination, blockToReplace)
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