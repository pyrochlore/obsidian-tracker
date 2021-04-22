import Tracker from "./main";
import { Query, RenderInfo, SummaryInfo } from "./data";
import { TFolder, normalizePath } from "obsidian";
import * as Yaml from "yaml";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";
import { drag } from "d3-drag";

let separator = new RegExp("[,/]", "gm");

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
    numDataSet: number,
    defaultValue: boolean,
    allowNoValidValue: boolean
): Array<boolean> | string {
    let array: Array<boolean> = [];
    let errorMessage = "";
    let numValidValue = 0;

    while (numDataSet > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataSet) {
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
        if (separator.test(input)) {
            let splitted = input.split(separator);
            if (splitted.length > numDataSet) {
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
    numDataSet: number,
    defaultValue: number,
    allowNoValidValue: boolean
): Array<number> | string {
    let array: Array<number> = [];
    let errorMessage = "";
    let numValidValue = 0;

    while (numDataSet > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataSet) {
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
        if (separator.test(input)) {
            let splitted = input.split(separator);
            if (splitted.length > numDataSet) {
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
    numDataSet: number,
    defaultValue: string,
    validator: Function,
    allowNoValidValue: boolean
): Array<string> | string {
    let array: Array<string> = [];
    let errorMessage = "";
    let numValidValue = 0;

    // console.log(input);
    while (numDataSet > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined") {
        // all defaultValue
    } else if (typeof input === "object") {
        if (Array.isArray(input)) {
            if (input.length > numDataSet) {
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
        if (separator.test(input)) {
            let splitted = input.split(separator);
            if (splitted.length > numDataSet) {
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
        if (separator.test(yaml.searchTarget)) {
            let splitted = yaml.searchTarget.split(separator);
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

    let numDataSets = searchTarget.length;

    // Search type
    let searchType: Array<string> = [];
    let retSearchType = getStringArrayFromInput(
        "search type",
        yaml.searchType,
        numDataSets,
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
        let query = new Query(searchType[ind], searchTarget[ind]);
        query.id = queries.length;
        queries.push(query);
    }
    // console.log(queries);

    // Create grarph info
    let renderInfo = new RenderInfo(queries);

    // Get daily notes settings using obsidian-daily-notes-interface
    let dailyNotesSettings = getDailyNoteSettings();

    // Root folder to search
    if (typeof yaml.folder !== "string") {
        if (
            typeof dailyNotesSettings.folder === "undefined" ||
            dailyNotesSettings.folder === null
        ) {
            plugin.folder = "/";
        } else {
            plugin.folder = dailyNotesSettings.folder;
        }
    } else {
        if (yaml.folder === "") {
            plugin.folder = "/";
        } else {
            plugin.folder = yaml.folder;
        }
    }
    let abstractFolder = plugin.app.vault.getAbstractFileByPath(
        normalizePath(plugin.folder)
    );
    if (!abstractFolder || !(abstractFolder instanceof TFolder)) {
        let errorMessage = "Folder '" + plugin.folder + "' doesn't exist";
        return errorMessage;
    }
    renderInfo.folder = plugin.folder;
    // console.log(renderInfo.folder);

    // Date format
    if (typeof yaml.dateFormat !== "string") {
        if (
            typeof dailyNotesSettings.format === "undefined" ||
            dailyNotesSettings.format === null
        ) {
            plugin.dateFormat = "YYYY-MM-DD";
        } else {
            plugin.dateFormat = dailyNotesSettings.format;
        }
    } else {
        if (yaml.dateFormat === "") {
            plugin.dateFormat = "YYYY-MM-DD";
        } else {
            plugin.dateFormat = yaml.dateForamt;
        }
    }

    // startDate, endDate
    if (typeof yaml.startDate === "string") {
        renderInfo.startDate = window.moment(yaml.startDate, plugin.dateFormat);
    }
    if (typeof yaml.endDate === "string") {
        renderInfo.endDate = window.moment(yaml.endDate, plugin.dateFormat);
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
    let retConstValue = getNumberArrayFromInput(
        "constValue",
        yaml.constValue,
        numDataSets,
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
        numDataSets,
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
        numDataSets,
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
        numDataSets,
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
        numDataSets,
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
        // yAxisLabel, left label and right label
        if (typeof yaml.line.yAxisLabel === "string") {
            renderInfo.line.yAxisLabel = yaml.line.yAxisLabel;
        }

        // labelColor
        if (typeof yaml.line.labelColor === "string") {
            renderInfo.line.labelColor = yaml.line.labelColor;
        }

        // yAxisUnit, left axis unit, right axis unit
        if (typeof yaml.line.yAxisUnit === "string") {
            renderInfo.line.yAxisUnit = yaml.line.yAxisUnit;
        }

        // yAxisLocation
        if (typeof yaml.line.yAxisLocation === "string") {
            if (
                yaml.line.yAxisLocation === "left" ||
                yaml.line.yAxisLocation === "right"
            ) {
                renderInfo.line.yAxisLocation = yaml.line.yAxisLocation;
            }
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
        let retLineColor = getStringArrayFromInput(
            "lineColor",
            yaml.line.lineColor,
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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
            numDataSets,
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

        // fillGap
        let retFillGap = getBoolArrayFromInput(
            "fillGap",
            yaml.line.fillGap,
            numDataSets,
            false,
            true
        );
        if (typeof retFillGap === "string") {
            return retFillGap;
        }
        renderInfo.line.fillGap = retFillGap;
        // console.log(renderInfo.line.fillGap);
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
