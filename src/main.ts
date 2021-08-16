import { App, CachedMetadata, Plugin } from "obsidian";
import { MarkdownPostProcessorContext, MarkdownView, Editor } from "obsidian";
import { TFile, TFolder, normalizePath } from "obsidian";
import { render, renderErrorMessage } from "./rendering";
import { getRenderInfoFromYaml } from "./parsing";
import {
    Datasets,
    Query,
    QueryValuePair,
    GraphType,
    SearchType,
    TableData,
    RenderInfo,
    XValueMap,
    DataMap,
    CustomDatasetInfo,
    CollectingProcessInfo,
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
            callback: () => this.addCodeBlock(GraphType.Line),
        });

        this.addCommand({
            id: "add-bar-chart-tracker",
            name: "Add Bar Chart Tracker",
            callback: () => this.addCodeBlock(GraphType.Bar),
        });

        this.addCommand({
            id: "add-summary-tracker",
            name: "Add Summary Tracker",
            callback: () => this.addCodeBlock(GraphType.Summary),
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
        let dataMap: DataMap = new Map(); // {strDate: [query: value, ...]}
        let processInfo = new CollectingProcessInfo();

        // Collect data from files, each file has one data point for each query
        const loopFilePromises = files.map(async (file) => {
            // console.log(file.basename);
            // Get fileCache and content
            let fileCache: CachedMetadata = null;
            let needFileCache = renderInfo.queries.some((q) => {
                let type = q.getType();
                let target = q.getTarget();
                if (
                    type === SearchType.Frontmatter ||
                    type === SearchType.Tag ||
                    type === SearchType.Wiki ||
                    type === SearchType.WikiLink ||
                    type === SearchType.WikiDisplay
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
                let target = q.getTarget();
                if (
                    type === SearchType.Tag ||
                    type === SearchType.Text ||
                    type === SearchType.dvField ||
                    type === SearchType.Task ||
                    type === SearchType.TaskDone ||
                    type === SearchType.TaskNotDone
                ) {
                    return true;
                } else if (type === SearchType.FileMeta) {
                    if (
                        target === "numWords" ||
                        target === "numChars" ||
                        target === "numSentences"
                    ) {
                        return true;
                    }
                }
                return false;
            });
            if (needContent) {
                content = await this.app.vault.adapter.read(file.path);
            }

            // Get xValue and add it into xValueMap for later use
            let xValueMap: XValueMap = new Map(); // queryId: xValue for this file
            let skipThisFile = false;
            // console.log(renderInfo.xDataset);
            for (let xDatasetId of renderInfo.xDataset) {
                // console.log(`xDatasetId: ${xDatasetId}`);
                if (!xValueMap.has(xDatasetId)) {
                    let xDate = window.moment("");
                    if (xDatasetId === -1) {
                        // Default using date in filename as xValue
                        xDate = collecting.getDateFromFilename(
                            file,
                            renderInfo
                        );
                        // console.log(xDate);
                    } else {
                        let xDatasetQuery = renderInfo.queries[xDatasetId];
                        // console.log(xDatasetQuery);
                        switch (xDatasetQuery.getType()) {
                            case SearchType.Frontmatter:
                                xDate = collecting.getDateFromFrontmatter(
                                    fileCache,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                            case SearchType.Tag:
                                xDate = collecting.getDateFromTag(
                                    content,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                            case SearchType.Text:
                                xDate = collecting.getDateFromText(
                                    content,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                            case SearchType.dvField:
                                xDate = collecting.getDateFromDvField(
                                    content,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                            case SearchType.FileMeta:
                                xDate = collecting.getDateFromFileMeta(
                                    file,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                            case SearchType.Task:
                            case SearchType.TaskDone:
                            case SearchType.TaskNotDone:
                                xDate = collecting.getDateFromTask(
                                    content,
                                    xDatasetQuery,
                                    renderInfo
                                );
                                break;
                        }
                    }

                    if (!xDate.isValid()) {
                        // console.log("Invalid xDate");
                        skipThisFile = true;
                    } else {
                        // console.log("file " + file.basename + " accepted");
                        if (renderInfo.startDate !== null) {
                            if (xDate < renderInfo.startDate) {
                                skipThisFile = true;
                            }
                        }
                        if (renderInfo.endDate !== null) {
                            if (xDate > renderInfo.endDate) {
                                skipThisFile = true;
                            }
                        }
                    }

                    if (!skipThisFile) {
                        processInfo.gotAnyValidXValue ||= true;
                        xValueMap.set(
                            xDatasetId,
                            helper.dateToStr(xDate, renderInfo.dateFormat)
                        );
                        processInfo.fileCounter++;

                        // Get min/max date
                        if (processInfo.fileCounter == 1) {
                            processInfo.minDate = xDate.clone();
                            processInfo.maxDate = xDate.clone();
                        } else {
                            if (xDate < processInfo.minDate) {
                                processInfo.minDate = xDate.clone();
                            }
                            if (xDate > processInfo.maxDate) {
                                processInfo.maxDate = xDate.clone();
                            }
                        }
                    }
                }
            }
            if (skipThisFile) return;
            // console.log(xValueMap);
            // console.log(`minDate: ${minDate}`);
            // console.log(`maxDate: ${maxDate}`);

            // Loop over queries
            let yDatasetQueries = renderInfo.queries.filter((q) => {
                return q.getType() !== SearchType.Table && !q.usedAsXDataset;
            });
            // console.log(yDatasetQueries);

            const loopQueryPromises = yDatasetQueries.map(async (query) => {
                // Get xValue from file if xDataset assigned
                // if (renderInfo.xDataset !== null)
                // let xDatasetId = renderInfo.xDataset;
                // console.log(query);

                // console.log("Search frontmatter tags");
                if (fileCache && query.getType() === SearchType.Tag) {
                    // Add frontmatter tags, allow simple tag only
                    let gotAnyValue = collecting.collectDataFromFrontmatterTag(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // Search frontmatter tags

                // console.log("Search frontmatter keys");
                if (
                    fileCache &&
                    query.getType() === SearchType.Frontmatter &&
                    query.getTarget() !== "tags"
                ) {
                    let gotAnyValue = collecting.collectDataFromFrontmatterKey(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // console.log("Search frontmatter keys");

                // console.log("Search wiki links");
                if (
                    fileCache &&
                    (query.getType() === SearchType.Wiki ||
                        query.getType() === SearchType.WikiLink ||
                        query.getType() === SearchType.WikiDisplay)
                ) {
                    let gotAnyValue = collecting.collectDataFromWiki(
                        fileCache,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                }

                // console.log("Search inline tags");
                if (content && query.getType() === SearchType.Tag) {
                    let gotAnyValue = collecting.collectDataFromInlineTag(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // Search inline tags

                // console.log("Search Text");
                if (content && query.getType() === SearchType.Text) {
                    let gotAnyValue = collecting.collectDataFromText(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // Search text

                // console.log("Search FileMeta");
                if (query.getType() === SearchType.FileMeta) {
                    let gotAnyValue = collecting.collectDataFromFileMeta(
                        file,
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // Search FileMeta

                // console.log("Search dvField");
                if (content && query.getType() === SearchType.dvField) {
                    let gotAnyValue = collecting.collectDataFromDvField(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // search dvField

                // console.log("Search Task");
                if (
                    content &&
                    (query.getType() === SearchType.Task ||
                        query.getType() === SearchType.TaskDone ||
                        query.getType() === SearchType.TaskNotDone)
                ) {
                    let gotAnyValue = collecting.collectDataFromTask(
                        content,
                        query,
                        renderInfo,
                        dataMap,
                        xValueMap
                    );
                    processInfo.gotAnyValidYValue ||= gotAnyValue;
                } // search Task
            });
            await Promise.all(loopQueryPromises);
        });
        await Promise.all(loopFilePromises);
        // console.log(dataMap);

        // Collect data from a file, one file contains full dataset
        await this.collectDataFromTable(dataMap, renderInfo, processInfo);
        if (processInfo.errorMessage) {
            renderErrorMessage(canvas, processInfo.errorMessage);
            el.appendChild(canvas);
            return;
        }

        if (!processInfo.gotAnyValidXValue) {
            let errorMessage = "No valid X values found in notes";
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        if (!processInfo.gotAnyValidYValue) {
            let errorMessage = "No valid Y values found in notes";
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }

        if (processInfo.fileCounter === 0) {
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
        if (!processInfo.minDate.isValid() || !processInfo.maxDate.isValid()) {
            let errorMessage = "Invalid date range";
            renderErrorMessage(canvas, errorMessage);
            el.appendChild(canvas);
            return;
        }
        if (renderInfo.startDate === null && renderInfo.endDate === null) {
            // No date arguments
            renderInfo.startDate = processInfo.minDate.clone();
            renderInfo.endDate = processInfo.maxDate.clone();
        } else if (
            renderInfo.startDate !== null &&
            renderInfo.endDate === null
        ) {
            if (renderInfo.startDate < processInfo.maxDate) {
                renderInfo.endDate = processInfo.maxDate.clone();
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
            if (renderInfo.endDate > processInfo.minDate) {
                renderInfo.startDate = processInfo.minDate.clone();
            } else {
                let errorMessage = "Invalid date range";
                renderErrorMessage(canvas, errorMessage);
                el.appendChild(canvas);
                return;
            }
        } else {
            // startDate and endDate are valid
            if (
                (renderInfo.startDate < processInfo.minDate &&
                    renderInfo.endDate < processInfo.minDate) ||
                (renderInfo.startDate > processInfo.maxDate &&
                    renderInfo.endDate > processInfo.maxDate)
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
            // Add number of targets to the dataset
            // Number of targets has been accumulated while collecting data
            dataset.addNumTargets(query.getNumTargets());
            for (
                let curDate = renderInfo.startDate.clone();
                curDate <= renderInfo.endDate;
                curDate.add(1, "days")
            ) {
                // console.log(curDate);

                // dataMap --> {date: [query: value, ...]}
                if (
                    dataMap.has(
                        helper.dateToStr(curDate, renderInfo.dateFormat)
                    )
                ) {
                    let queryValuePairs = dataMap
                        .get(helper.dateToStr(curDate, renderInfo.dateFormat))
                        .filter(function (pair) {
                            return pair.query.equalTo(query);
                        });
                    if (queryValuePairs.length > 0) {
                        // Merge values of the same day same query
                        let value = null;
                        for (
                            let indPair = 0;
                            indPair < queryValuePairs.length;
                            indPair++
                        ) {
                            let collected = queryValuePairs[indPair].value;
                            if (
                                Number.isNumber(collected) &&
                                !Number.isNaN(collected)
                            ) {
                                if (value === null) {
                                    value = collected;
                                } else {
                                    value += collected;
                                }
                            }
                        }
                        // console.log(hasValue);
                        // console.log(value);
                        if (value !== null) {
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

    // TODO: remove this.app and move to collecting.ts
    async collectDataFromTable(
        dataMap: DataMap,
        renderInfo: RenderInfo,
        processInfo: CollectingProcessInfo
    ) {
        // console.log("collectDataFromTable");

        let tableQueries = renderInfo.queries.filter(
            (q) => q.getType() === SearchType.Table
        );
        // console.log(tableQueries);
        // Separate queries by tables and xDatasets/yDatasets
        let tables: Array<TableData> = [];
        let tableFileNotFound = false;
        for (let query of tableQueries) {
            let filePath = query.getParentTarget();
            let file = this.app.vault.getAbstractFileByPath(
                normalizePath(filePath + ".md")
            );
            if (!file || !(file instanceof TFile)) {
                tableFileNotFound = true;
                break;
            }

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

        if (tableFileNotFound) {
            processInfo.errorMessage = "File containing tables not found";
            return;
        }

        for (let tableData of tables) {
            //extract xDataset from query
            let xDatasetQuery = tableData.xDataset;
            if (!xDatasetQuery) {
                // missing xDataset
                continue;
            }
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
                processInfo.fileCounter++;
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

            let indLine = 0;
            for (let tableLine of tableLines) {
                let dataRow = helper.trimByChar(tableLine.trim(), "|");
                let dataRowSplitted = dataRow.split("|");
                if (columnXDataset < dataRowSplitted.length) {
                    let data = dataRowSplitted[columnXDataset].trim();
                    let date = helper.strToDate(data, renderInfo.dateFormat);

                    if (date.isValid()) {
                        xValues.push(date);

                        if (
                            !processInfo.minDate.isValid() &&
                            !processInfo.maxDate.isValid()
                        ) {
                            processInfo.minDate = date.clone();
                            processInfo.maxDate = date.clone();
                        } else {
                            if (date < processInfo.minDate) {
                                processInfo.minDate = date.clone();
                            }
                            if (date > processInfo.maxDate) {
                                processInfo.maxDate = date.clone();
                            }
                        }
                    } else {
                        xValues.push(null);
                    }
                } else {
                    xValues.push(null);
                }
                indLine++;
            }
            // console.log(xValues);

            if (
                xValues.every((v) => {
                    return v === null;
                })
            ) {
                processInfo.errorMessage = "No valid X value found in table";
                return;
            } else {
                processInfo.gotAnyValidXValue ||= true;
            }

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
                                if (
                                    indLine < xValues.length &&
                                    xValues[indLine]
                                ) {
                                    processInfo.gotAnyValidYValue ||= true;
                                    collecting.addToDataMap(
                                        dataMap,
                                        helper.dateToStr(
                                            xValues[indLine],
                                            renderInfo.dateFormat
                                        ),
                                        yDatasetQuery,
                                        value
                                    );
                                }
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
                                if (
                                    indLine < xValues.length &&
                                    xValues[indLine]
                                ) {
                                    processInfo.gotAnyValidYValue ||= true;
                                    collecting.addToDataMap(
                                        dataMap,
                                        helper.dateToStr(
                                            xValues[indLine],
                                            renderInfo.dateFormat
                                        ),
                                        yDatasetQuery,
                                        value
                                    );
                                }
                            }
                        }
                    }

                    indLine++;
                } // Loop over tableLines
            }
        }
    }

    getEditor(): Editor {
        return this.app.workspace.getActiveViewOfType(MarkdownView).editor;
    }

    addCodeBlock(outputType: GraphType): void {
        const currentView = this.app.workspace.activeLeaf.view;

        if (!(currentView instanceof MarkdownView)) {
            return;
        }

        let codeblockToInsert = "";
        switch (outputType) {
            case GraphType.Line:
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
            case GraphType.Bar:
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
            case GraphType.Summary:
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
