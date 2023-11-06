import Tracker from "./main";
import {
    SearchType,
    BarInfo,
    CommonChartInfo,
    Query,
    RenderInfo,
    SummaryInfo,
    Margin,
    GraphType,
    LineInfo,
    PieInfo,
    MonthInfo,
    HeatmapInfo,
    BulletInfo,
    Dataset,
    CustomDatasetInfo,
    AspectRatio,
} from "./data";
import { TFolder, normalizePath } from "obsidian";
import { parseYaml } from "obsidian";
import * as helper from "./helper";

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
        searchType.toLowerCase() === "tag" ||
        searchType.toLowerCase() === "text" ||
        searchType.toLowerCase() === "frontmatter" ||
        searchType.toLowerCase() === "wiki" ||
        searchType.toLowerCase() === "wiki.link" ||
        searchType.toLowerCase() === "wiki.display" ||
        searchType.toLowerCase() === "dvfield" ||
        searchType.toLowerCase() === "table" ||
        searchType.toLowerCase() === "filemeta" ||
        searchType.toLowerCase() === "task" ||
        searchType.toLowerCase() === "task.all" ||
        searchType.toLowerCase() === "task.done" ||
        searchType.toLowerCase() === "task.notdone"
    ) {
        return true;
    }
    return false;
}

function validateYAxisLocation(location: string): boolean {
    if (location === "left" || location === "right" || location === "none") {
        return true;
    }
    return false;
}

function validateColor(color: string): boolean {
    return true;
}

function splitInputByComma(input: string) {
    // Split string by ',' but not by '\,'
    // let splitted = input.split(/(?<!\\),/); // -->lookbehind not support in Safari for now
    const dummy = "::::::tracker::::::";
    let temp = input.split("\\,").join(dummy);
    let splitted = temp.split(",");
    for (let ind = 0; ind < splitted.length; ind++) {
        splitted[ind] = splitted[ind].split(dummy).join(",");
    }
    return splitted;
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

    if (typeof input === "undefined" || input === null) {
        // all defaultValue
    } else if (typeof input === "object" && input !== null) {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
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
        let splitted = splitInputByComma(input);
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
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
    // console.log("getNumberArrayFromInput");

    let array: Array<number> = [];
    let errorMessage = "";
    let numValidValue = 0;

    while (numDataset > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined" || input === null) {
        // all defaultValue
    } else if (typeof input === "object" && input !== null) {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
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
        let splitted = splitInputByComma(input);
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
                return errorMessage;
            }
            for (let ind = 0; ind < array.length; ind++) {
                if (ind < splitted.length) {
                    let curr = splitted[ind].trim();
                    let prev = null;
                    if (ind > 0) {
                        prev = helper.parseFloatFromAny(
                            splitted[ind - 1].trim()
                        ).value;
                    }
                    if (curr === "") {
                        if (prev !== null && Number.isNumber(prev)) {
                            array[ind] = prev;
                        } else {
                            array[ind] = defaultValue;
                        }
                    } else {
                        let currNum = helper.parseFloatFromAny(curr).value;
                        if (currNum !== null) {
                            array[ind] = currNum;
                            numValidValue++;
                        } else {
                            errorMessage = "Invalid inputs for " + name;
                            break;
                        }
                    }
                } else {
                    // Exceeds the length of input, use prev value
                    let last = helper.parseFloatFromAny(
                        splitted[input.length - 1].trim()
                    ).value;
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
                let inputNum = helper.parseFloatFromAny(input).value;
                if (inputNum !== null) {
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

function getStringFromInput(input: any, defaultValue: string): string {
    if (typeof input === "string") {
        return helper.replaceImgTagByAlt(input);
    } else if (typeof input === "number") {
        return input.toString();
    }
    return defaultValue;
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

    while (numDataset > array.length) {
        array.push(defaultValue);
    }

    if (typeof input === "undefined" || input === null) {
        // all defaultValue
    } else if (typeof input === "object" && input !== null) {
        if (Array.isArray(input)) {
            if (input.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
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
        let splitted = splitInputByComma(input);
        if (splitted.length > 1) {
            if (splitted.length > numDataset) {
                errorMessage = "Too many inputs for parameter '" + name + "'";
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
    } else if (typeof input === "number") {
        let strNumber = input.toString();
        if (validator) {
            if (validator(strNumber)) {
                array[0] = strNumber;
                numValidValue++;
                for (let ind = 1; ind < array.length; ind++) {
                    array[ind] = strNumber;
                }
            } else {
                errorMessage = "Invalid inputs for " + name;
            }
        } else {
            array[0] = strNumber;
            numValidValue++;
            for (let ind = 1; ind < array.length; ind++) {
                array[ind] = strNumber;
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

    for (let ind = 0; ind < array.length; ind++) {
        array[ind] = helper.replaceImgTagByAlt(array[ind]);
    }

    return array;
}

function getNumberArray(name: string, input: any): Array<number> | string {
    let numArray: Array<number> = [];

    if (typeof input === "undefined" || input === null) return numArray;

    if (typeof input === "object") {
        if (Array.isArray(input)) {
            for (let elem of input) {
                if (typeof elem === "string") {
                    let v = parseFloat(elem);
                    if (Number.isNumber(v)) {
                        numArray.push(v);
                    } else {
                        let errorMessage = `Parameter '${name}' accepts only numbers`;
                        return errorMessage;
                    }
                }
            }
        }
    } else if (typeof input === "string") {
        let splitted = splitInputByComma(input);
        if (splitted.length > 1) {
            for (let piece of splitted) {
                let v = parseFloat(piece.trim());
                if (!Number.isNaN(v)) {
                    // Number.isNumber(NaN) --> true
                    numArray.push(v);
                } else {
                    let errorMessage = `Parameter '${name}' accepts only numbers`;
                    return errorMessage;
                }
            }
        } else if (input === "") {
            let errorMessage = `Empty ${name} is not allowed.`;
            return errorMessage;
        } else {
            let v = parseFloat(input);
            if (Number.isNumber(v)) {
                numArray.push(v);
            } else {
                let errorMessage = `Parameter '${name}' accepts only numbers`;
                return errorMessage;
            }
        }
    } else if (typeof input === "number") {
        numArray.push(input);
    } else {
        let errorMessage = `Invalid ${name}`;
        return errorMessage;
    }

    return numArray;
}

function getStringArray(name: string, input: any): Array<string> | string {
    let strArray: Array<string> = [];

    if (typeof input === "undefined" || input === null) return strArray;

    if (typeof input === "object") {
        if (Array.isArray(input)) {
            for (let elem of input) {
                if (typeof elem === "string") {
                    strArray.push(elem.trim());
                }
            }
        }
    } else if (typeof input === "string") {
        let splitted = splitInputByComma(input);
        // console.log(splitted);
        if (splitted.length > 1) {
            for (let piece of splitted) {
                strArray.push(piece.trim());
            }
        } else if (input === "") {
            let errorMessage = `Empty ${name} is not allowed.`;
            return errorMessage;
        } else {
            strArray.push(input);
        }
    } else {
        let errorMessage = `Invalid ${name}`;
        return errorMessage;
    }

    for (let ind = 0; ind < strArray.length; ind++) {
        strArray[ind] = helper.replaceImgTagByAlt(strArray[ind]);
    }

    return strArray;
}

function parseCommonChartInfo(yaml: any, renderInfo: CommonChartInfo) {
    // console.log("parseCommonChartInfo");

    // single value, use default value if no value from YAML
    if (yaml) {
        // title
        renderInfo.title = getStringFromInput(yaml?.title, renderInfo.title);

        // xAxisLabel
        renderInfo.xAxisLabel = getStringFromInput(
            yaml?.xAxisLabel,
            renderInfo.xAxisLabel
        );

        // xAxisColor
        renderInfo.xAxisColor = getStringFromInput(
            yaml?.xAxisColor,
            renderInfo.xAxisColor
        );

        // xAxisLabelColor
        renderInfo.xAxisLabelColor = getStringFromInput(
            yaml?.xAxisLabelColor,
            renderInfo.xAxisLabelColor
        );

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
        renderInfo.legendBgColor = getStringFromInput(
            yaml?.legendBgColor,
            renderInfo.legendBgColor
        );

        // legendBorderColor
        renderInfo.legendBorderColor = getStringFromInput(
            yaml?.legendBorderColor,
            renderInfo.legendBorderColor
        );
    }

    // yAxisLabel
    let retYAxisLabel = getStringArrayFromInput(
        "yAxisLabel",
        yaml?.yAxisLabel,
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
        yaml?.yAxisColor,
        2,
        "",
        validateColor,
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
        yaml?.yAxisLabelColor,
        2,
        "",
        validateColor,
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
        yaml?.yAxisUnit,
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

    // xAxisTickInterval
    renderInfo.xAxisTickInterval = getStringFromInput(
        yaml?.xAxisTickInterval,
        renderInfo.xAxisTickInterval
    );
    // console.log(renderInfo.xAxisTickInterval);

    // yAxisTickInterval
    let retYAxisTickInterval = getStringArrayFromInput(
        "yAxisTickInterval",
        yaml?.yAxisTickInterval,
        2,
        null,
        null,
        true
    );
    if (typeof retYAxisTickInterval === "string") {
        return retYAxisTickInterval; // errorMessage
    }
    if (retYAxisTickInterval.length > 2) {
        return "yAxisTickInterval accepts not more than two values for left and right y-axes";
    }
    renderInfo.yAxisTickInterval = retYAxisTickInterval;
    // console.log(renderInfo.yAxisTickInterval);

    // xAxisTickLabelFormat
    renderInfo.xAxisTickLabelFormat = getStringFromInput(
        yaml?.xAxisTickLabelFormat,
        renderInfo.xAxisTickLabelFormat
    );
    // console.log(renderInfo.xAxisTickLabelFormat);

    // yAxisTickLabelFormat
    let retYAxisTickLabelFormat = getStringArrayFromInput(
        "yAxisTickLabelFormat",
        yaml?.yAxisTickLabelFormat,
        2,
        null,
        null,
        true
    );
    if (typeof retYAxisTickLabelFormat === "string") {
        return retYAxisTickLabelFormat; // errorMessage
    }
    if (retYAxisTickLabelFormat.length > 2) {
        return "yAxisTickLabelFormat accepts not more than two values for left and right y-axes";
    }
    renderInfo.yAxisTickLabelFormat = retYAxisTickLabelFormat;
    // console.log(renderInfo.yAxisTickLabelFormat);

    // yMin
    let retYMin = getNumberArrayFromInput("yMin", yaml?.yMin, 2, null, true);
    if (typeof retYMin === "string") {
        return retYMin; // errorMessage
    }
    if (retYMin.length > 2) {
        return "yMin accepts not more than two values for left and right y-axes";
    }
    renderInfo.yMin = retYMin;
    // console.log(renderInfo.yMin);

    // yMax
    let retYMax = getNumberArrayFromInput("yMax", yaml?.yMax, 2, null, true);
    if (typeof retYMax === "string") {
        return retYMax; // errorMessage
    }
    if (retYMax.length > 2) {
        return "yMax accepts not more than two values for left and right y-axes";
    }
    renderInfo.yMax = retYMax;
    // console.log(renderInfo.yMax);

    // reverseYAxis
    let retReverseYAxis = getBoolArrayFromInput(
        "reverseYAxis",
        yaml?.reverseYAxis,
        2,
        false,
        true
    );
    if (typeof retReverseYAxis === "string") {
        return retReverseYAxis; // errorMessage
    }
    if (retReverseYAxis.length > 2) {
        return "reverseYAxis accepts not more than two values for left and right y-axes";
    }
    renderInfo.reverseYAxis = retReverseYAxis;
    // console.log(renderInfo.reverseYAxis);
}

function getAvailableKeysOfClass(obj: object): string[] {
    let keys: string[] = [];
    if (obj !== null) {
        const objectKeys = Object.keys(obj) as Array<keyof string>;
        for (let key of objectKeys) {
            keys.push(key.toString());
        }
    }
    return keys;
}

export function getRenderInfoFromYaml(
    yamlText: string,
    plugin: Tracker
): RenderInfo | string {
    let yaml;
    try {
        // console.log(yamlText);
        yaml = parseYaml(yamlText);
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
    let keysFoundInYAML = getAvailableKeysOfClass(yaml);
    // console.log(keysFoundInYAML);

    let errorMessage = "";

    // Search target
    if (!keysFoundInYAML.includes("searchTarget")) {
        let errorMessage = "Parameter 'searchTarget' not found in YAML";
        return errorMessage;
    }
    let searchTarget: Array<string> = [];
    if (typeof yaml.searchTarget === "object" && yaml.searchTarget !== null) {
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
        let splitted = splitInputByComma(yaml.searchTarget);
        // console.log(splitted);
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
    for (let ind = 0; ind < searchTarget.length; ind++) {
        searchTarget[ind] = helper.replaceImgTagByAlt(searchTarget[ind]);
    }
    // console.log(searchTarget);

    if (errorMessage !== "") {
        return errorMessage;
    }

    let numDatasets = searchTarget.length;

    // Search type
    if (!keysFoundInYAML.includes("searchType")) {
        let errorMessage = "Parameter 'searchType' not found in YAML";
        return errorMessage;
    }
    let searchType: Array<SearchType> = [];
    let retSearchType = getStringArrayFromInput(
        "searchType",
        yaml.searchType,
        numDatasets,
        "",
        validateSearchType,
        false
    );
    if (typeof retSearchType === "string") {
        return retSearchType; // errorMessage
    }
    for (let strType of retSearchType) {
        switch (strType.toLowerCase()) {
            case "tag":
                searchType.push(SearchType.Tag);
                break;
            case "frontmatter":
                searchType.push(SearchType.Frontmatter);
                break;
            case "wiki":
                searchType.push(SearchType.Wiki);
                break;
            case "wiki.link":
                searchType.push(SearchType.WikiLink);
                break;
            case "wiki.display":
                searchType.push(SearchType.WikiDisplay);
                break;
            case "text":
                searchType.push(SearchType.Text);
                break;
            case "dvfield":
                searchType.push(SearchType.dvField);
                break;
            case "table":
                searchType.push(SearchType.Table);
                break;
            case "filemeta":
                searchType.push(SearchType.FileMeta);
                break;
            case "task":
                searchType.push(SearchType.Task);
                break;
            case "task.all":
                searchType.push(SearchType.Task);
                break;
            case "task.done":
                searchType.push(SearchType.TaskDone);
                break;
            case "task.notdone":
                searchType.push(SearchType.TaskNotDone);
                break;
        }
    }
    // Currently, we don't allow type 'table' used with other types
    if (
        searchType.includes(SearchType.Table) &&
        searchType.filter((t) => t !== SearchType.Table).length > 0
    ) {
        let errorMessage =
            "searchType 'table' doestn't work with other types for now";
        return errorMessage;
    }
    // console.log(searchType);

    // separator
    let multipleValueSparator: Array<string> = [];
    let retMultipleValueSparator = getStringArrayFromInput(
        "separator",
        yaml.separator,
        numDatasets,
        "", // set the default value later
        null,
        true
    );
    if (typeof retMultipleValueSparator === "string") {
        return retMultipleValueSparator; // errorMessage
    }
    multipleValueSparator = retMultipleValueSparator.map((sep) => {
        if (sep === "comma" || sep === "\\,") {
            return ",";
        }
        return sep;
    });
    // console.log(multipleValueSparator);

    // xDataset
    let retXDataset = getNumberArrayFromInput(
        "xDataset",
        yaml.xDataset,
        numDatasets,
        -1,
        true
    );
    if (typeof retXDataset === "string") {
        return retXDataset; // errorMessage
    }
    let xDataset = retXDataset.map((d: number) => {
        if (d < 0 || d >= numDatasets) {
            return -1;
        }
        return d;
    });
    // assign this to renderInfo later

    // Create queries
    let queries: Array<Query> = [];
    for (let ind = 0; ind < searchTarget.length; ind++) {
        let query = new Query(
            queries.length,
            searchType[ind],
            searchTarget[ind]
        );
        query.setSeparator(multipleValueSparator[ind]);
        if (xDataset.includes(ind)) query.usedAsXDataset = true;
        queries.push(query);
    }
    // console.log(queries);

    // Create grarph info
    let renderInfo = new RenderInfo(queries);
    let keysOfRenderInfo = getAvailableKeysOfClass(renderInfo);
    let additionalAllowedKeys = ["searchType", "searchTarget", "separator"];
    // console.log(keysOfRenderInfo);
    let yamlLineKeys = [];
    let yamlBarKeys = [];
    let yamlPieKeys = [];
    let yamlSummaryKeys = [];
    let yamlMonthKeys = [];
    let yamlHeatmapKeys = [];
    let yamlBulletKeys = [];
    for (let key of keysFoundInYAML) {
        if (/^line[0-9]*$/.test(key)) {
            yamlLineKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^bar[0-9]*$/.test(key)) {
            yamlBarKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^pie[0-9]*$/.test(key)) {
            yamlPieKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^summary[0-9]*$/.test(key)) {
            yamlSummaryKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^bullet[0-9]*$/.test(key)) {
            yamlBulletKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^month[0-9]*$/.test(key)) {
            yamlMonthKeys.push(key);
            additionalAllowedKeys.push(key);
        }
        if (/^heatmap[0-9]*$/.test(key)) {
            yamlHeatmapKeys.push(key);
            additionalAllowedKeys.push(key);
        }
    }
    // Custom dataset
    let yamlCustomDatasetKeys = [];
    for (let key of keysFoundInYAML) {
        if (/^dataset[0-9]*$/.test(key)) {
            // Check the id of custom dataset is not duplicated
            let customDatasetId = -1;
            let strCustomDatasetId = key.replace("dataset", "");
            if (strCustomDatasetId === "") {
                customDatasetId = 0;
            } else {
                customDatasetId = parseFloat(strCustomDatasetId);
            }

            if (
                queries.some((q) => {
                    return q.getId() === customDatasetId;
                })
            ) {
                errorMessage = "Duplicated dataset id for key '" + key + "'";
                return errorMessage;
            }

            yamlCustomDatasetKeys.push(key);
            additionalAllowedKeys.push(key);
        }
    }
    // console.log(additionalAllowedKeys);
    for (let key of keysFoundInYAML) {
        if (
            !keysOfRenderInfo.includes(key) &&
            !additionalAllowedKeys.includes(key)
        ) {
            errorMessage = "'" + key + "' is not an available key";
            return errorMessage;
        }
    }

    let totalNumOutputs =
        yamlLineKeys.length +
        yamlBarKeys.length +
        yamlPieKeys.length +
        yamlSummaryKeys.length +
        yamlBulletKeys.length +
        yamlMonthKeys.length +
        yamlHeatmapKeys.length;
    if (totalNumOutputs === 0) {
        return "No output parameter provided, please place line, bar, pie, month, bullet, or summary.";
    }

    // Root folder to search
    renderInfo.folder = getStringFromInput(
        yaml?.folder,
        plugin.settings.folder
    );
    if (renderInfo.folder.trim() === "") {
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

    // file
    if (typeof yaml.file === "string") {
        let retFiles = getStringArray("file", yaml.file);
        if (typeof retFiles === "string") {
            return retFiles; // error message
        }
        renderInfo.file = retFiles;
    }
    // console.log(renderInfo.file);

    // specifiedFilesOnly
    if (typeof yaml.specifiedFilesOnly === "boolean") {
        renderInfo.specifiedFilesOnly = yaml.specifiedFilesOnly;
    }
    // console.log(renderInfo.specifiedFilesOnly);

    // fileContainsLinkedFiles
    if (typeof yaml.fileContainsLinkedFiles === "string") {
        let retFiles = getStringArray(
            "fileContainsLinkedFiles",
            yaml.fileContainsLinkedFiles
        );
        if (typeof retFiles === "string") {
            return retFiles;
        }
        renderInfo.fileContainsLinkedFiles = retFiles;
    }
    // console.log(renderInfo.fileContainsLinkedFiles);

    // fileMultiplierAfterLink
    renderInfo.fileMultiplierAfterLink = getStringFromInput(
        yaml?.fileMultiplierAfterLink,
        renderInfo.fileMultiplierAfterLink
    );
    // console.log(renderInfo.fileMultiplierAfterLink);

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
    renderInfo.dateFormatPrefix = getStringFromInput(
        yaml?.dateFormatPrefix,
        renderInfo.dateFormatPrefix
    );

    // Date fromat suffix
    renderInfo.dateFormatSuffix = getStringFromInput(
        yaml?.dateFormatSuffix,
        renderInfo.dateFormatSuffix
    );

    // startDate, endDate
    // console.log("Parsing startDate");
    if (typeof yaml.startDate === "string") {
        if (/^([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)m$/.test(yaml.startDate)) {
            let errorMessage =
                "'m' for 'minute' is too small for parameter startDate, please use 'd' for 'day' or 'M' for month";
            return errorMessage;
        }
        let strStartDate = helper.getDateStringFromInputString(
            yaml.startDate,
            renderInfo.dateFormatPrefix,
            renderInfo.dateFormatSuffix
        );
        // console.log(strStartDate);

        // relative date
        let startDate = null;
        let isStartDateValid = false;
        startDate = helper.getDateByDurationToToday(
            strStartDate,
            renderInfo.dateFormat
        );
        // console.log(startDate);

        if (startDate) {
            isStartDateValid = true;
        } else {
            startDate = helper.strToDate(strStartDate, renderInfo.dateFormat);
            if (startDate.isValid()) {
                isStartDateValid = true;
            }
        }
        // console.log(startDate);

        if (!isStartDateValid || startDate === null) {
            let errorMessage =
                "Invalid startDate, the format of startDate may not match your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
        renderInfo.startDate = startDate;
    }

    // console.log("Parsing endDate");
    if (typeof yaml.endDate === "string") {
        if (/^([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)m$/.test(yaml.endDate)) {
            let errorMessage =
                "'m' for 'minute' is too small for parameter endDate, please use 'd' for 'day' or 'M' for month";
            return errorMessage;
        }
        let strEndDate = helper.getDateStringFromInputString(
            yaml.endDate,
            renderInfo.dateFormatPrefix,
            renderInfo.dateFormatSuffix
        );

        let endDate = null;
        let isEndDateValid = false;
        endDate = helper.getDateByDurationToToday(
            strEndDate,
            renderInfo.dateFormat
        );
        if (endDate) {
            isEndDateValid = true;
        } else {
            endDate = helper.strToDate(strEndDate, renderInfo.dateFormat);
            if (endDate.isValid()) {
                isEndDateValid = true;
            }
        }
        // console.log(endDate);

        if (!isEndDateValid || endDate === null) {
            let errorMessage =
                "Invalid endDate, the format of endDate may not match your dateFormat " +
                renderInfo.dateFormat;
            return errorMessage;
        }
        renderInfo.endDate = endDate;
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

    // xDataset
    renderInfo.xDataset = xDataset;
    // console.log(renderInfo.xDataset);

    // Dataset name (need xDataset to set default name)
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
        if (renderInfo.xDataset.includes(ind)) continue;
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

    // valueShift
    let retValueShift = getNumberArrayFromInput(
        "valueShift",
        yaml.valueShift,
        numDatasets,
        0,
        true
    );
    if (typeof retValueShift === "string") {
        return retValueShift;
    }
    renderInfo.valueShift = retValueShift;
    // console.log(renderInfo.valueShift);

    // shiftOnlyValueLargerThan
    let retShiftOnlyValueLargerThan = getNumberArrayFromInput(
        "shiftOnlyValueLargerThan",
        yaml.shiftOnlyValueLargerThan,
        numDatasets,
        null,
        true
    );
    if (typeof retShiftOnlyValueLargerThan === "string") {
        return retShiftOnlyValueLargerThan;
    }
    renderInfo.shiftOnlyValueLargerThan = retShiftOnlyValueLargerThan;
    // console.log(renderInfo.shiftOnlyValueLargerThan);

    // textValueMap
    if (typeof yaml.textValueMap !== "undefined") {
        let keys = getAvailableKeysOfClass(yaml.textValueMap);
        // console.log(texts);
        for (let key of keys) {
            let text = key.trim();
            renderInfo.textValueMap[text] = yaml.textValueMap[text];
        }
    }
    // console.log(renderInfo.textValueMap);

    // fixedScale
    if (typeof yaml.fixedScale === "number") {
        renderInfo.fixedScale = yaml.fixedScale;
    }

    // fitPanelWidth
    if (typeof yaml.fitPanelWidth === "boolean") {
        renderInfo.fitPanelWidth = yaml.fitPanelWidth;
    }

    // aspectRatio
    if (typeof yaml.aspectRatio === "string") {
        // yaml.fitPanelWidth
        let ratioRegEx = /([0-9]*):([0-9]*)/;
        let parts = yaml.aspectRatio.match(ratioRegEx);
        parts.shift();
        parts = parts.map((i: string)=>parseInt(i,10));
        if (parts.length==2) {
            renderInfo.aspectRatio = new AspectRatio(parts[0], parts[1]);
            renderInfo.dataAreaSize = renderInfo.aspectRatio.recalculateSize(renderInfo.dataAreaSize)
        }
    }

    // margin
    let retMargin = getNumberArrayFromInput("margin", yaml.margin, 4, 10, true);
    if (typeof retMargin === "string") {
        return retMargin; // errorMessage
    }
    if (retMargin.length > 4) {
        return "margin accepts not more than four values for top, right, bottom, and left margins.";
    }
    renderInfo.margin = new Margin(
        retMargin[0],
        retMargin[1],
        retMargin[2],
        retMargin[3]
    );
    // console.log(renderInfo.margin);

    // customDataset related parameters
    for (let datasetKey of yamlCustomDatasetKeys) {
        let customDataset = new CustomDatasetInfo();
        let yamlCustomDataset = yaml[datasetKey];

        let keysOfCustomDatasetInfo = getAvailableKeysOfClass(customDataset);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlCustomDataset);
        // console.log(keysOfCustomDatasetInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfCustomDatasetInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        // id
        let customDatasetId = -1;
        let strCustomDatasetId = datasetKey.replace("dataset", "");
        if (strCustomDatasetId === "") {
            customDatasetId = 0;
        } else {
            customDatasetId = parseFloat(strCustomDatasetId);
        }
        customDataset.id = customDatasetId;

        // name
        customDataset.name = getStringFromInput(
            yamlCustomDataset?.name,
            customDataset.name
        );

        // xData
        let retXData = getStringArray("xData", yamlCustomDataset?.xData);
        if (typeof retXData === "string") {
            return retXData;
        }
        customDataset.xData = retXData;
        // console.log(customDataset.xData);
        let numXData = customDataset.xData.length;

        // yData
        let retYData = getStringArray("yData", yamlCustomDataset?.yData);
        if (typeof retYData === "string") {
            return retYData;
        }
        customDataset.yData = retYData;
        // console.log(customDataset.yData);
        if (customDataset.yData.length !== numXData) {
            let errorMessage =
                "Number of elements in xData and yData not matched";
            return errorMessage;
        }

        renderInfo.customDataset.push(customDataset);
    } // customDataset related parameters
    // console.log(renderInfo.customDataset);

    // line related parameters
    for (let lineKey of yamlLineKeys) {
        let line = new LineInfo();
        let yamlLine = yaml[lineKey];

        let keysOfLineInfo = getAvailableKeysOfClass(line);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlLine);
        // console.log(keysOfLineInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfLineInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        let retParseCommonChartInfo = parseCommonChartInfo(yamlLine, line);
        if (typeof retParseCommonChartInfo === "string") {
            return retParseCommonChartInfo;
        }

        // lineColor
        let retLineColor = getStringArrayFromInput(
            "lineColor",
            yamlLine?.lineColor,
            numDatasets,
            "",
            validateColor,
            true
        );
        if (typeof retLineColor === "string") {
            return retLineColor; // errorMessage
        }
        line.lineColor = retLineColor;
        // console.log(line.lineColor);

        // lineWidth
        let retLineWidth = getNumberArrayFromInput(
            "lineWidth",
            yamlLine?.lineWidth,
            numDatasets,
            1.5,
            true
        );
        if (typeof retLineWidth === "string") {
            return retLineWidth; // errorMessage
        }
        line.lineWidth = retLineWidth;
        // console.log(line.lineWidth);

        // showLine
        let retShowLine = getBoolArrayFromInput(
            "showLine",
            yamlLine?.showLine,
            numDatasets,
            true,
            true
        );
        if (typeof retShowLine === "string") {
            return retShowLine;
        }
        line.showLine = retShowLine;
        // console.log(line.showLine);

        // showPoint
        let retShowPoint = getBoolArrayFromInput(
            "showPoint",
            yamlLine?.showPoint,
            numDatasets,
            true,
            true
        );
        if (typeof retShowPoint === "string") {
            return retShowPoint;
        }
        line.showPoint = retShowPoint;
        // console.log(line.showPoint);

        // pointColor
        let retPointColor = getStringArrayFromInput(
            "pointColor",
            yamlLine?.pointColor,
            numDatasets,
            "#69b3a2",
            validateColor,
            true
        );
        if (typeof retPointColor === "string") {
            return retPointColor;
        }
        line.pointColor = retPointColor;
        // console.log(line.pointColor);

        // pointBorderColor
        let retPointBorderColor = getStringArrayFromInput(
            "pointBorderColor",
            yamlLine?.pointBorderColor,
            numDatasets,
            "#69b3a2",
            validateColor,
            true
        );
        if (typeof retPointBorderColor === "string") {
            return retPointBorderColor;
        }
        line.pointBorderColor = retPointBorderColor;
        // console.log(line.pointBorderColor);

        // pointBorderWidth
        let retPointBorderWidth = getNumberArrayFromInput(
            "pointBorderWidth",
            yamlLine?.pointBorderWidth,
            numDatasets,
            0.0,
            true
        );
        if (typeof retPointBorderWidth === "string") {
            return retPointBorderWidth; // errorMessage
        }
        line.pointBorderWidth = retPointBorderWidth;
        // console.log(line.pointBorderWidth);

        // pointSize
        let retPointSize = getNumberArrayFromInput(
            "pointSize",
            yamlLine?.pointSize,
            numDatasets,
            3.0,
            true
        );
        if (typeof retPointSize === "string") {
            return retPointSize; // errorMessage
        }
        line.pointSize = retPointSize;
        // console.log(line.pointSize);

        // fillGap
        let retFillGap = getBoolArrayFromInput(
            "fillGap",
            yamlLine?.fillGap,
            numDatasets,
            false,
            true
        );
        if (typeof retFillGap === "string") {
            return retFillGap;
        }
        line.fillGap = retFillGap;
        // console.log(line.fillGap);

        // yAxisLocation
        let retYAxisLocation = getStringArrayFromInput(
            "yAxisLocation",
            yamlLine?.yAxisLocation,
            numDatasets,
            "left",
            validateYAxisLocation,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        line.yAxisLocation = retYAxisLocation;
        // console.log(line.yAxisLocation);

        renderInfo.line.push(line);
    } // line related parameters
    // console.log(renderInfo.line);

    // bar related parameters
    for (let barKey of yamlBarKeys) {
        let bar = new BarInfo();
        let yamlBar = yaml[barKey];

        let keysOfBarInfo = getAvailableKeysOfClass(bar);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlBar);
        // console.log(keysOfBarInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfBarInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        let retParseCommonChartInfo = parseCommonChartInfo(yamlBar, bar);
        if (typeof retParseCommonChartInfo === "string") {
            return retParseCommonChartInfo;
        }

        // barColor
        let retBarColor = getStringArrayFromInput(
            "barColor",
            yamlBar?.barColor,
            numDatasets,
            "",
            validateColor,
            true
        );
        if (typeof retBarColor === "string") {
            return retBarColor; // errorMessage
        }
        bar.barColor = retBarColor;
        // console.log(bar.barColor);

        // yAxisLocation
        let retYAxisLocation = getStringArrayFromInput(
            "yAxisLocation",
            yamlBar?.yAxisLocation,
            numDatasets,
            "left",
            validateYAxisLocation,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        bar.yAxisLocation = retYAxisLocation;
        // console.log(bar.yAxisLocation);

        renderInfo.bar.push(bar);
    } // bar related parameters
    // console.log(renderInfo.bar);

    // pie related parameters
    for (let pieKey of yamlPieKeys) {
        let pie = new PieInfo();
        let yamlPie = yaml[pieKey];

        let keysOfPieInfo = getAvailableKeysOfClass(pie);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlPie);
        // console.log(keysOfPieInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfPieInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        // title
        pie.title = getStringFromInput(yamlPie?.title, pie.title);
        // console.log(pie.title);

        // data
        let retData = getStringArray("data", yamlPie?.data);
        if (typeof retData === "string") {
            return retData;
        }
        pie.data = retData;
        // console.log(pie.data);
        let numData = pie.data.length;

        // dataColor
        let retDataColor = getStringArrayFromInput(
            "dataColor",
            yamlPie?.dataColor,
            numData,
            null,
            validateColor,
            true
        );
        if (typeof retDataColor === "string") {
            return retDataColor; // errorMessage
        }
        pie.dataColor = retDataColor;
        // console.log(pie.dataColor);

        // dataName
        let retDataName = getStringArrayFromInput(
            "dataName",
            yamlPie?.dataName,
            numData,
            "",
            null,
            true
        );
        if (typeof retDataName === "string") {
            return retDataName; // errorMessage
        }
        pie.dataName = retDataName;
        // console.log(pie.dataName);

        // label
        let retLabel = getStringArrayFromInput(
            "label",
            yamlPie?.label,
            numData,
            "",
            null,
            true
        );
        if (typeof retLabel === "string") {
            return retLabel; // errorMessage
        }
        pie.label = retLabel;
        // console.log(pie.label);

        // hideLabelLessThan
        if (typeof yamlPie?.hideLabelLessThan === "number") {
            pie.hideLabelLessThan = yamlPie.hideLabelLessThan;
        }
        // console.log(pie.hideLabelLessThan);

        // extLabel
        let retExtLabel = getStringArrayFromInput(
            "extLabel",
            yamlPie?.extLabel,
            numData,
            "",
            null,
            true
        );
        if (typeof retExtLabel === "string") {
            return retExtLabel; // errorMessage
        }
        pie.extLabel = retExtLabel;
        // console.log(pie.extLabel);

        // showExtLabelOnlyIfNoLabel
        if (typeof yamlPie?.showExtLabelOnlyIfNoLabel === "boolean") {
            pie.showExtLabelOnlyIfNoLabel = yamlPie.showExtLabelOnlyIfNoLabel;
        }
        // console.log(pie.showExtLabelOnlyIfNoLabel);

        // ratioInnerRadius
        if (typeof yamlPie?.ratioInnerRadius === "number") {
            pie.ratioInnerRadius = yamlPie.ratioInnerRadius;
        }
        // console.log(pie.ratioInnerRadius);

        // showLegend
        if (typeof yamlPie?.showLegend === "boolean") {
            pie.showLegend = yamlPie.showLegend;
        }

        // legendPosition
        pie.legendPosition = getStringFromInput(
            yamlPie?.legendPosition,
            "right"
        );

        // legendOrient
        let defaultLegendOrientation = "horizontal";
        if (pie.legendPosition === "top" || pie.legendPosition === "bottom") {
            defaultLegendOrientation = "horizontal";
        } else if (
            pie.legendPosition === "left" ||
            pie.legendPosition === "right"
        ) {
            defaultLegendOrientation = "vertical";
        } else {
            defaultLegendOrientation = "horizontal";
        }
        pie.legendOrientation = getStringFromInput(
            yamlPie?.legendOrientation,
            defaultLegendOrientation
        );
        // console.log(pie.legendPosition);
        // console.log(pie.legendOrientation);

        // legendBgColor
        pie.legendBgColor = getStringFromInput(
            yamlPie?.legendBgColor,
            pie.legendBgColor
        );

        // legendBorderColor
        pie.legendBorderColor = getStringFromInput(
            yamlPie?.legendBorderColor,
            pie.legendBorderColor
        );

        renderInfo.pie.push(pie);
    } // pie related parameters
    // console.log(renderInfo.pie);

    // summary related parameters
    for (let summaryKey of yamlSummaryKeys) {
        let summary = new SummaryInfo();
        let yamlSummary = yaml[summaryKey];

        let keysOfSummaryInfo = getAvailableKeysOfClass(summary);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlSummary);
        // console.log(keysOfSummaryInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfSummaryInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        // template
        summary.template = getStringFromInput(
            yamlSummary?.template,
            summary.template
        );

        // style
        summary.style = getStringFromInput(yamlSummary?.style, summary.style);

        renderInfo.summary.push(summary);
    } // summary related parameters

    // Month related parameters
    for (let monthKey of yamlMonthKeys) {
        let month = new MonthInfo();
        let yamlMonth = yaml[monthKey];

        let keysOfMonthInfo = getAvailableKeysOfClass(month);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlMonth);
        // console.log(keysOfSummaryInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfMonthInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        // mode
        month.mode = getStringFromInput(yamlMonth?.mode, month.mode);
        // console.log(month.mode);

        // dataset
        let retDataset = getNumberArray("dataset", yamlMonth?.dataset);
        if (typeof retDataset === "string") {
            return retDataset;
        }
        if (retDataset.length === 0) {
            // insert y dataset given
            for (let q of queries) {
                retDataset.push(q.getId());
            }
        }
        month.dataset = retDataset;
        // console.log(month.dataset);
        let numDataset = month.dataset.length;

        // startWeekOn
        month.startWeekOn = getStringFromInput(
            yamlMonth?.startWeekOn,
            month.startWeekOn
        );
        // console.log(month.startWeekOn);

        // showCircle
        if (typeof yamlMonth?.showCircle === "boolean") {
            month.showCircle = yamlMonth.showCircle;
        }
        // console.log(month.showCircle);

        // threshold
        let retThreshold = getNumberArray("threshold", yamlMonth?.threshold);
        if (typeof retThreshold === "string") {
            return retThreshold;
        }
        month.threshold = retThreshold;
        if (month.threshold.length === 0) {
            for (let indDataset = 0; indDataset < numDataset; indDataset++) {
                month.threshold.push(0);
            }
        }
        if (month.threshold.length !== month.dataset.length) {
            // console.log(month.threshold);
            // console.log(month.dataset);
            const errorMessage =
                "The number of inputs of threshold and dataset not matched";
            return errorMessage;
        }
        // console.log(month.threshold);

        // yMin
        let retYMin = getNumberArray("yMin", yamlMonth?.yMin);
        if (typeof retYMin === "string") {
            return retYMin;
        }
        month.yMin = retYMin;
        if (month.yMin.length === 0) {
            for (let indDataset = 0; indDataset < numDataset; indDataset++) {
                month.yMin.push(null);
            }
        }
        if (month.yMin.length !== month.dataset.length) {
            const errorMessage =
                "The number of inputs of yMin and dataset not matched";
            return errorMessage;
        }
        // console.log(month.yMin);

        // yMax
        let retYMax = getNumberArray("yMax", yamlMonth?.yMax);
        if (typeof retYMax === "string") {
            return retYMax;
        }
        month.yMax = retYMax;
        if (month.yMax.length === 0) {
            for (let indDataset = 0; indDataset < numDataset; indDataset++) {
                month.yMax.push(null);
            }
        }
        if (month.yMax.length !== month.dataset.length) {
            const errorMessage =
                "The number of inputs of yMin and dataset not matched";
            return errorMessage;
        }
        // console.log(month.yMax);

        // color
        month.color = getStringFromInput(yamlMonth?.color, month.color);
        // console.log(month.color);

        // dimNotInMonth
        if (typeof yamlMonth?.dimNotInMonth === "boolean") {
            month.dimNotInMonth = yamlMonth.dimNotInMonth;
        }
        // console.log(month.dimNotInMonth);

        // showStreak
        if (typeof yamlMonth?.showStreak === "boolean") {
            month.showStreak = yamlMonth.showStreak;
        }
        // console.log(month.showStreak);

        // showTodayRing
        if (typeof yamlMonth?.showTodayRing === "boolean") {
            month.showTodayRing = yamlMonth.showTodayRing;
        }
        // console.log(month.showTodayRing);

        // showSelectedValue
        if (typeof yamlMonth?.showSelectedValue === "boolean") {
            month.showSelectedValue = yamlMonth.showSelectedValue;
        }
        // console.log(month.showSelectedValue);

        // showSelectedRing
        if (typeof yamlMonth?.showSelectedRing === "boolean") {
            month.showSelectedRing = yamlMonth.showSelectedRing;
        }
        // console.log(month.showSelectedRing);

        // circleColor
        month.circleColor = getStringFromInput(
            yamlMonth?.circleColor,
            month.circleColor
        );
        // console.log(month.circleColor);

        // circleColorByValue
        if (typeof yamlMonth?.circleColorByValue === "boolean") {
            month.circleColorByValue = yamlMonth.circleColorByValue;
        }
        // console.log(month.circleColorByValue);

        // headerYearColor
        month.headerYearColor = getStringFromInput(
            yamlMonth?.headerYearColor,
            month.headerYearColor
        );
        // console.log(month.headerYearColor);

        // headerMonthColor
        month.headerMonthColor = getStringFromInput(
            yamlMonth?.headerMonthColor,
            month.headerMonthColor
        );
        // console.log(month.headerMonthColor);

        // dividingLineColor
        month.dividingLineColor = getStringFromInput(
            yamlMonth?.dividingLineColor,
            month.dividingLineColor
        );
        // console.log(month.dividingLineColor);

        // todayRingColor
        month.todayRingColor = getStringFromInput(
            yamlMonth?.todayRingColor,
            month.todayRingColor
        );
        // console.log(month.todayRingColor);

        // selectedRingColor
        month.selectedRingColor = getStringFromInput(
            yamlMonth?.selectedRingColor,
            month.selectedRingColor
        );
        // console.log(month.selectedRingColor);

        // initMonth
        month.initMonth = getStringFromInput(
            yamlMonth?.initMonth,
            month.initMonth
        );
        // console.log(month.initMonth);

        // showAnnotation
        if (typeof yamlMonth?.showAnnotation === "boolean") {
            month.showAnnotation = yamlMonth.showAnnotation;
        }
        // console.log(month.showAnnotation);

        // annotation
        let retAnnotation = getStringArray("annotation", yamlMonth?.annotation);
        if (typeof retAnnotation === "string") {
            return retAnnotation;
        }
        month.annotation = retAnnotation;
        if (month.annotation.length === 0) {
            for (let indDataset = 0; indDataset < numDataset; indDataset++) {
                month.annotation.push(null);
            }
        }
        if (month.annotation.length !== month.dataset.length) {
            const errorMessage =
                "The number of inputs of annotation and dataset not matched";
            return errorMessage;
        }
        // console.log(month.annotation);

        // showAnnotationOfAllTargets
        if (typeof yamlMonth?.showAnnotationOfAllTargets === "boolean") {
            month.showAnnotationOfAllTargets =
                yamlMonth.showAnnotationOfAllTargets;
        }
        // console.log(month.showAnnotationOfAllTargets);

        renderInfo.month.push(month);
    } // Month related parameters
    // console.log(renderInfo.month);

    // Heatmap related parameters
    for (let heatmapKey of yamlHeatmapKeys) {
        let heatmap = new HeatmapInfo();
        let yamlHeatmap = yaml[heatmapKey];

        let keysOfHeatmapInfo = getAvailableKeysOfClass(heatmap);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlHeatmap);
        // console.log(keysOfHeatmapInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfHeatmapInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        renderInfo.heatmap.push(heatmap);
    }
    // console.log(renderInfo.heatmap);

    // Bullet related parameters
    for (let bulletKey of yamlBulletKeys) {
        let bullet = new BulletInfo();
        let yamlBullet = yaml[bulletKey];

        let keysOfBulletInfo = getAvailableKeysOfClass(bullet);
        let keysFoundInYAML = getAvailableKeysOfClass(yamlBullet);
        // console.log(keysOfSummaryInfo);
        // console.log(keysFoundInYAML);
        for (let key of keysFoundInYAML) {
            if (!keysOfBulletInfo.includes(key)) {
                errorMessage = "'" + key + "' is not an available key";
                return errorMessage;
            }
        }

        // title
        bullet.title = getStringFromInput(yamlBullet?.title, bullet.title);
        // console.log(bullet.title);

        // dataset
        bullet.dataset = getStringFromInput(
            yamlBullet?.dataset,
            bullet.dataset
        );
        // console.log(bullet.dataset);

        // orientation
        bullet.orientation = getStringFromInput(
            yamlBullet?.orientation,
            bullet.orientation
        );
        // console.log(bullet.orientation);

        // range
        let retRange = getNumberArray("range", yamlBullet?.range);
        if (typeof retRange === "string") {
            return retRange;
        }
        let range = retRange as Array<number>;
        // Check the value is monotonically increasing
        // Check the value is not negative
        if (range.length === 1) {
            if (range[0] < 0) {
                errorMessage = "Negative range value is not allowed";
                return errorMessage;
            }
        } else if (range.length > 1) {
            let lastBound = range[0];
            if (lastBound < 0) {
                errorMessage = "Negative range value is not allowed";
                return errorMessage;
            } else {
                for (let ind = 1; ind < range.length; ind++) {
                    if (range[ind] <= lastBound) {
                        errorMessage =
                            "Values in parameter 'range' should be monotonically increasing";
                        return errorMessage;
                    }
                }
            }
        } else {
            errorMessage = "Empty range is not allowed";
            return errorMessage;
        }
        bullet.range = range;
        let numRange = range.length;
        // console.log(renderInfo.bullet.range);

        // range color
        let retRangeColor = getStringArrayFromInput(
            "rangeColor",
            yamlBullet?.rangeColor,
            numRange,
            "",
            validateColor,
            true
        );
        if (typeof retRangeColor === "string") {
            return retRangeColor; // errorMessage
        }
        bullet.rangeColor = retRangeColor;
        // console.log(bullet.rangeColor);

        // actual value, can possess template variable
        bullet.value = getStringFromInput(yamlBullet?.value, bullet.value);
        // console.log(bullet.value);

        // value unit
        bullet.valueUnit = getStringFromInput(
            yamlBullet?.valueUnit,
            bullet.valueUnit
        );
        // console.log(bullet.valueUnit);

        // value color
        bullet.valueColor = getStringFromInput(
            yamlBullet?.valueColor,
            bullet.valueColor
        );
        // console.log(bullet.valueColor);

        // show mark
        if (typeof yamlBullet?.showMarker === "boolean") {
            bullet.showMarker = yamlBullet.showMarker;
        }
        // console.log(bullet.showMark);

        // mark value
        if (typeof yamlBullet?.markerValue === "number") {
            bullet.markerValue = yamlBullet.markerValue;
        }
        // console.log(bullet.markValue);

        // mark color
        bullet.markerColor = getStringFromInput(
            yamlBullet?.markerColor,
            bullet.markerColor
        );
        // console.log(bullet.markValue);

        renderInfo.bullet.push(bullet);
    } // Bullet related parameters
    // console.log(renderInfo.bullet);

    return renderInfo;
}
