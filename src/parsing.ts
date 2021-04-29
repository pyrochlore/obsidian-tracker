import Tracker from "./main";
import { BarInfo, Query, RenderInfo, SummaryInfo } from "./data";
import { TFolder, normalizePath } from "obsidian";
import * as Yaml from "yaml";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";
import { render } from "./rendering";

function strToBool(str: string): boolean | null {
    str = str.trim().toLowerCase();
    switch (str) {
        case "true":
        case "1":
        case "on":
        case "yes":
            return true;
        case "false":
        case "0":
        case "off":
        case "no":
            return false;
    }
    return null;
}

function validateSearchType(searchType: string): boolean {
    if (
        searchType === "tag" ||
        searchType === "text" ||
        searchType === "frontmatter" ||
        searchType === "wiki"
    ) {
        return true;
    }
    return false;
}

function getBoolArrayFromInput(
    name: string,
    input: any,
    numDataset: number,
    defaultValue: boolean,
    allowNoValidValue: boolean
): Array<boolean> | string {
    let array: Array<boolean> = [];
    let errorMessage = "";
    let numValidValue = 0;

    while (numDataset > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            if (input.length === 0) {
                errorMessage = "Empty array not allowd for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < input.length) {
                    let curr = input[ind];
                    let prev = null;
                    if (ind > 0) {
                        prev = input[ind - 1].trim();
                    }
                    if (typeof curr === "string") {
                        curr = curr.trim();
                        if (curr === "") {
                            if (prev !== null) {
                                array[ind] = prev;
                            } else {
                                array[ind] = defaultValue;
                            }
                        } else {
                            errorMessage = "Invalid inputs for " + name;
                            break;
                        }
                    } else if (typeof curr === "boolean") {
                        array[ind] = curr;
                        numValidValue++;
                    } else {
                        errorMessage = "Invalid inputs for " + name;
                        break;
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = input[input.length - 1];
                    if (numValidValue > 0) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        }
    } else if (typeof input === "string") {
        let splitted = input.split(",");
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < splitted.length) {
                    let curr = splitted[ind].trim();
                    let prev = null;
                    if (ind > 0) {
                        prev = strToBool(splitted[ind - 1].trim());
                    }
                    if (curr === "") {
                        if (prev !== null) {
                            array[ind] = prev;
                        } else {
                            array[ind] = defaultValue;
                        }
                    } else {
                        let currBool = strToBool(curr);
                        if (currBool !== null) {
                            array[ind] = currBool;
                            numValidValue++;
                        } else {
                            errorMessage = "Invalid inputs for " + name;
                            break;
                        }
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = strToBool(splitted[splitted.length - 1].trim());
                    if (numValidValue > 0 && last !== null) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        } else {
            if (input === "") {
                // all defaultValue
            } else {
                let inputBool = strToBool(input);
                if (inputBool !== null) {
                    array[0] = inputBool;
                    numValidValue++;
                    for (let ind = 1; ind < array.length; ind++) {
                        array[ind] = inputBool;
                    }
                } else {
                    errorMessage = "Invalid inputs for " + name;
                }
            }
        }
    } else if (typeof input === "boolean") {
        array[0] = input;
        numValidValue++;
        for (let ind = 1; ind < array.length; ind++) {
            array[ind] = input;
        }
    } else {
        errorMessage = "Invalid inputs for " + name;
    }

    if (!allowNoValidValue && numValidValue === 0) {
        errorMessage = "No valid input for " + name;
    }

    if (errorMessage !== "") {
        return errorMessage;
    }

    return array;
}

function getNumberArrayFromInput(
    name: string,
    input: any,
    numDataset: number,
    defaultValue: number,
    allowNoValidValue: boolean
): Array<number> | string {
    let array: Array<number> = [];
    let errorMessage = "";
    let numValidValue = 0;

    while (numDataset > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            if (input.length === 0) {
                errorMessage = "Empty array not allowd for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < input.length) {
                    let curr = input[ind];
                    let prev = null;
                    if (ind > 0) {
                        prev = input[ind - 1].trim();
                    }
                    if (typeof curr === "string") {
                        curr = curr.trim();
                        if (curr === "") {
                            if (prev !== null) {
                                array[ind] = prev;
                            } else {
                                array[ind] = defaultValue;
                            }
                        } else {
                            errorMessage = "Invalid inputs for " + name;
                            break;
                        }
                    } else if (typeof curr === "number") {
                        array[ind] = curr;
                        numValidValue++;
                    } else {
                        errorMessage = "Invalid inputs for " + name;
                        break;
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = input[input.length - 1];
                    if (numValidValue > 0) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        }
    } else if (typeof input === "string") {
        let splitted = input.split(",");
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < splitted.length) {
                    let curr = splitted[ind].trim();
                    let prev = null;
                    if (ind > 0) {
                        prev = parseFloat(splitted[ind - 1].trim());
                    }
                    if (curr === "") {
                        if (prev !== null && Number.isNumber(prev)) {
                            array[ind] = prev;
                        } else {
                            array[ind] = defaultValue;
                        }
                    } else {
                        let currNum = parseFloat(curr);
                        if (Number.isNumber(currNum)) {
                            array[ind] = currNum;
                            numValidValue++;
                        } else {
                            errorMessage = "Invalid inputs for " + name;
                            break;
                        }
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = parseFloat(splitted[input.length - 1].trim());
                    if (numValidValue > 0 && Number.isNumber(last)) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        } else {
            if (input === "") {
                // all defaultValue
            } else {
                let inputNum = parseFloat(input);
                if (Number.isNumber(inputNum)) {
                    array[0] = inputNum;
                    numValidValue++;
                    for (let ind = 1; ind < array.length; ind++) {
                        array[ind] = inputNum;
                    }
                } else {
                    errorMessage = "Invalid inputs for " + name;
                }
            }
        }
    } else if (typeof input === "number") {
        if (Number.isNumber(input)) {
            array[0] = input;
            numValidValue++;
            for (let ind = 1; ind < array.length; ind++) {
                array[ind] = input;
            }
        } else {
            errorMessage = "Invalid inputs for " + name;
        }
    } else {
        errorMessage = "Invalid inputs for " + name;
    }

    if (!allowNoValidValue && numValidValue === 0) {
        errorMessage = "No valid input for " + name;
    }

    if (errorMessage !== "") {
        return errorMessage;
    }

    return array;
}

function getStringArrayFromInput(
    name: string,
    input: any,
    numDataset: number,
    defaultValue: string,
    validator: Function,
    allowNoValidValue: boolean
): Array<string> | string {
    let array: Array<string> = [];
    let errorMessage = "";
    let numValidValue = 0;

    // console.log(input);
    while (numDataset > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            if (input.length === 0) {
                errorMessage = "Empty array not allowd for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < input.length) {
                    let curr = input[ind];
                    let prev = null;
                    if (ind > 0) {
                        prev = input[ind - 1].trim();
                    }
                    if (typeof curr === "string") {
                        curr = curr.trim();
                        if (curr === "") {
                            if (prev !== null) {
                                array[ind] = prev;
                            } else {
                                array[ind] = defaultValue;
                            }
                        } else {
                            if (validator) {
                                if (validator(curr)) {
                                    array[ind] = curr;
                                    numValidValue++;
                                } else {
                                    errorMessage = "Invalid inputs for " + name;
                                    break;
                                }
                            } else {
                                array[ind] = curr;
                                numValidValue++;
                            }
                        }
                    } else {
                        errorMessage = "Invalid inputs for " + name;
                        break;
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = input[input.length - 1].trim();
                    if (numValidValue > 0) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        }
    } else if (typeof input === "string") {
        let splitted = input.split(",");
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many input parameters for " + name;
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < splitted.length) {
                    let curr = splitted[ind].trim();
                    let prev = null;
                    if (ind > 0) {
                        prev = splitted[ind - 1].trim();
                    }
                    if (curr === "") {
                        if (prev !== null) {
                            array[ind] = prev;
                        } else {
                            array[ind] = defaultValue;
                        }
                    } else {
                        if (validator) {
                            if (validator(curr)) {
                                array[ind] = curr;
                                numValidValue++;
                            } else {
                                errorMessage = "Invalid inputs for " + name;
                                break;
                            }
                        } else {
                            array[ind] = curr;
                            numValidValue++;
                        }
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = splitted[splitted.length - 1].trim();
                    if (numValidValue > 0) {
                        array[ind] = last;
                    } else {
                        array[ind] = defaultValue;
                    }
                }
            }
        } else {
            if (input === "") {
                // all defaultValue
            } else {
                if (validator) {
                    if (validator(input)) {
                        array[0] = input;
                        numValidValue++;
                        for (let ind = 1; ind < array.length; ind++) {
                            array[ind] = input;
                        }
                    } else {
                        errorMessage = "Invalid inputs for " + name;
                    }
                } else {
                    array[0] = input;
                    numValidValue++;
                    for (let ind = 1; ind < array.length; ind++) {
                        array[ind] = input;
                    }
                }
            }
        }
    } else {
        errorMessage = "Invalid inputs for " + name;
    }

    if (!allowNoValidValue && numValidValue === 0) {
        errorMessage = "No valid input for " + name;
    }

    if (errorMessage !== "") {
        return errorMessage;
    }

    return array;
}

export function getRenderInfoFromYaml(
    yamlText: string,
    plugin: Tracker
): RenderInfo | string {
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

    let errorMessage = "";

    // Search target
    let searchTarget: Array<string> = [];
    if (typeof yaml.searchTarget === "object") {
        if (Array.isArray(yaml.searchTarget)) {
            for (let target of yaml.searchTarget) {
                if (typeof target === "string") {
                    if (target !== "") {
                        searchTarget.push(target);
                    } else {
                        errorMessage = "Empty search target is not allowed.";
                        break;
                    }
                }
            }
        }
    } else if (typeof yaml.searchTarget === "string") {
        let splitted = yaml.searchTarget.split(",");
        if (splitted.length > 1) {
            for (let piece of splitted) {
                piece = piece.trim();
                if (piece !== "") {
                    searchTarget.push(piece);
                } else {
                    errorMessage = "Empty search target is not allowed.";
                    break;
                }
            }
        } else if (yaml.searchTarget === "") {
            errorMessage = "Empty search target is not allowed.";
        } else {
            searchTarget.push(yaml.searchTarget);
        }
    } else {
        errorMessage = "Invalid search target (searchTarget)";
    }
    // console.log(searchTarget);

    if (errorMessage !== "") {
        return errorMessage;
    }

    let numDatasets = searchTarget.length;

    // Search type
    let searchType: Array<string> = [];
    let retSearchType = getStringArrayFromInput(
        "search type",
        yaml.searchType,
        numDatasets,
        "",
        validateSearchType,
        false
    );
    if (typeof retSearchType === "string") {
        return retSearchType; // errorMessage
    }
    searchType = retSearchType;
    // console.log(searchType);

    // Create queries
    let queries: Array<Query> = [];
    for (let ind = 0; ind < searchTarget.length; ind++) {
        let query = new Query(
            queries.length,
            searchType[ind],
            searchTarget[ind]
        );
        queries.push(query);
    }
    // console.log(queries);

    // Create grarph info
    let renderInfo = new RenderInfo(queries);

    // Get daily notes settings using obsidian-daily-notes-interface
    let dailyNotesSettings = getDailyNoteSettings();

    // Root folder to search
    if (typeof yaml.folder === "string") {
        if (yaml.folder === "") {
            renderInfo.folder = plugin.settings.folder;
        } else {
            renderInfo.folder = yaml.folder;
        }
    } else {
        renderInfo.folder = plugin.settings.folder;
    }
    // console.log("renderInfo folder: " + renderInfo.folder);

    let abstractFolder = plugin.app.vault.getAbstractFileByPath(
        normalizePath(renderInfo.folder)
    );
    if (!abstractFolder || !(abstractFolder instanceof TFolder)) {
        let errorMessage = "Folder '" + renderInfo.folder + "' doesn't exist";
        return errorMessage;
    }

    // Date format
    const dateFormat = yaml.dateFormat;
    //?? not sure why I need this to make it works,
    // without that, the assigned the renderInfo.dateFormat will become undefined
    if (typeof yaml.dateFormat === "string") {
        if (yaml.dateFormat === "") {
            renderInfo.dateFormat = plugin.settings.dateFormat;
        } else {
            renderInfo.dateFormat = dateFormat;
        }
    } else {
        renderInfo.dateFormat = plugin.settings.dateFormat;
    }
    // console.log("renderInfo dateFormat: " + renderInfo.dateFormat);

    // Date format prefix
    if (typeof yaml.dateFormatPrefix === "string") {
        renderInfo.dateFormatPrefix = yaml.dateFormatPrefix;
    }

    // Date fromat suffix
    if (typeof yaml.dateFormatSuffix === "string") {
        renderInfo.dateFormatSuffix = yaml.dateFormatSuffix;
    }

    // startDate, endDate
    if (typeof yaml.startDate === "string") {
        let strStartDate = yaml.startDate;
        if (
            renderInfo.dateFormatPrefix &&
            strStartDate.startsWith(renderInfo.dateFormatPrefix)
        ) {
            strStartDate = strStartDate.slice(
                renderInfo.dateFormatPrefix.length
            );
        }
        if (
            renderInfo.dateFormatSuffix &&
            strStartDate.endsWith(renderInfo.dateFormatSuffix)
        ) {
            strStartDate = strStartDate.slice(
                0,
                strStartDate.length - renderInfo.dateFormatSuffix.length
            );
        }
        let startDate = window.moment(
            strStartDate,
            renderInfo.dateFormat,
            true
        );
        if (startDate.isValid()) {
            renderInfo.startDate = startDate;
        } else {
            let errorMessage =
                "Invalid startDate, the format of startDate may not fit your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
    }
    if (typeof yaml.endDate === "string") {
        let strEndDate = yaml.endDate;
        if (
            renderInfo.dateFormatPrefix &&
            strEndDate.startsWith(renderInfo.dateFormatPrefix)
        ) {
            strEndDate = strEndDate.slice(renderInfo.dateFormatPrefix.length);
        }
        if (
            renderInfo.dateFormatSuffix &&
            strEndDate.endsWith(renderInfo.dateFormatSuffix)
        ) {
            strEndDate = strEndDate.slice(
                0,
                strEndDate.length - renderInfo.dateFormatSuffix.length
            );
        }
        let endDate = window.moment(strEndDate, renderInfo.dateFormat, true);
        if (endDate.isValid()) {
            renderInfo.endDate = endDate;
        } else {
            let errorMessage =
                "Invalid endDate, the format of endDate may not fit your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
    }
    if (
        renderInfo.startDate !== null &&
        renderInfo.startDate.isValid() &&
        renderInfo.endDate !== null &&
        renderInfo.endDate.isValid()
    ) {
        // Make sure endDate > startDate
        if (renderInfo.endDate < renderInfo.startDate) {
            let errorMessage =
                "Invalid date range (startDate larger than endDate)";
            return errorMessage;
        }
    }
    // console.log(renderInfo.startDate);
    // console.log(renderInfo.endDate);

    // Dataset name
    let retDatasetName = getStringArrayFromInput(
        "datasetName",
        yaml.datasetName,
        numDatasets,
        "untitled",
        null,
        true
    );
    if (typeof retDatasetName === "string") {
        return retDatasetName; // errorMessage
    }
    // rename untitled
    let indUntitled = 0;
    for (let ind = 0; ind < retDatasetName.length; ind++) {
        if (retDatasetName[ind] === "untitled") {
            retDatasetName[ind] = "untitled" + indUntitled.toString();
            indUntitled++;
        }
    }
    // Check duplicated names
    if (new Set(retDatasetName).size === retDatasetName.length) {
        renderInfo.datasetName = retDatasetName;
    } else {
        let errorMessage = "Not enough dataset names or duplicated names";
        return errorMessage;
    }
    // console.log(renderInfo.datasetName);

    // constValue
    let retConstValue = getNumberArrayFromInput(
        "constValue",
        yaml.constValue,
        numDatasets,
        1.0,
        true
    );
    if (typeof retConstValue === "string") {
        return retConstValue; // errorMessage
    }
    renderInfo.constValue = retConstValue;
    // console.log(renderInfo.constValue);

    // ignoreAttachedValue
    let retIgnoreAttachedValue = getBoolArrayFromInput(
        "ignoreAttachedValue",
        yaml.ignoreAttachedValue,
        numDatasets,
        false,
        true
    );
    if (typeof retIgnoreAttachedValue === "string") {
        return retIgnoreAttachedValue;
    }
    renderInfo.ignoreAttachedValue = retIgnoreAttachedValue;
    // console.log(renderInfo.ignoreAttachedValue);

    // ignoreZeroValue
    let retIgnoreZeroValue = getBoolArrayFromInput(
        "ignoreZeroValue",
        yaml.ignoreZeroValue,
        numDatasets,
        false,
        true
    );
    if (typeof retIgnoreZeroValue === "string") {
        return retIgnoreZeroValue;
    }
    renderInfo.ignoreZeroValue = retIgnoreZeroValue;
    // console.log(renderInfo.ignoreAttachedValue);

    // accum
    let retAccum = getBoolArrayFromInput(
        "accum",
        yaml.accum,
        numDatasets,
        false,
        true
    );
    if (typeof retAccum === "string") {
        return retAccum;
    }
    renderInfo.accum = retAccum;
    // console.log(renderInfo.accum);

    // penalty
    let retPenalty = getNumberArrayFromInput(
        "penalty",
        yaml.penalty,
        numDatasets,
        null,
        true
    );
    if (typeof retPenalty === "string") {
        return retPenalty;
    }
    renderInfo.penalty = retPenalty;
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

        // xAxisColor
        if (typeof yaml.line.xAxisColor === "string") {
            renderInfo.line.xAxisColor = yaml.line.xAxisColor;
        }

        // xAxisLabelColor
        if (typeof yaml.line.xAxisLabelColor === "string") {
            renderInfo.line.xAxisLabelColor = yaml.line.xAxisLabelColor;
        }

        // yAxisLabel
        let retYAxisLabel = getStringArrayFromInput(
            "yAxisLabel",
            yaml.line.yAxisLabel,
            2,
            "Value",
            null,
            true
        );
        if (typeof retYAxisLabel === "string") {
            return retYAxisLabel; // errorMessage
        }
        if (retYAxisLabel.length > 2) {
            return "yAxisLabel accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yAxisLabel = retYAxisLabel;
        // console.log(renderInfo.line.yAxisLabel);

        // yAxisColor
        let retYAxisColor = getStringArrayFromInput(
            "yAxisColor",
            yaml.line.yAxisColor,
            2,
            "",
            null,
            true
        );
        if (typeof retYAxisColor === "string") {
            return retYAxisColor; // errorMessage
        }
        if (retYAxisColor.length > 2) {
            return "yAxisColor accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yAxisColor = retYAxisColor;
        // console.log(renderInfo.line.yAxisColor);

        // yAxisLabelColor
        let retYAxisLabelColor = getStringArrayFromInput(
            "yAxisLabelColor",
            yaml.line.yAxisLabelColor,
            2,
            "",
            null,
            true
        );
        if (typeof retYAxisLabelColor === "string") {
            return retYAxisLabelColor; // errorMessage
        }
        if (retYAxisLabelColor.length > 2) {
            return "yAxisLabelColor accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yAxisLabelColor = retYAxisLabelColor;
        // console.log(renderInfo.line.yAxisLabelColor);

        // yAxisUnit
        let retYAxisUnit = getStringArrayFromInput(
            "yAxisUnit",
            yaml.line.yAxisUnit,
            2,
            "",
            null,
            true
        );
        if (typeof retYAxisUnit === "string") {
            return retYAxisUnit; // errorMessage
        }
        if (retYAxisUnit.length > 2) {
            return "yAxisUnit accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yAxisUnit = retYAxisUnit;
        // console.log(renderInfo.line.yAxisUnit);

        // yAxisLocation
        let retYAxisLocation = getStringArrayFromInput(
            "yAxisLocation",
            yaml.line.yAxisLocation,
            numDatasets,
            "left",
            null,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        renderInfo.line.yAxisLocation = retYAxisLocation;
        // console.log(renderInfo.line.yAxisLocation);

        // yMin
        let retYMin = getNumberArrayFromInput(
            "yMin",
            yaml.line.yMin,
            2,
            null,
            true
        );
        if (typeof retYMin === "string") {
            return retYMin; // errorMessage
        }
        if (retYMin.length > 2) {
            return "yMin accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yMin = retYMin;
        // console.log(renderInfo.line.yMin);

        // yMax
        let retYMax = getNumberArrayFromInput(
            "yMax",
            yaml.line.yMax,
            2,
            null,
            true
        );
        if (typeof retYMax === "string") {
            return retYMax; // errorMessage
        }
        if (retYMax.length > 2) {
            return "yMax accepts not more than two values for left and right y-axes";
        }
        renderInfo.line.yMax = retYMax;
        // console.log(renderInfo.line.yMax);

        // lineColor
        let retLineColor = getStringArrayFromInput(
            "lineColor",
            yaml.line.lineColor,
            numDatasets,
            "",
            null,
            true
        );
        if (typeof retLineColor === "string") {
            return retLineColor; // errorMessage
        }
        renderInfo.line.lineColor = retLineColor;
        // console.log(renderInfo.line.lineColor);

        // lineWidth
        let retLineWidth = getNumberArrayFromInput(
            "lineWidth",
            yaml.line.lineWidth,
            numDatasets,
            1.5,
            true
        );
        if (typeof retLineWidth === "string") {
            return retLineWidth; // errorMessage
        }
        renderInfo.line.lineWidth = retLineWidth;
        // console.log(renderInfo.line.lineWidth);

        // showLine
        let retShowLine = getBoolArrayFromInput(
            "showLine",
            yaml.line.showLine,
            numDatasets,
            true,
            true
        );
        if (typeof retShowLine === "string") {
            return retShowLine;
        }
        renderInfo.line.showLine = retShowLine;
        // console.log(renderInfo.line.showLine);

        // showPoint
        let retShowPoint = getBoolArrayFromInput(
            "showPoint",
            yaml.line.showPoint,
            numDatasets,
            true,
            true
        );
        if (typeof retShowPoint === "string") {
            return retShowPoint;
        }
        renderInfo.line.showPoint = retShowPoint;
        // console.log(renderInfo.line.showPoint);

        // pointColor
        let retPointColor = getStringArrayFromInput(
            "pointColor",
            yaml.line.pointColor,
            numDatasets,
            "#69b3a2",
            null,
            true
        );
        if (typeof retPointColor === "string") {
            return retPointColor;
        }
        renderInfo.line.pointColor = retPointColor;
        // console.log(renderInfo.line.pointColor);

        // pointBorderColor
        let retPointBorderColor = getStringArrayFromInput(
            "pointBorderColor",
            yaml.line.pointBorderColor,
            numDatasets,
            "#69b3a2",
            null,
            true
        );
        if (typeof retPointBorderColor === "string") {
            return retPointBorderColor;
        }
        renderInfo.line.pointBorderColor = retPointBorderColor;
        // console.log(renderInfo.line.pointBorderColor);

        // pointBorderWidth
        let retPointBorderWidth = getNumberArrayFromInput(
            "pointBorderWidth",
            yaml.line.pointBorderWidth,
            numDatasets,
            0.0,
            true
        );
        if (typeof retPointBorderWidth === "string") {
            return retPointBorderWidth; // errorMessage
        }
        renderInfo.line.pointBorderWidth = retPointBorderWidth;
        // console.log(renderInfo.line.pointBorderWidth);

        // pointSize
        let retPointSize = getNumberArrayFromInput(
            "pointSize",
            yaml.line.pointSize,
            numDatasets,
            3.0,
            true
        );
        if (typeof retPointSize === "string") {
            return retPointSize; // errorMessage
        }
        renderInfo.line.pointSize = retPointSize;
        // console.log(renderInfo.line.pointSize);

        // allowInspectData
        if (typeof yaml.line.allowInspectData === "boolean") {
            renderInfo.line.allowInspectData = yaml.line.allowInspectData;
        }

        // showLegend
        if (typeof yaml.line.showLegend === "boolean") {
            renderInfo.line.showLegend = yaml.line.showLegend;
        }

        // legendPosition
        if (typeof yaml.line.legendPosition === "string") {
            renderInfo.line.legendPosition = yaml.line.legendPosition;
        } else {
            renderInfo.line.legendPosition = "bottom";
        }

        // legendOrient
        if (typeof yaml.line.legendOrientation === "string") {
            renderInfo.line.legendOrientation = yaml.line.legendOrientation;
        } else {
            if (
                renderInfo.line.legendPosition === "top" ||
                renderInfo.line.legendPosition === "bottom"
            ) {
                renderInfo.line.legendOrientation = "horizontal";
            } else if (
                renderInfo.line.legendPosition === "left" ||
                renderInfo.line.legendPosition === "right"
            ) {
                renderInfo.line.legendOrientation = "vertical";
            } else {
                renderInfo.line.legendOrientation = "horizontal";
            }
        }
        // console.log(renderInfo.line.legendPosition);
        // console.log(renderInfo.line.legendOrientation);

        // legendBgColor
        if (typeof yaml.line.legendBgColor === "string") {
            renderInfo.line.legendBgColor = yaml.line.legendBgColor;
        }

        // legendBorderColor
        if (typeof yaml.line.legendBorderColor === "string") {
            renderInfo.line.legendBorderColor = yaml.line.legendBorderColor;
        }

        // fillGap
        let retFillGap = getBoolArrayFromInput(
            "fillGap",
            yaml.line.fillGap,
            numDatasets,
            false,
            true
        );
        if (typeof retFillGap === "string") {
            return retFillGap;
        }
        renderInfo.line.fillGap = retFillGap;
        // console.log(renderInfo.line.fillGap);
    } // line related parameters
    if (typeof yaml.bar !== "undefined") {
        renderInfo.bar = new BarInfo();

        // title
        if (typeof yaml.bar.title === "string") {
            renderInfo.bar.title = yaml.bar.title;
        }

        // xAxisLabel
        if (typeof yaml.bar.xAxisLabel === "string") {
            renderInfo.bar.xAxisLabel = yaml.bar.xAxisLabel;
        }

        // xAxisColor
        if (typeof yaml.bar.xAxisColor === "string") {
            renderInfo.bar.xAxisColor = yaml.bar.xAxisColor;
        }

        // xAxisLabelColor
        if (typeof yaml.bar.xAxisLabelColor === "string") {
            renderInfo.bar.xAxisLabelColor = yaml.bar.xAxisLabelColor;
        }

        // yAxisLabel
        let retYAxisLabel = getStringArrayFromInput(
            "yAxisLabel",
            yaml.bar.yAxisLabel,
            2,
            "Value",
            null,
            true
        );
        if (typeof retYAxisLabel === "string") {
            return retYAxisLabel; // errorMessage
        }
        if (retYAxisLabel.length > 2) {
            return "yAxisLabel accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yAxisLabel = retYAxisLabel;
        // console.log(renderInfo.bar.yAxisLabel);

        // yAxisColor
        let retYAxisColor = getStringArrayFromInput(
            "yAxisColor",
            yaml.bar.yAxisColor,
            2,
            "Value",
            null,
            true
        );
        if (typeof retYAxisColor === "string") {
            return retYAxisColor; // errorMessage
        }
        if (retYAxisColor.length > 2) {
            return "yAxisColor accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yAxisColor = retYAxisColor;
        // console.log(renderInfo.bar.yAxisColor);

        // yAxisLabelColor
        let retYAxisLabelColor = getStringArrayFromInput(
            "yAxisLabelColor",
            yaml.bar.yAxisLabelColor,
            2,
            "Value",
            null,
            true
        );
        if (typeof retYAxisLabelColor === "string") {
            return retYAxisLabelColor; // errorMessage
        }
        if (retYAxisLabelColor.length > 2) {
            return "yAxisLabelColor accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yAxisLabelColor = retYAxisLabelColor;
        // console.log(renderInfo.bar.yAxisLabel);

        // yAxisUnit
        let retYAxisUnit = getStringArrayFromInput(
            "yAxisUnit",
            yaml.bar.yAxisUnit,
            2,
            "",
            null,
            true
        );
        if (typeof retYAxisUnit === "string") {
            return retYAxisUnit; // errorMessage
        }
        if (retYAxisUnit.length > 2) {
            return "yAxisUnit accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yAxisUnit = retYAxisUnit;
        // console.log(renderInfo.bar.yAxisUnit);

        // yAxisLocation
        let retYAxisLocation = getStringArrayFromInput(
            "yAxisLocation",
            yaml.bar.yAxisLocation,
            numDatasets,
            "left",
            null,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        renderInfo.bar.yAxisLocation = retYAxisLocation;
        // console.log(renderInfo.bar.yAxisLocation);

        // yMin
        let retYMin = getNumberArrayFromInput(
            "yMin",
            yaml.bar.yMin,
            2,
            null,
            true
        );
        if (typeof retYMin === "string") {
            return retYMin; // errorMessage
        }
        if (retYMin.length > 2) {
            return "yMin accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yMin = retYMin;
        // console.log(renderInfo.bar.yMin);

        // yMax
        let retYMax = getNumberArrayFromInput(
            "yMax",
            yaml.bar.yMax,
            2,
            null,
            true
        );
        if (typeof retYMax === "string") {
            return retYMax; // errorMessage
        }
        if (retYMax.length > 2) {
            return "yMax accepts not more than two values for left and right y-axes";
        }
        renderInfo.bar.yMax = retYMax;
        // console.log(renderInfo.bar.yMax);

        // barColor
        let retBarColor = getStringArrayFromInput(
            "barColor",
            yaml.bar.barColor,
            numDatasets,
            "",
            null,
            true
        );
        if (typeof retBarColor === "string") {
            return retBarColor; // errorMessage
        }
        renderInfo.bar.barColor = retBarColor;
        // console.log(renderInfo.bar.barColor);

        // allowInspectData
        if (typeof yaml.bar.allowInspectData === "boolean") {
            renderInfo.bar.allowInspectData = yaml.bar.allowInspectData;
        }
        // console.log(renderInfo.bar.allowInspectData);

        // showLegend
        if (typeof yaml.bar.showLegend === "boolean") {
            renderInfo.bar.showLegend = yaml.bar.showLegend;
        }

        // legendPosition
        if (typeof yaml.bar.legendPosition === "string") {
            renderInfo.bar.legendPosition = yaml.bar.legendPosition;
        } else {
            renderInfo.bar.legendPosition = "bottom";
        }

        // legendOrient
        if (typeof yaml.bar.legendOrientation === "string") {
            renderInfo.bar.legendOrientation = yaml.bar.legendOrientation;
        } else {
            if (
                renderInfo.bar.legendPosition === "top" ||
                renderInfo.bar.legendPosition === "bottom"
            ) {
                renderInfo.bar.legendOrientation = "horizontal";
            } else if (
                renderInfo.bar.legendPosition === "left" ||
                renderInfo.bar.legendPosition === "right"
            ) {
                renderInfo.bar.legendOrientation = "vertical";
            } else {
                renderInfo.bar.legendOrientation = "horizontal";
            }
        }

        // legendBgColor
        if (typeof yaml.bar.legendBgColor === "string") {
            renderInfo.bar.legendBgColor = yaml.bar.legendBgColor;
        }

        // legendBorderColor
        if (typeof yaml.bar.legendBorderColor === "string") {
            renderInfo.bar.legendBorderColor = yaml.bar.legendBorderColor;
        }
    } // bar related parameters
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
