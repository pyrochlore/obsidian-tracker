import { App, Plugin } from "obsidian";
import { MarkdownPostProcessorContext, MarkdownView, Editor } from "obsidian";
import { TFile, TFolder, normalizePath } from "obsidian";

import {
    DataPoint,
    RenderInfo,
    LineInfo,
    renderLine,
    SummaryInfo,
    renderSummary,
} from "./graph";

import * as Yaml from "yaml";
import * as d3 from "d3";
import { Moment } from "moment";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

declare global {
    interface Window {
        app: App;
        moment: () => Moment;
    }
}

enum OutputType {
    Line,
    Summary,
    Table,
    Heatmap,
}

export default class Tracker extends Plugin {
    folder: string;
    dateFormat: string;

    async onload() {
        console.log("loading obsidian-tracker plugin");

        this.registerMarkdownCodeBlockProcessor(
            "tracker",
            this.postprocessor.bind(this)
        );

        this.addCommand({
            id: "add-line-chart-tracker",
            name: "Add Line Chart Tracker",
            callback: () => this.addCodeBlock(OutputType.Line),
        });

        this.addCommand({
            id: "add-summary-tracker",
            name: "Add Summary Tracker",
            callback: () => this.addCodeBlock(OutputType.Summary),
        });
    }

    onunload() {
        console.log("unloading obsidian-tracker plugin");
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

    render(canvas: HTMLElement, renderInfo: RenderInfo) {
        // console.log(renderInfo.data);

        // Data preprocessing
        let tagMeasureAccum = 0.0;
        for (let dataPoint of renderInfo.data) {
            if (renderInfo.penalty !== null) {
                if (dataPoint.value === null) {
                    dataPoint.value = renderInfo.penalty;
                }
            }
            if (renderInfo.accum) {
                if (dataPoint.value !== null) {
                    tagMeasureAccum += dataPoint.value;
                    dataPoint.value = tagMeasureAccum;
                }
            }
        }

        if (renderInfo.output === "") {
            if (renderInfo.summary !== null) {
                return renderSummary(canvas, renderInfo);
            }
            // Default
            return renderLine(canvas, renderInfo);
        } else if (renderInfo.output === "line") {
            return renderLine(canvas, renderInfo);
        } else if (renderInfo.output === "summary") {
            return renderSummary(canvas, renderInfo);
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
                if (item.extension === "md") {
                    files.push(item);
                }
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

    getRenderInfoFromYaml(yamlText: string): RenderInfo | string {
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
            if (yaml.searchType === "tag") {
                if (
                    yaml.searchTarget.startsWith("#") &&
                    yaml.searchTarget.length > 2
                ) {
                    searchTarget = yaml.searchTarget.substring(1);
                } else {
                    searchTarget = yaml.searchTarget;
                }
            } else {
                // yaml.searchType === "text"
                searchTarget = yaml.searchTarget;
            }
        } else {
            let errorMessage = "Invalid search target (searchTarget)";
            return errorMessage;
        }
        // console.log(searchTarget);

        // Create grarph info
        let renderInfo = new RenderInfo(searchType, searchTarget);

        // Get daily notes settings using obsidian-daily-notes-interface
        let dailyNotesSettings = getDailyNoteSettings();

        // Root folder to search
        if (typeof yaml.folder !== "string") {
            if (
                typeof dailyNotesSettings.folder === "undefined" ||
                dailyNotesSettings.folder === null
            ) {
                this.folder = "/";
            } else {
                this.folder = dailyNotesSettings.folder;
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
        renderInfo.folder = this.folder;
        // console.log(renderInfo.folder);

        // Date format
        if (typeof yaml.dateFormat !== "string") {
            if (
                typeof dailyNotesSettings.format === "undefined" ||
                dailyNotesSettings.format === null
            ) {
                this.dateFormat = "YYYY-MM-DD";
            } else {
                this.dateFormat = dailyNotesSettings.format;
            }
        } else {
            if (yaml.dateFormat === "") {
                this.dateFormat = "YYYY-MM-DD";
            } else {
                this.dateFormat = yaml.dateForamt;
            }
        }

        // startDate, endDate
        if (typeof yaml.startDate === "string") {
            renderInfo.startDate = window.moment(
                yaml.startDate,
                this.dateFormat
            );
        }
        if (typeof yaml.endDate === "string") {
            renderInfo.endDate = window.moment(yaml.endDate, this.dateFormat);
        }
        if (renderInfo.startDate.isValid() && renderInfo.endDate.isValid()) {
            // Make sure endDate > startDate
            if (renderInfo.endDate < renderInfo.startDate) {
                let errorMessage = "Invalid date range (startDate and endDate)";
                return errorMessage;
            }
        }
        // console.log(renderInfo.startDate);
        // console.log(renderInfo.endDate);

        // constValue
        if (typeof yaml.constValue === "number") {
            renderInfo.constValue = yaml.constValue;
        }

        // ignoreAttachedValue
        if (typeof yaml.ignoreAttachedValue === "boolean") {
            renderInfo.ignoreAttachedValue = yaml.ignoreAttachedValue;
        }

        // ignoreZeroValue
        if (typeof yaml.ignoreZeroValue === "boolean") {
            renderInfo.ignoreZeroValue = yaml.ignoreZeroValue;
        }

        // accum
        if (typeof yaml.accum === "boolean") {
            renderInfo.accum = yaml.accum;
        }
        // console.log(renderInfo.accum);

        // penalty
        if (typeof yaml.penalty === "number") {
            renderInfo.penalty = yaml.penalty;
        }
        // console.log(renderInfo.penalty);

        // line related parameters
        if (typeof yaml.output !== "undefined") {
            renderInfo.output = yaml.output;
        }
        if (typeof yaml.line !== "undefined") {
            // title
            if (typeof yaml.line.title === "string") {
                renderInfo.line.title = yaml.line.title;
            }
            // xAxisLabel
            if (typeof yaml.line.xAxisLabel === "string") {
                renderInfo.line.xAxisLabel = yaml.line.xAxisLabel;
            }
            // yAxisLabel
            if (typeof yaml.line.yAxisLabel === "string") {
                renderInfo.line.yAxisLabel = yaml.line.yAxisLabel;
            }
            // labelColor
            if (typeof yaml.line.labelColor === "string") {
                renderInfo.line.labelColor = yaml.line.labelColor;
            }
            // yAxisUnit
            if (typeof yaml.line.yAxisUnit === "string") {
                renderInfo.line.yAxisUnit = yaml.line.yAxisUnit;
            }
            // yMin
            if (typeof yaml.line.yMin === "number") {
                renderInfo.line.yMin = yaml.line.yMin;
            }
            // yMax
            if (typeof yaml.line.yMax === "number") {
                renderInfo.line.yMax = yaml.line.yMax;
            }
            // axisColor
            if (typeof yaml.line.axisColor === "string") {
                renderInfo.line.axisColor = yaml.line.axisColor;
            }
            // lineColor
            if (typeof yaml.line.lineColor === "string") {
                renderInfo.line.lineColor = yaml.line.lineColor;
            }
            // lineWidth
            if (typeof yaml.line.lineWidth === "number") {
                renderInfo.line.lineWidth = yaml.line.lineWidth;
            }
            // showLine
            if (typeof yaml.line.showLine === "boolean") {
                renderInfo.line.showLine = yaml.line.showLine;
            }
            // showPoint
            if (typeof yaml.line.showPoint === "boolean") {
                renderInfo.line.showPoint = yaml.line.showPoint;
            }
            // pointColor
            if (typeof yaml.line.pointColor === "string") {
                renderInfo.line.pointColor = yaml.line.pointColor;
            }
            // pointBorderColor
            if (typeof yaml.line.pointBorderColor === "string") {
                renderInfo.line.pointBorderColor = yaml.line.pointBorderColor;
            }
            // pointBorderWidth
            if (typeof yaml.line.pointBorderWidth === "number") {
                renderInfo.line.pointBorderWidth = yaml.line.pointBorderWidth;
            }
            // pointSize
            if (typeof yaml.line.pointSize === "number") {
                renderInfo.line.pointSize = yaml.line.pointSize;
            }
            // allowInspectData
            if (typeof yaml.line.allowInspectData === "boolean") {
                renderInfo.line.allowInspectData = yaml.line.allowInspectData;
            }
            // fillGap
            if (typeof yaml.line.fillGap === "boolean") {
                renderInfo.line.fillGap = yaml.line.fillGap;
            }
            // console.log(renderInfo.line.fillGap)
        } // line related parameters

        // summary related parameters
        if (typeof yaml.summary !== "undefined") {
            renderInfo.summary = new SummaryInfo();
            // template
            if (typeof yaml.summary.template === "string") {
                renderInfo.summary.template = yaml.summary.template;
            }
            if (typeof yaml.summary.style === "string") {
                renderInfo.summary.style = yaml.summary.style;
            }
        } // summary related parameters

        return renderInfo;
    }

    async postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        const canvas = document.createElement("div");

        let yamlText = source.trim();
        let renderInfo = this.getRenderInfoFromYaml(yamlText);
        if (typeof renderInfo === "string") {
            let errorMessage = renderInfo;
            this.renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        // Get files
        let files: TFile[];
        try {
            files = this.getFiles(renderInfo.folder);
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
            if (renderInfo.searchType === "tag") {
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
                            if (tag === renderInfo.searchTarget) {
                                // simple tag
                                tagMeasure = tagMeasure + renderInfo.constValue;
                                tagExist = true;
                            } else if (
                                tag.startsWith(renderInfo.searchTarget + "/")
                            ) {
                                // nested tag
                                tagMeasure = tagMeasure + renderInfo.constValue;
                                tagExist = true;
                            } else {
                                continue;
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
            if (renderInfo.searchType === "tag") {
                // Add inline tags
                let content = await this.app.vault.adapter.read(file.path);

                // console.log(content);
                // Test this in Regex101
                //(^|\s)#tagName(\/[\w]+)*(:(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)(?<unit>\w*)?)?([\.!,\?;~-]*)?(\s|$)
                let strHashtagRegex =
                    "(^|\\s)#" +
                    renderInfo.searchTarget +
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
                        !renderInfo.ignoreAttachedValue &&
                        match[0].includes(":")
                    ) {
                        // match[0] whole match
                        // console.log("valued-tag");
                        if (typeof match.groups.value !== "undefined") {
                            // set as null for missing value if it is valued-tag
                            let value = parseFloat(match.groups.value);
                            // console.log(value);
                            if (!Number.isNaN(value)) {
                                if (
                                    !renderInfo.ignoreZeroValue ||
                                    value !== 0
                                ) {
                                    tagMeasure += value;
                                    tagExist = true;
                                }
                            }
                        }
                    } else {
                        // console.log("simple-tag");
                        tagMeasure = tagMeasure + renderInfo.constValue;
                        tagExist = true;
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

            if (renderInfo.searchType === "text") {
                let content = await this.app.vault.adapter.read(file.path);
                // console.log(content);

                let strTextRegex = renderInfo.searchTarget.replace(
                    /[|\\{}()[\]^$+*?.]/g,
                    "\\$&"
                );
                // console.log(strHashtagRegex);
                let textRegex = new RegExp(strTextRegex, "gm");
                let match;
                let tagMeasure = 0.0;
                let tagExist = false;
                while ((match = textRegex.exec(content))) {
                    // console.log(match);
                    tagExist = true;
                    tagMeasure = tagMeasure + renderInfo.constValue;
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
        if (!renderInfo.startDate.isValid() && !renderInfo.endDate.isValid()) {
            // No date arguments
            renderInfo.startDate = minDate.clone();
            renderInfo.endDate = maxDate.clone();
        } else if (
            renderInfo.startDate.isValid() &&
            !renderInfo.endDate.isValid()
        ) {
            if (renderInfo.startDate < maxDate) {
                renderInfo.endDate = maxDate.clone();
            } else {
                let errorMessage = "Invalid date range";
                this.renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        } else if (
            renderInfo.endDate.isValid() &&
            !renderInfo.startDate.isValid()
        ) {
            if (renderInfo.endDate > minDate) {
                renderInfo.startDate = minDate.clone();
            } else {
                let errorMessage = "Invalid date range";
                this.renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        } else {
            // startDate and endDate are valid
            if (
                (renderInfo.startDate < minDate &&
                    renderInfo.endDate < minDate) ||
                (renderInfo.startDate > maxDate && renderInfo.endDate > maxDate)
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
            let curDate = renderInfo.startDate.clone();
            curDate <= renderInfo.endDate;
            curDate.add(1, "days")
        ) {
            // console.log(curDate);
            let dataPoints = data.filter((p) => curDate.isSame(p.date));

            if (dataPoints.length > 0) {
                // Add point to renderInfo

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

                renderInfo.data.push(dataPoint);
            } else {
                // Add missing point of this day

                let newPoint = new DataPoint();
                newPoint.date = curDate.clone();
                newPoint.value = null;

                renderInfo.data.push(newPoint);
            }
        }
        // console.log(renderInfo);

        let result = this.render(canvas, renderInfo);
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
folder: /
dateFormat: YYYY-MM-DD
startDate:
endDate:
constValue: 1.0
ignoreAttachedValue: false
ignoreZeroValue: false
accum: false
penalty:
line:
    title: "Line Chart"
    xAxisLabel: Date
    yAxisLabel: Value
    yAxisUnit: ""
    yMin:
    yMax:
    axisColor: ""
    lineColor: ""
    lineWidth: 1.5
    showLine: true
    showPoint: true
    pointColor: "#69b3a2"
    pointBorderColor: "#69b3a2"
    pointBorderWidth: 0
    pointSize: 3
    allowInspectData: true
    fillGap: false
\`\`\``;
                break;
            case OutputType.Summary:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
folder: /
dateFormat: YYYY-MM-DD
startDate:
endDate:
constValue: 1.0
ignoreAttachedValue: false
ignoreZeroValue: false
accum: false
penalty:
summary:
    template: "Average value of tagName is {{average}}"
    style: "color:white;"
\`\`\``;
                break;
            default:
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
