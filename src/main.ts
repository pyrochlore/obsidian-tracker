import { App, Plugin } from "obsidian";
import { MarkdownPostProcessorContext, MarkdownView, Editor } from "obsidian";
import { TFile, TFolder, normalizePath } from "obsidian";
import { render, renderErrorMessage } from "./rendering";
import { getRenderInfoFromYaml } from "./parsing";
import { NullableNumber, DataSets, Query, QueryValuePair } from "./data";
import { Moment } from "moment";

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

    addToDataMap(
        dataMap: Map<string, Array<QueryValuePair>>,
        date: string,
        query: Query,
        value: NullableNumber
    ) {
        if (!dataMap.has(date)) {
            let queryValuePairs = new Array<QueryValuePair>();
            queryValuePairs.push({ query: query, value: value });
            dataMap.set(date, queryValuePairs);
        } else {
            let targetValuePairs = dataMap.get(date);
            targetValuePairs.push({ query: query, value: value });
        }
    }

    async postprocessor(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ) {
        const canvas = document.createElement("div");

        let yamlText = source.trim();
        let renderInfo = getRenderInfoFromYaml(yamlText, this);
        if (typeof renderInfo === "string") {
            let errorMessage = renderInfo;
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        // Get files
        let files: TFile[];
        try {
            files = this.getFiles(renderInfo.folder);
        } catch (e) {
            let errorMessage = e.message;
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }
        // console.log(files);

        // Collecting data to dataMap first
        let minDate = window.moment("");
        let maxDate = window.moment("");
        let fileCounter = 0;

        let queries = new Array<Query>();
        queries.push(new Query(renderInfo.searchType, renderInfo.searchTarget));

        let dataMap = new Map<string, Array<QueryValuePair>>(); // {strDate: [query: value, ...]}

        for (let query of queries) {
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
                if (query.type === "tag") {
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
                                if (tag === query.target) {
                                    // simple tag
                                    tagMeasure =
                                        tagMeasure + renderInfo.constValue;
                                    tagExist = true;
                                } else if (tag.startsWith(query.target + "/")) {
                                    // nested tag
                                    tagMeasure =
                                        tagMeasure + renderInfo.constValue;
                                    tagExist = true;
                                } else {
                                    continue;
                                }

                                // valued-tag in frontmatter is not supported
                                // because the "tag:value" in frontmatter will be consider as a new tag for different values

                                let value = null;
                                if (tagExist) {
                                    value = tagMeasure;
                                }
                                this.addToDataMap(
                                    dataMap,
                                    fileDate.format(this.dateFormat),
                                    query,
                                    value
                                );
                            }
                        }
                    }
                } // Search frontmatter tags

                // console.log("Search frontmatter keys");
                if (query.type === "frontmatter" && query.target !== "tags") {
                    let fileCache = this.app.metadataCache.getFileCache(file);
                    if (fileCache) {
                        let frontMatter = fileCache.frontmatter;
                        if (frontMatter && frontMatter[query.target]) {
                            // console.log(frontMatter[query.target]);
                            let value = frontMatter[query.target];
                            if (Array.isArray(value)) {
                                // multiple values not support yet
                            } else {
                                value = parseFloat(value);
                                if (typeof value === "number") {
                                    this.addToDataMap(
                                        dataMap,
                                        fileDate.format(this.dateFormat),
                                        query,
                                        value
                                    );
                                }
                            }
                        }
                    }
                } // console.log("Search frontmatter keys");

                // console.log("Search inline tags");
                if (query.type === "tag") {
                    // Add inline tags
                    let content = await this.app.vault.adapter.read(file.path);

                    // console.log(content);
                    // Test this in Regex101
                    //(^|\s)#tagName(\/[\w]+)*(:(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)(?<unit>\w*)?)?([\.!,\?;~-]*)?(\s|$)
                    let strHashtagRegex =
                        "(^|\\s)#" +
                        query.target +
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

                    let value = null;
                    if (tagExist) {
                        value = tagMeasure;
                    }
                    this.addToDataMap(
                        dataMap,
                        fileDate.format(this.dateFormat),
                        query,
                        value
                    );
                } // Search inline tags

                // console.log("Search text");
                if (query.type === "text") {
                    let content = await this.app.vault.adapter.read(file.path);
                    // console.log(content);

                    let strTextRegex = query.target.replace(
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

                    let value = null;
                    if (tagExist) {
                        value = tagMeasure;
                    }
                    this.addToDataMap(
                        dataMap,
                        fileDate.format(this.dateFormat),
                        query,
                        value
                    );
                } // Search text
            } // end loof of files
        }
        // console.log(minDate);
        // console.log(maxDate);
        // console.log(dataMap);

        // Check date range
        if (!minDate.isValid() || !maxDate.isValid()) {
            let errorMessage = "Invalid date range";
            renderErrorMessage(canvas, errorMessage);
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
                renderErrorMessage(canvas, errorMessage);
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
                renderErrorMessage(canvas, errorMessage);
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
                renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        }
        // console.log(renderInfo.startDate);
        // console.log(renderInfo.endDate);

        // Reshape data for rendering
        let dataSets = new DataSets(renderInfo.startDate, renderInfo.endDate);
        for (let query of queries) {
            let dataSet = dataSets.createDataSet(query);
            for (
                let curDate = renderInfo.startDate.clone();
                curDate <= renderInfo.endDate;
                curDate.add(1, "days")
            ) {
                // console.log(curDate);

                // dataMap --> {date: [query: value, ...]}
                if (dataMap.has(curDate.format(this.dateFormat))) {
                    let queryValuePairs = dataMap
                        .get(curDate.format(this.dateFormat))
                        .filter(function (pair) {
                            return pair.query.equalTo(query);
                        });
                    if (queryValuePairs.length > 0) {
                        // Merge values of the same day same query
                        let pair = queryValuePairs[0];
                        let value = 0;
                        let hasValue = false;
                        for (
                            let indPair = 0;
                            indPair < queryValuePairs.length;
                            indPair++
                        ) {
                            if (queryValuePairs[indPair].value !== null) {
                                value += queryValuePairs[indPair].value;
                                hasValue = true;
                            }
                        }
                        // console.log(hasValue);
                        // console.log(value);
                        if (hasValue) {
                            dataSet.setValue(curDate, value);
                        }
                    }
                }
            }
        }
        renderInfo.dataSets = dataSets;
        // console.log(renderInfo);

        let result = render(canvas, renderInfo);
        if (typeof result === "string") {
            let errorMessage = result;
            renderErrorMessage(canvas, errorMessage);
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
