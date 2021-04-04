import { App, Plugin } from "obsidian";
import {
    MarkdownPostProcessorContext,
    MarkdownView,
    Editor
} from "obsidian";
import { TFile, TFolder, normalizePath } from "obsidian";

import {
    TrackerSettings,
    DEFAULT_SETTINGS,
    TrackerSettingTab,
} from "./settings";
import {
    DataPoint,
    GraphInfo,
    LineInfo,
    renderLine,
    TextInfo,
    renderText,
} from "./graph";

import * as Yaml from "yaml";
import * as d3 from "d3";
import { Moment } from "moment";

declare global {
    interface Window {
        app: App;
        moment: () => Moment;
    }
}

enum OutputType {
    Line,
    Text,
    Table,
    Heatmap,
}

export default class Tracker extends Plugin {
    settings: TrackerSettings;
    dateFormat: string;
    folder: string;

    async onload() {
        console.log("loading obsidian-tracker plugin");

        await this.loadSettings();

        this.addSettingTab(new TrackerSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor(
            "tracker",
            this.postprocessor.bind(this)
        );

        this.addCommand({
            id: "add-line-chart-example",
            name: "Add Line Chart Example",
            callback: () => this.addCodeBlock(OutputType.Line),
        });

        this.addCommand({
            id: "add-text-output-example",
            name: "Add Text Output Example",
            callback: () => this.addCodeBlock(OutputType.Text),
        });
    }

    onunload() {
        console.log("unloading obsidian-tracker plugin");
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    renderErrorMessage(canvas: HTMLElement, errorMessage: string) {
        let svg = d3
            .select(canvas)
            .append("div")
            .text(errorMessage)
            .style("background-color", "white")
            .style("margin-bottom", "20px")
            .style("padding", "10px")
            .style("color", "red");
    }

    render(canvas: HTMLElement, graphInfo: GraphInfo) {
        // console.log(graphInfo.data);

        // Data preprocessing
        let tagMeasureAccum = 0.0;
        for (let dataPoint of graphInfo.data) {
            if (graphInfo.penalty !== null) {
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

        if (graphInfo.output === "") {
            if (graphInfo.text !== null) {
                return renderText(canvas, graphInfo);
            }
            // Default
            return renderLine(canvas, graphInfo);
        } else if (graphInfo.output === "line") {
            return renderLine(canvas, graphInfo);
        } else if (graphInfo.output === "text") {
            return renderText(canvas, graphInfo);
        }

        return "Unknown output type";
    }

    getFilesInFolder(
        folder: TFolder,
        includeSubFolders: boolean = true
    ): TFile[] {
        let files: TFile[] = [];

        for (let item of folder.children) {
            if (item instanceof TFile) {
                files.push(item);
            } else {
                if (item instanceof TFolder && includeSubFolders) {
                    files = files.concat(this.getFilesInFolder(item));
                }
            }
        }

        return files;
    }

    getFiles(folderToSearch: string, includeSubFolders: boolean = true) {
        let files: TFile[] = [];

        let folder = this.app.vault.getAbstractFileByPath(
            normalizePath(folderToSearch)
        );
        if (!folder || !(folder instanceof TFolder)) {
            // Folder not exists
        } else {
            files = files.concat(this.getFilesInFolder(folder));
        }

        return files;
    }

    getGraphInfoFromYaml(yamlText: string): GraphInfo | string {
        let yaml;
        try {
            yaml = Yaml.parse(yamlText);
        } catch (err) {
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
        } else {
            let errorMessage =
                "Invalid search type (searchType), choose 'tag' or 'text'";
            return errorMessage;
        }
        // console.log(searchType);

        // Search target
        let searchTarget = "";
        if (typeof yaml.searchTarget === "string" && yaml.searchTarget !== "") {
            if (yaml.searchTarget === "tag") {
                if (
                    yaml.searchTarget.startsWith("#") &&
                    yaml.searchTarget.length > 2
                ) {
                    searchTarget = yaml.searchTarget.substring(1);
                } else {
                    searchTarget = yaml.searchTarget;
                }
            } else {
                // yaml.searchTarget === "text"
                searchTarget = yaml.searchTarget;
            }
        } else {
            let errorMessage = "Invalid search target (searchTarget)";
            return errorMessage;
        }
        // console.log(searchTarget);

        // Create grarph info
        let graphInfo = new GraphInfo(searchType, searchTarget);

        // Root folder to search
        this.folder = this.settings.folderToSearch;
        if (typeof yaml.folder === "undefined") {
            if (this.folder === "") {
                this.folder = "/";
            }
        } else {
            if (yaml.folder === "") {
                this.folder = "/";
            } else {
                this.folder = yaml.folder;
            }
        }
        let abstractFolder = this.app.vault.getAbstractFileByPath(
            normalizePath(this.folder)
        );
        if (!abstractFolder || !(abstractFolder instanceof TFolder)) {
            let errorMessage = "Folder '" + this.folder + "' doesn't exist";
            return errorMessage;
        }
        graphInfo.folder = this.folder;
        // console.log(graphInfo.folder);

        // startDate, endDate
        this.dateFormat = this.settings.dateFormat;
        if (this.dateFormat === "") {
            this.dateFormat = "YYYY-MM-DD";
        }
        if (typeof yaml.startDate === "string") {
            graphInfo.startDate = window.moment(
                yaml.startDate,
                this.dateFormat
            );
        }
        if (typeof yaml.endDate === "string") {
            graphInfo.endDate = window.moment(yaml.endDate, this.dateFormat);
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

        // line related parameters
        if (typeof yaml.output !== "undefined") {
            graphInfo.output = yaml.output;
        }
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
        } // line related parameters

        // text related parameters
        if (typeof yaml.text !== "undefined") {
            graphInfo.text = new TextInfo();
            // template
            if (typeof yaml.text.template === "string") {
                graphInfo.text.template = yaml.text.template;
            }
            if (typeof yaml.text.style === "string") {
                graphInfo.text.style = yaml.text.style;
            }
        } // text related parameters

        return graphInfo;
    }

    async postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        const canvas = document.createElement("div");

        let yamlText = source.trim();
        let graphInfo = this.getGraphInfoFromYaml(yamlText);
        if (typeof graphInfo === "string") {
            let errorMessage = graphInfo;
            this.renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        // Get files
        let files: TFile[];
        try {
            files = this.getFiles(graphInfo.folder);
        } catch (e) {
            let errorMessage = e.message;
            this.renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }
        // console.log(files);

        // Get data from files
        let minDate = window.moment("");
        let maxDate = window.moment("");
        let fileCounter = 0;
        let data: DataPoint[] = [];
        for (let file of files) {
            let fileBaseName = file.basename;
            // console.log(fileBaseName);
            let fileDateString = fileBaseName;
            let fileDate = window.moment(fileDateString, this.dateFormat);
            // console.log(fileDate);
            if (!fileDate.isValid()) continue;
            fileCounter++;

            // Get min/max date
            if (fileCounter == 1) {
                minDate = fileDate.clone();
                maxDate = fileDate.clone();
            } else {
                if (fileDate < minDate) {
                    minDate = fileDate.clone();
                }
                if (fileDate > maxDate) {
                    maxDate = fileDate.clone();
                }
            }

            // rules for assigning tag value
            // simple tag
            //   tag exists --> constant value
            //   tag not exists --> null
            // valued-attached tag
            //   tag exists
            //     with value --> that value
            //     without value --> null
            //   tag not exists --> null

            // console.log("Search frontmatter tags");
            if (graphInfo.searchType === "tag") {
                // Add frontmatter tags, allow simple tag only
                let fileCache = this.app.metadataCache.getFileCache(file);
                if (fileCache) {
                    let frontMatter = fileCache.frontmatter;
                    let frontMatterTags: string[] = [];
                    if (frontMatter && frontMatter.tags) {
                        // console.log(frontMatter.tags);
                        let tagMeasure = 0.0;
                        let tagExist = false;
                        if (Array.isArray(frontMatter.tags)) {
                            frontMatterTags = frontMatterTags.concat(
                                frontMatter.tags
                            );
                        } else {
                            frontMatterTags.push(frontMatter.tags);
                        }

                        for (let tag of frontMatterTags) {
                            // nested tag in frontmatter is not supported yet
                            if (tag === graphInfo.searchTarget) {
                                // simple tag
                                tagMeasure = tagMeasure + graphInfo.constValue;
                                tagExist = true;
                            } else if (
                                tag.startsWith(graphInfo.searchTarget + "/")
                            ) {
                                // nested tag
                                tagMeasure = tagMeasure + graphInfo.constValue;
                                tagExist = true;
                            }

                            // valued-tag in frontmatter is not supported
                            // because the "tag:value" in frontmatter will be consider as a new tag for different values

                            let newPoint = new DataPoint();
                            newPoint.date = fileDate.clone();
                            if (tagExist) {
                                newPoint.value = tagMeasure;
                            } else {
                                newPoint.value = null;
                            }
                            data.push(newPoint);
                            //console.log(newPoint);
                        }
                    }
                }
            }

            // console.log("Search inline tags");
            if (graphInfo.searchType === "tag") {
                // Add inline tags
                let content = await this.app.vault.adapter.read(file.path);

                // console.log(content);
                // Test this in Regex101 
                //(^|\s)#tagName(\/[\w]+)*(:(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)(?<unit>\w*)?)?([\.!,\?;~-]*)?(\s|$)
                let strHashtagRegex =
                    "(^|\\s)#" +
                    graphInfo.searchTarget +
                    "(\\/[\\w]+)*" +
                    "(:(?<value>[\\-]?[0-9]+[\\.][0-9]+|[\\-]?[0-9]+)(?<unit>\\w*)?)?([\\.!,\\?;~-]*)?(\\s|$)";
                // console.log(strHashtagRegex);
                let hashTagRegex = new RegExp(strHashtagRegex, "gm");
                let match;
                let tagMeasure = 0.0;
                let tagExist = false;
                while ((match = hashTagRegex.exec(content))) {
                    // console.log(match);
                    if (
                        !graphInfo.ignoreAttchedValue &&
                        match[0].includes(":")
                    ) {
                        // match[0] whole match
                        // console.log("valued-tag");
                        if (typeof match.groups.value !== "undefined") {
                            // set as null for missing value if it is valued-tag
                            let value = parseFloat(match.groups.value);
                            // console.log(value);
                            if (!Number.isNaN(value)) {
                                tagMeasure += value;
                                tagExist = true;
                            }
                        }
                    } else {
                        // console.log("simple-tag");
                        tagMeasure = tagMeasure + graphInfo.constValue;
                    }
                }

                let newPoint = new DataPoint();
                newPoint.date = fileDate.clone();
                if (tagExist) {
                    newPoint.value = tagMeasure;
                } else {
                    newPoint.value = null;
                }
                // console.log(newPoint);

                data.push(newPoint);
            }

            if (graphInfo.searchType === "text") {
                let content = await this.app.vault.adapter.read(file.path);
                // console.log(content);

                let strHashtagRegex = graphInfo.searchTarget.replace(
                    /[|\\{}()[\]^$+*?.]/g,
                    "\\$&"
                );
                // console.log(strHashtagRegex);
                let hashTagRegex = new RegExp(strHashtagRegex, "gm");
                let match;
                let tagMeasure = 0.0;
                let tagExist = false;
                while ((match = hashTagRegex.exec(content))) {
                    // console.log(match);
                    tagExist = true;
                    tagMeasure = tagMeasure + graphInfo.constValue;
                }

                let newPoint = new DataPoint();
                newPoint.date = fileDate.clone();
                if (tagExist) {
                    newPoint.value = tagMeasure;
                } else {
                    newPoint.value = null;
                }
                // console.log(newPoint);

                data.push(newPoint);
            }
        } // end loof of files
        // console.log(minDate);
        // console.log(maxDate);
        // console.log(data);

        // Check date range
        if (!minDate.isValid() || !maxDate.isValid()) {
            let errorMessage = "Invalid date range";
            this.renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }
        if (!graphInfo.startDate.isValid() && !graphInfo.endDate.isValid()) {
            // No date arguments
            graphInfo.startDate = minDate.clone();
            graphInfo.endDate = maxDate.clone();
        } else if (
            graphInfo.startDate.isValid() &&
            !graphInfo.endDate.isValid()
        ) {
            if (graphInfo.startDate < maxDate) {
                graphInfo.endDate = maxDate.clone();
            } else {
                let errorMessage = "Invalid date range";
                this.renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        } else if (
            graphInfo.endDate.isValid() &&
            !graphInfo.startDate.isValid()
        ) {
            if (graphInfo.endDate > minDate) {
                graphInfo.startDate = minDate.clone();
            } else {
                let errorMessage = "Invalid date range";
                this.renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        } else {
            // startDate and endDate are valid
            if (
                (graphInfo.startDate < minDate &&
                    graphInfo.endDate < minDate) ||
                (graphInfo.startDate > maxDate && graphInfo.endDate > maxDate)
            ) {
                let errorMessage = "Invalid date range";
                this.renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        }
        // console.log(startDate);
        // console.log(endDate);

        // Preprocess data
        for (
            let curDate = graphInfo.startDate.clone();
            curDate <= graphInfo.endDate;
            curDate.add(1, "days")
        ) {
            // console.log(curDate);
            let dataPoints = data.filter((p) => curDate.isSame(p.date));

            if (dataPoints.length > 0) {
                // Add point to graphInfo

                // Merge data points of the same day
                let dataPoint = dataPoints[0];
                let dataPointValue = 0;
                let dataPointHasValue = false;
                for (
                    let indDataPoint = 0;
                    indDataPoint < dataPoints.length;
                    indDataPoint++
                ) {
                    if (dataPoints[indDataPoint].value !== null) {
                        dataPointValue += dataPoints[indDataPoint].value;
                        dataPointHasValue = true;
                    }
                }
                if (dataPointHasValue) {
                    dataPoint.value = dataPointValue;
                }

                // Data info
                if (dataPoint.value === null) {
                    graphInfo.dataInfo.maxStreak = 0;
                    graphInfo.dataInfo.maxBreak++;
                } else if (dataPoint.value === 0) {
                    if (graphInfo.dataInfo.min > 0) {
                        graphInfo.dataInfo.min = 0;
                    }
                    if (graphInfo.dataInfo.max < 0) {
                        graphInfo.dataInfo.max = 0;
                    }

                    graphInfo.dataInfo.count++; // count not null, include zero

                    graphInfo.dataInfo.maxStreak = 0;
                    graphInfo.dataInfo.maxBreak++;
                } else {
                    if (graphInfo.dataInfo.min > dataPoint.value) {
                        graphInfo.dataInfo.min = dataPoint.value;
                    }
                    if (graphInfo.dataInfo.max < dataPoint.value) {
                        graphInfo.dataInfo.max = dataPoint.value;
                    }

                    graphInfo.dataInfo.sum += dataPoint.value;
                    graphInfo.dataInfo.count++; // count not null

                    graphInfo.dataInfo.maxStreak++;
                    graphInfo.dataInfo.maxBreak = 0;
                }

                graphInfo.data.push(dataPoint);
            } else {
                // Add missing point of this day

                let newPoint = new DataPoint();
                newPoint.date = curDate.clone();
                newPoint.value = null;

                // Data info
                graphInfo.dataInfo.maxStreak = 0;
                graphInfo.dataInfo.maxBreak++;

                graphInfo.data.push(newPoint);
            }
        }
        // console.log(graphInfo);

        let result = this.render(canvas, graphInfo);
        if (typeof result === "string") {
            let errorMessage = result;
            this.renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        el.appendChild(canvas);
    }

    getEditor(): Editor {
        return this.app.workspace.getActiveViewOfType(MarkdownView).editor;
    }

    addCodeBlock(outputType: OutputType): void {
        const currentView = this.app.workspace.activeLeaf.view;

        if (!(currentView instanceof MarkdownView)) {
            return;
        }

        let codeblockToInsert = "";
        switch (outputType) {
            case OutputType.Line:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
line:
    yAxisLabel: Value
\`\`\``;
                break;
            case OutputType.Text:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
text:
    template: "Total number of tagName is {{sum}}"
\`\`\``;
                break;
            case OutputType.Table:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
table:
\`\`\``;
                break;
            case OutputType.Heatmap:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
heatmap:
\`\`\``;
                break;
        }

        if (codeblockToInsert !== "") {
            let textInserted = this.insertToNextLine(codeblockToInsert);
            if (!textInserted) {
            }
        }
    }

    insertToNextLine(text: string): boolean {
        let editor = this.getEditor();

        if (editor) {
            let cursor = editor.getCursor();
            let lineNumber = cursor.line;
            let line = editor.getLine(lineNumber);

            cursor.ch = line.length;
            editor.setSelection(cursor);
            editor.replaceSelection("\n" + text);

            return true;
        }

        return false;
    }
}
