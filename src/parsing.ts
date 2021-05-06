import Tracker from "./main";
import {
    BarInfo,
    CommonChartInfo,
    Query,
    RenderInfo,
    SummaryInfo,
} from "./data";
import { TFolder, normalizePath } from "obsidian";
import * as Yaml from "yaml";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

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

function parseCommonChartInfo(yaml: any, renderInfo: CommonChartInfo) {
    // fixedScale
    if (typeof yaml.fixedScale === "number") {
        renderInfo.fixedScale = yaml.fixedScale;
    }

    // fitPanelWidth
    if (typeof yaml.fitPanelWidth === "boolean") {
        renderInfo.fitPanelWidth = yaml.fitPanelWidth;
    }

    // title
    if (typeof yaml.title === "string") {
        renderInfo.title = yaml.title;
    }

    // xAxisLabel
    if (typeof yaml.xAxisLabel === "string") {
        renderInfo.xAxisLabel = yaml.xAxisLabel;
    }

    // xAxisColor
    if (typeof yaml.xAxisColor === "string") {
        renderInfo.xAxisColor = yaml.xAxisColor;
    }

    // xAxisLabelColor
    if (typeof yaml.xAxisLabelColor === "string") {
        renderInfo.xAxisLabelColor = yaml.xAxisLabelColor;
    }

    // yAxisLabel
    let retYAxisLabel = getStringArrayFromInput(
        "yAxisLabel",
        yaml.yAxisLabel,
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
    renderInfo.yAxisLabel = retYAxisLabel;
    // console.log(renderInfo.yAxisLabel);

    // yAxisColor
    let retYAxisColor = getStringArrayFromInput(
        "yAxisColor",
        yaml.yAxisColor,
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
    renderInfo.yAxisColor = retYAxisColor;
    // console.log(renderInfo.yAxisColor);

    // yAxisLabelColor
    let retYAxisLabelColor = getStringArrayFromInput(
        "yAxisLabelColor",
        yaml.yAxisLabelColor,
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
    renderInfo.yAxisLabelColor = retYAxisLabelColor;
    // console.log(renderInfo.yAxisLabelColor);

    // yAxisUnit
    let retYAxisUnit = getStringArrayFromInput(
        "yAxisUnit",
        yaml.yAxisUnit,
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
    renderInfo.yAxisUnit = retYAxisUnit;
    // console.log(renderInfo.yAxisUnit);

    // yMin
    let retYMin = getNumberArrayFromInput("yMin", yaml.yMin, 2, null, true);
    if (typeof retYMin === "string") {
        return retYMin; // errorMessage
    }
    if (retYMin.length > 2) {
        return "yMin accepts not more than two values for left and right y-axes";
    }
    renderInfo.yMin = retYMin;
    // console.log(renderInfo.yMin);

    // yMax
    let retYMax = getNumberArrayFromInput("yMax", yaml.yMax, 2, null, true);
    if (typeof retYMax === "string") {
        return retYMax; // errorMessage
    }
    if (retYMax.length > 2) {
        return "yMax accepts not more than two values for left and right y-axes";
    }
    renderInfo.yMax = retYMax;
    // console.log(renderInfo.yMax);

    // allowInspectData
    if (typeof yaml.allowInspectData === "boolean") {
        renderInfo.allowInspectData = yaml.allowInspectData;
    }

    // showLegend
    if (typeof yaml.showLegend === "boolean") {
        renderInfo.showLegend = yaml.showLegend;
    }

    // legendPosition
    if (typeof yaml.legendPosition === "string") {
        renderInfo.legendPosition = yaml.legendPosition;
    } else {
        renderInfo.legendPosition = "bottom";
    }

    // legendOrient
    if (typeof yaml.legendOrientation === "string") {
        renderInfo.legendOrientation = yaml.legendOrientation;
    } else {
        if (
            renderInfo.legendPosition === "top" ||
            renderInfo.legendPosition === "bottom"
        ) {
            renderInfo.legendOrientation = "horizontal";
        } else if (
            renderInfo.legendPosition === "left" ||
            renderInfo.legendPosition === "right"
        ) {
            renderInfo.legendOrientation = "vertical";
        } else {
            renderInfo.legendOrientation = "horizontal";
        }
    }
    // console.log(renderInfo.legendPosition);
    // console.log(renderInfo.legendOrientation);

    // legendBgColor
    if (typeof yaml.legendBgColor === "string") {
        renderInfo.legendBgColor = yaml.legendBgColor;
    }

    // legendBorderColor
    if (typeof yaml.legendBorderColor === "string") {
        renderInfo.legendBorderColor = yaml.legendBorderColor;
    }
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
        parseCommonChartInfo(yaml.line, renderInfo.line);

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
    } // line related parameters
    if (typeof yaml.bar !== "undefined") {
        renderInfo.bar = new BarInfo();

        parseCommonChartInfo(yaml.bar, renderInfo.bar);

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
