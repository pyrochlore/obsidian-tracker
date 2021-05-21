import Tracker from "./main";
import {
    SearchType,
    BarInfo,
    CommonChartInfo,
    Query,
    RenderInfo,
    SummaryInfo,
    Margin,
    OutputType,
    LineInfo,
} from "./data";
import { TFolder, normalizePath } from "obsidian";
import { parseYaml } from "obsidian";
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
        searchType === "wiki" ||
        searchType === "dvField" ||
        searchType === "table"
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
        let splitted = input.split(",");
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
        let splitted = input.split(",");
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
        let splitted = input.split(",");
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
    // console.log("parseCommonChartInfo");

    // single value, use default value if no value from YAML
    if (yaml) {
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
        switch (strType) {
            case "tag":
                searchType.push(SearchType.Tag);
                break;
            case "frontmatter":
                searchType.push(SearchType.Frontmatter);
                break;
            case "wiki":
                searchType.push(SearchType.Wiki);
                break;
            case "text":
                searchType.push(SearchType.Text);
                break;
            case "dvField":
                searchType.push(SearchType.dvField);
                break;
            case "table":
                searchType.push(SearchType.Table);
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
        "/",
        null,
        true
    );
    if (typeof retMultipleValueSparator === "string") {
        return retMultipleValueSparator; // errorMessage
    }
    multipleValueSparator = retMultipleValueSparator;

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
    let additionalAllowedKeys = [
        "searchType",
        "searchTarget",
        "separator",
    ];
    // console.log(keysOfRenderInfo);
    for (let key of keysFoundInYAML) {
        if (
            !keysOfRenderInfo.includes(key) &&
            !additionalAllowedKeys.includes(key)
        ) {
            errorMessage = "'" + key + "' is not an available key";
            return errorMessage;
        }
    }

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
                "Invalid startDate, the format of startDate may not match your dateFormat " +
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
                "Invalid endDate, the format of endDate may not match your dateFormat " +
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

    // fixedScale
    if (typeof yaml.fixedScale === "number") {
        renderInfo.fixedScale = yaml.fixedScale;
    }

    // fitPanelWidth
    if (typeof yaml.fitPanelWidth === "boolean") {
        renderInfo.fitPanelWidth = yaml.fitPanelWidth;
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

    // Determine outputType
    let hasLine = false;
    if (typeof yaml.line !== "undefined") {
        hasLine = true;
    }
    let hasBar = false;
    if (typeof yaml.bar !== "undefined") {
        hasBar = true;
    }
    let hasSummary = false;
    if (typeof yaml.summary !== "undefined") {
        hasSummary = true;
    }
    let sumOutput = Number(hasLine) + Number(hasBar) + Number(hasSummary);
    if (sumOutput === 0) {
        return "No output parameter provided, please place line, bar, or summary.";
    } else if (sumOutput === 1) {
        if (hasLine) renderInfo.output = OutputType.Line;
        if (hasBar) renderInfo.output = OutputType.Bar;
        if (hasSummary) renderInfo.output = OutputType.Summary;
    } else if (sumOutput >= 2) {
        return "Too many output parameters, pick line, bar, or summary.";
    }

    // line related parameters
    if (renderInfo.output === OutputType.Line) {
        renderInfo.line = new LineInfo();

        if (yaml.line !== null) {
            let keysOfLineInfo = getAvailableKeysOfClass(renderInfo.line);
            let keysFoundInYAML = getAvailableKeysOfClass(yaml.line);
            // console.log(keysOfLineInfo);
            // console.log(keysFoundInYAML);
            for (let key of keysFoundInYAML) {
                if (!keysOfLineInfo.includes(key)) {
                    errorMessage = "'" + key + "' is not an available key";
                    return errorMessage;
                }
            }
        }

        let retParseCommonChartInfo = parseCommonChartInfo(
            yaml.line,
            renderInfo.line
        );
        if (typeof retParseCommonChartInfo === "string") {
            return retParseCommonChartInfo;
        }

        // lineColor
        let retLineColor = getStringArrayFromInput(
            "lineColor",
            yaml?.line?.lineColor,
            numDatasets,
            "",
            validateColor,
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
            yaml?.line?.lineWidth,
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
            yaml?.line?.showLine,
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
            yaml?.line?.showPoint,
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
            yaml?.line?.pointColor,
            numDatasets,
            "#69b3a2",
            validateColor,
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
            yaml?.line?.pointBorderColor,
            numDatasets,
            "#69b3a2",
            validateColor,
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
            yaml?.line?.pointBorderWidth,
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
            yaml?.line?.pointSize,
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
            yaml?.line?.fillGap,
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
            yaml?.line?.yAxisLocation,
            numDatasets,
            "left",
            validateYAxisLocation,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        renderInfo.line.yAxisLocation = retYAxisLocation;
        // console.log(renderInfo.line.yAxisLocation);
    } // line related parameters
    if (renderInfo.output === OutputType.Bar) {
        renderInfo.bar = new BarInfo();

        if (yaml.bar !== null) {
            let keysOfBarInfo = getAvailableKeysOfClass(renderInfo.bar);
            let keysFoundInYAML = getAvailableKeysOfClass(yaml.bar);
            // console.log(keysOfBarInfo);
            // console.log(keysFoundInYAML);
            for (let key of keysFoundInYAML) {
                if (!keysOfBarInfo.includes(key)) {
                    errorMessage = "'" + key + "' is not an available key";
                    return errorMessage;
                }
            }
        }

        let retParseCommonChartInfo = parseCommonChartInfo(
            yaml.bar,
            renderInfo.bar
        );
        if (typeof retParseCommonChartInfo === "string") {
            return retParseCommonChartInfo;
        }

        // barColor
        let retBarColor = getStringArrayFromInput(
            "barColor",
            yaml?.bar?.barColor,
            numDatasets,
            "",
            validateColor,
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
            yaml?.bar?.yAxisLocation,
            numDatasets,
            "left",
            validateYAxisLocation,
            true
        );
        if (typeof retYAxisLocation === "string") {
            return retYAxisLocation; // errorMessage
        }
        renderInfo.bar.yAxisLocation = retYAxisLocation;
        // console.log(renderInfo.bar.yAxisLocation);
    } // bar related parameters
    // summary related parameters
    if (renderInfo.output === OutputType.Summary) {
        renderInfo.summary = new SummaryInfo();

        if (yaml.summary !== null) {
            let keysOfSummaryInfo = getAvailableKeysOfClass(renderInfo.summary);
            let keysFoundInYAML = getAvailableKeysOfClass(yaml.summary);
            // console.log(keysOfSummaryInfo);
            // console.log(keysFoundInYAML);
            for (let key of keysFoundInYAML) {
                if (!keysOfSummaryInfo.includes(key)) {
                    errorMessage = "'" + key + "' is not an available key";
                    return errorMessage;
                }
            }
        }

        if (yaml.summary !== null) {
            // template
            if (typeof yaml.summary.template === "string") {
                renderInfo.summary.template = yaml.summary.template;
            }
            if (typeof yaml.summary.style === "string") {
                renderInfo.summary.style = yaml.summary.style;
            }
        }
    } // summary related parameters

    return renderInfo;
}
