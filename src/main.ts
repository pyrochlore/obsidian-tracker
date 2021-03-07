import { App, Modal, Notice, Plugin } from 'obsidian';
import { MarkdownPostProcessor, MarkdownPostProcessorContext, MarkdownPreviewRenderer } from 'obsidian';
import { FileSystemAdapter, TFile, TFolder, normalizePath} from 'obsidian';

import { TrackerSettings, DEFAULT_SETTINGS, TrackerSettingTab } from './settings';

import * as Yaml from 'yaml';
import * as d3 from 'd3';
import * as fs from 'fs';
import * as path from 'path';

class DataPoint {
	date: Date;
	value: number | null;
}

class GraphInfo {
	title: string;
	tagName: string;
	data: DataPoint[];
	output: string;
	accum: boolean;

	constructor (tagName: string) {
		this.title = "";
		this.tagName = tagName;
		this.data = [];
		this.output = "line";
		this.accum = false;
	}
}

export default class Tracker extends Plugin {
	settings: TrackerSettings;

	static app: App;
	static plugin: Tracker;
	static rootPath: string;

	async onload() {
		console.log('loading plugin');
		
		Tracker.app = this.app;

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

	static plotLine(el: HTMLElement, graphInfo: GraphInfo) {
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

	static plotBar(el: HTMLElement, graphInfo: GraphInfo) {
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

		let xDomain = graphInfo.data.map( function(p) { return d3.timeFormat("%m/%d")(p.date); });
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
			.attr("x", function(p) { return xScale(d3.timeFormat("%m/%d")(p.date)); })
			.attr("y", function(p) { return yScale(p.value); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(p) { return height - yScale(p.value); })
			.attr("fill", "#69b3a2");
	}

	static plot(el: HTMLElement, graphInfo: GraphInfo) {
		console.log(graphInfo.data);

		if (graphInfo.output == "line") {
			Tracker.plotLine(el, graphInfo);
		}
		else if (graphInfo.output == "bar") {
			Tracker.plotBar(el, graphInfo);
		}
	}

	static getFilesInFolder(folder: TFolder): TFile[] {
		let files: TFile[] = [];

        for (let item of folder.children) {
            if (item instanceof TFile) {
                files.push(item);
            }
            else {
                if (item instanceof TFolder) {
                    files = files.concat(Tracker.getFilesInFolder(item));
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

		const yamlBlock = blockToReplace.querySelector('code.language-tracker')
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
		if (yaml.output) {
			graphInfo.output = yaml.output;
		}
		if (yaml.accum) {
			graphInfo.accum = yaml.accum;
		}

		// Get files
		let files: TFile[] = [];
		if (yaml.folder) {
			if (yaml.folder === "") {
				// console.log("No user assigned folder");
				files = files.concat(Tracker.app.vault.getMarkdownFiles());
			}
			else {
				let folder = Tracker.app.vault.getAbstractFileByPath(normalizePath(yaml.folder));
				if (!folder) {
					throw new Error(folder + " folder doesn't exist");
				}
				if (!(folder instanceof TFolder)) {
					throw new Error(folder + " is a file, not a folder");
				}
				files = files.concat(Tracker.getFilesInFolder(folder));
			}
		}
		else {
			// console.log("No user assigned folder")
			files = files.concat(Tracker.app.vault.getMarkdownFiles());
		}
		// console.log(files);

		// Get stats from files
		let minDate = new Date();
		let maxDate = new Date();
		let fileCounter = 0;
		let data: DataPoint[] = [];
		for (let file of files) {
			let fileBaseName = file.basename;
			// console.log(fileBaseName);
			let fileDateString = fileBaseName;
			let fileDate = d3.timeParse("%Y-%m-%d")(fileDateString);
			// console.log(fileDate);
			if (!fileDate) continue;
			fileCounter++;

			// Get min/max date
			if (fileCounter == 1) {
				minDate = new Date(fileDate);
				maxDate = new Date(fileDate);
			}
			else {
				if (fileDate < minDate) {
					minDate = new Date(fileDate);
				}
				if (fileDate > maxDate) {
					maxDate = new Date(fileDate);
				}
			}

			let filePath = path.join(Tracker.rootPath, file.path);
			// console.log(filePath);
			
			let content = fs.readFileSync(filePath, { encoding: "utf-8" });
			// console.log(content);
			let strHashtagRegex = "(^|\\s)#" + yaml.tagName + "(:(?<number>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?(\\s|$)";
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
			newPoint.date = fileDate;
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

		// Preprocess data
		let tagMeasureAccum = 0.0;
		for (let curDate = minDate; curDate <= maxDate; curDate.setDate(curDate.getDate() + 1)) {
			// console.log(curDate);
			let dataPoint = data.find(
				function(p) {
					return (d3.timeFormat("%Y-%m-%d")(p.date) == d3.timeFormat("%Y-%m-%d")(curDate));
			});
			// console.log(dataPoint);
			
			if (dataPoint) {
				// console.log("Add point");

				if (graphInfo.accum) {
					tagMeasureAccum = dataPoint.value + tagMeasureAccum;
					dataPoint.value = tagMeasureAccum;
				}

				graphInfo.data.push(dataPoint);
			}
			else {
				// console.log("Add missing point");
				
				let newPoint = new DataPoint();
				newPoint.date = new Date(curDate);
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

		Tracker.plot(destination, graphInfo);

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