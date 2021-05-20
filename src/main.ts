import { App, CachedMetadata, Plugin } from "obsidian";
import { MarkdownPostProcessorContext, MarkdownView, Editor } from "obsidian";
import { TFile, TFolder, normalizePath } from "obsidian";
import { render, renderErrorMessage } from "./rendering";
import { getRenderInfoFromYaml } from "./parsing";
import {
    NullableNumber,
    Datasets,
    Query,
    QueryValuePair,
    OutputType,
    SearchType,
    TableData,
    RenderInfo,
    XValueMap,
    DataMap,
} from "./data";
import * as collecting from "./collecting";
import {
    TrackerSettings,
    DEFAULT_SETTINGS,
    TrackerSettingTab,
} from "./settings";
import * as helper from "./helper";
import { Moment } from "moment";
// import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

declare global {
    interface Window {
        app: App;
        moment: () => Moment;
    }
}

export default class Tracker extends Plugin {
    settings: TrackerSettings;

    async onload() {
        console.log("loading obsidian-tracker plugin");

        await this.loadSettings();

        this.addSettingTab(new TrackerSettingTab(this.app, this));

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
            id: "add-bar-chart-tracker",
            name: "Add Bar Chart Tracker",
            callback: () => this.addCodeBlock(OutputType.Bar),
        });

        this.addCommand({
            id: "add-summary-tracker",
            name: "Add Summary Tracker",
            callback: () => this.addCodeBlock(OutputType.Summary),
        });
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

    // To be moved to collecting.ts
    addToDataMap(
        dataMap: DataMap,
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
        // console.log("postprocess");
        const canvas = document.createElement("div");

        let yamlText = source.trim();
        let retRenderInfo = getRenderInfoFromYaml(yamlText, this);
        if (typeof retRenderInfo === "string") {
            let errorMessage = retRenderInfo;
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }
        let renderInfo = retRenderInfo as RenderInfo;
        // console.log(renderInfo);

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

        // let dailyNotesSettings = getDailyNoteSettings();
        // console.log(dailyNotesSettings);
        // I always got YYYY-MM-DD from dailyNotesSettings.format
        // Use own settings panel for now

        // Collecting data to dataMap first
        let minDate = window.moment("");
        let maxDate = window.moment("");
        let fileCounter = 0;

        let dataMap: DataMap = new Map(); // {strDate: [query: value, ...]}
        // Collect data from files, each file has one data point for each query
        const loopFilePromises = files.map(async (file) => {
            // console.log(file.basename);
            // Get fileCache and content
            let fileCache: CachedMetadata = null;
            let needFileCache = renderInfo.queries.some((q) => {
                let type = q.getType();
                if (
                    type === SearchType.Frontmatter ||
                    type === SearchType.Tag ||
                    type === SearchType.Wiki
                ) {
                    return true;
                }
                return false;
            });
            if (needFileCache) {
                fileCache = this.app.metadataCache.getFileCache(file);
            }

            let content: string = null;
            let needContent = renderInfo.queries.some((q) => {
                let type = q.getType();
                if (
                    type === SearchType.Tag ||
                    type === SearchType.Text ||
                    type === SearchType.dvField
                ) {
                    return true;
                }
                return false;
            });
            if (needContent) {
                content = await this.app.vault.adapter.read(file.path);
            }

            // Get xValue and add it into xValueMap for later use
            let xValueMap: XValueMap = new Map(); // queryId: xValue
            let skipThisFile = false;
            for (let xDatasetId of renderInfo.xDataset) {
                if (!xValueMap.has(xDatasetId)) {
                    if (xDatasetId === -1) {
                        // Default using date in filename as xValue
                        let fileDate = helper.getDateFromFilename(
                            file,
                            renderInfo
                        );
                        // console.log(fileDate);
                        if (!fileDate.isValid()) {
                            // console.log("file " + file.basename + " rejected");
                            skipThisFile = true;
                        } else {
                            // console.log("file " + file.basename + " accepted");
                            if (renderInfo.startDate !== null) {
                                if (fileDate < renderInfo.startDate) {
                                    skipThisFile = true;
                                }
                            }
                            if (renderInfo.endDate !== null) {
                                if (fileDate > renderInfo.endDate) {
                                    skipThisFile = true;
                                }
                            }
                        }

                        if (!skipThisFile) {
                            xValueMap.set(
                                -1,
                                fileDate.format(renderInfo.dateFormat)
                            );
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
                        }
                    } else {
                        let xDatasetQuery = renderInfo.queries[xDatasetId];
                        // console.log(xDatasetQuery);
                        switch (xDatasetQuery.getType()) {
                            case SearchType.Frontmatter:
                                break;
                            case SearchType.Tag:
                                break;
                            case SearchType.Text:
                                break;
                            case SearchType.dvField:
                                break;
                        }
                    }
                }
            }
            if (skipThisFile) return;
            // console.log(xValueMap);

            // Loop over queries
            let yDatasetQueries = renderInfo.queries.filter((q) => {
                return q.getType() !== SearchType.Table && !q.usedAsXDataset;
            });
            const loopQueryPromises = yDatasetQueries.map(async (query) => {
                // Get xValue from file if xDataset assigned
                // if (renderInfo.xDataset !== null)
                // let xDatasetId = renderInfo.xDataset;

                // console.log("Search frontmatter tags");
                if (fileCache && query.getType() === SearchType.Tag) {
                    // Add frontmatter tags, allow simple tag only
                    collecting.collectDataFromFrontmatterTag(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                } // Search frontmatter tags

                // console.log("Search frontmatter keys");
                if (
                    fileCache &&
                    query.getType() === SearchType.Frontmatter &&
                    query.getTarget() !== "tags"
                ) {
                    collecting.collectDataFromFrontmatterKey(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                } // console.log("Search frontmatter keys");

                // console.log("Search wiki links");
                if (fileCache && query.getType() === SearchType.Wiki) {
                    collecting.collectDataFromWiki(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                }

                // console.log("Search inline tags");
                if (content && query.getType() === SearchType.Tag) {
                    collecting.collectDataFromInlineTag(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                } // Search inline tags

                // console.log("Search text");
                if (content && query.getType() === SearchType.Text) {
                    collecting.collectDataFromText(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                } // Search text

                // console.log("Search dvField");
                if (content && query.getType() === SearchType.dvField) {
                    collecting.collectDataFromDvField(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                } // search dvField
            });
            await Promise.all(loopQueryPromises);
        });
        await Promise.all(loopFilePromises);

        // Collect data from a file, one file contains full dataset
        let tableQueries = renderInfo.queries.filter(
            (q) => q.getType() === SearchType.Table
        );
        // Separate queries by tables and xDatasets/yDatasets
        let tables: Array<TableData> = [];
        for (let query of tableQueries) {
            let filePath = query.getParentTarget();
            let tableIndex = query.getAccessor();
            let isX = query.usedAsXDataset;

            let table = tables.find(
                (t) => t.filePath === filePath && t.tableIndex === tableIndex
            );
            if (table) {
                if (isX) {
                    table.xDataset = query;
                } else {
                    table.yDatasets.push(query);
                }
            } else {
                let tableData = new TableData(filePath, tableIndex);
                if (isX) {
                    tableData.xDataset = query;
                } else {
                    tableData.yDatasets.push(query);
                }
                tables.push(tableData);
            }
        }
        // console.log(tables);

        for (let tableData of tables) {
            //extract xDataset from query
            let xDatasetQuery = tableData.xDataset;
            let yDatasetQueries = tableData.yDatasets;
            let filePath = xDatasetQuery.getParentTarget();
            let tableIndex = xDatasetQuery.getAccessor();

            // Get table text
            let textTable = "";
            filePath = filePath + ".md";
            let file = this.app.vault.getAbstractFileByPath(
                normalizePath(filePath)
            );
            if (file && file instanceof TFile) {
                fileCounter++;
                let content = await this.app.vault.adapter.read(file.path);
                // console.log(content);

                // Test this in Regex101
                // This is a not-so-strict table selector
                // ((\r?\n){2}|^)([^\r\n]*\|[^\r\n]*(\r?\n)?)+(?=(\r?\n){2}|$)
                let strMDTableRegex =
                    "((\\r?\\n){2}|^)([^\\r\\n]*\\|[^\\r\\n]*(\\r?\\n)?)+(?=(\\r?\\n){2}|$)";
                // console.log(strMDTableRegex);
                let mdTableRegex = new RegExp(strMDTableRegex, "gm");
                let match;
                let indTable = 0;

                while ((match = mdTableRegex.exec(content))) {
                    // console.log(match);
                    if (indTable === tableIndex) {
                        textTable = match[0];
                        break;
                    }
                    indTable++;
                }
            } else {
                // file not exists
                continue;
            }
            // console.log(textTable);

            let tableLines = textTable.split(/\r?\n/);
            tableLines = tableLines.filter((line) => {
                return line !== "";
            });
            let numColumns = 0;
            let numDataRows = 0;
            // console.log(tableLines);

            // Make sure it is a valid table first
            if (tableLines.length >= 2) {
                // Must have header and separator line
                let headerLine = tableLines.shift().trim();
                headerLine = helper.trimByChar(headerLine, "|");
                let headerSplitted = headerLine.split("|");
                numColumns = headerSplitted.length;

                let sepLine = tableLines.shift().trim();
                sepLine = helper.trimByChar(sepLine, "|");
                let spepLineSplitted = sepLine.split("|");
                for (let col of spepLineSplitted) {
                    if (!col.includes("-")) {
                        break; // Not a valid sep
                    }
                }

                numDataRows = tableLines.length;
            }

            if (numDataRows == 0) continue;

            // get x data
            let columnXDataset = xDatasetQuery.getAccessor(1);
            if (columnXDataset >= numColumns) continue;
            let xValues = [];

            for (let tableLine of tableLines) {
                let dataRow = helper.trimByChar(tableLine.trim(), "|");
                let dataRowSplitted = dataRow.split("|");
                if (columnXDataset < dataRowSplitted.length) {
                    let data = dataRowSplitted[columnXDataset].trim();

                    let date = window.moment(data, renderInfo.dateFormat, true);

                    if (!minDate.isValid() && !maxDate.isValid()) {
                        minDate = date.clone();
                        maxDate = date.clone();
                    } else {
                        if (date < minDate) {
                            minDate = date.clone();
                        }
                        if (date > maxDate) {
                            maxDate = date.clone();
                        }
                    }

                    xValues.push(date);
                }
            }
            // console.log(xValues);

            // get y data
            for (let yDatasetQuery of yDatasetQueries) {
                let columnOfInterest = yDatasetQuery.getAccessor(1);
                // console.log(`columnOfInterest: ${columnOfInterest}, numColumns: ${numColumns}`);
                if (columnOfInterest >= numColumns) continue;

                let indLine = 0;
                for (let tableLine of tableLines) {
                    let dataRow = helper.trimByChar(tableLine.trim(), "|");
                    let dataRowSplitted = dataRow.split("|");
                    if (columnOfInterest < dataRowSplitted.length) {
                        let data = dataRowSplitted[columnOfInterest].trim();
                        let splitted = data.split(yDatasetQuery.getSeparator());
                        if (!splitted) continue;
                        if (splitted.length === 1) {
                            let value = parseFloat(splitted[0]);
                            if (Number.isNumber(value)) {
                                this.addToDataMap(
                                    dataMap,
                                    xValues[indLine].format(
                                        renderInfo.dateFormat
                                    ),
                                    yDatasetQuery,
                                    value
                                );
                            }
                        } else if (
                            splitted.length > yDatasetQuery.getAccessor(2) &&
                            yDatasetQuery.getAccessor(2) >= 0
                        ) {
                            let value = null;
                            let splittedPart =
                                splitted[yDatasetQuery.getAccessor(2)].trim();
                            value = parseFloat(splittedPart);
                            if (Number.isNumber(value)) {
                                this.addToDataMap(
                                    dataMap,
                                    xValues[indLine].format(
                                        renderInfo.dateFormat
                                    ),
                                    yDatasetQuery,
                                    value
                                );
                            }
                        }
                    }

                    indLine++;
                } // Loop over tableLines
            }
        }

        if (fileCounter === 0) {
            let errorMessage =
                "No notes found under the given search condition";
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
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
        if (renderInfo.startDate === null && renderInfo.endDate === null) {
            // No date arguments
            renderInfo.startDate = minDate.clone();
            renderInfo.endDate = maxDate.clone();
        } else if (
            renderInfo.startDate !== null &&
            renderInfo.endDate === null
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
            renderInfo.endDate !== null &&
            renderInfo.startDate === null
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
        let datasets = new Datasets(renderInfo.startDate, renderInfo.endDate);
        for (let query of renderInfo.queries) {
            // We still create a dataset for xDataset,
            // to keep the sequence and order of targets
            let dataset = datasets.createDataset(query, renderInfo);
            for (
                let curDate = renderInfo.startDate.clone();
                curDate <= renderInfo.endDate;
                curDate.add(1, "days")
            ) {
                // console.log(curDate);

                // dataMap --> {date: [query: value, ...]}
                if (dataMap.has(curDate.format(renderInfo.dateFormat))) {
                    let queryValuePairs = dataMap
                        .get(curDate.format(renderInfo.dateFormat))
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
                            dataset.setValue(curDate, value);
                        }
                    }
                }
            }
        }
        renderInfo.datasets = datasets;
        // console.log(renderInfo.datasets);

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
startDate:
endDate:
line:
    title: "Line Chart"
    xAxisLabel: Date
    yAxisLabel: Value
\`\`\``;
                break;
            case OutputType.Bar:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
folder: /
startDate:
endDate:
bar:
    title: "Bar Chart"
    xAxisLabel: Date
    yAxisLabel: Value
\`\`\``;
                break;
            case OutputType.Summary:
                codeblockToInsert = `\`\`\` tracker
searchType: tag
searchTarget: tagName
folder: /
startDate:
endDate:
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
