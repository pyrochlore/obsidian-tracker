import { RenderInfo, Size } from "./data";
import { TFile, TFolder, normalizePath } from "obsidian";
import { ValueType } from "./data";
import * as d3 from "d3";

const timeFormat = [
    "HH:mm",
    "HH:m",
    "H:mm",
    "H:m",
    "hh:mm A",
    "hh:mm a",
    "hh:m A",
    "hh:m a",
    "h:mm A",
    "h:mm a",
    "h:m A",
    "h:m a",
];

// http://jsfiddle.net/alnitak/hEsys/
export function deepValue(obj: any, str: string) {
    str = str.replace(/^\./, "");
    var a = str.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in obj) {
            obj = obj[k];
        } else {
            return;
        }
    }
    return obj;
}

// String helpers
export function trimByChar(str: string, char: string) {
    const arr = Array.from(str);
    const first = arr.findIndex((c) => c !== char);
    const last = arr.reverse().findIndex((c) => c !== char);
    return first === -1 && last === -1
        ? str
        : str.substring(first, str.length - last);
}

export function getDateFromFilename(file: TFile, renderInfo: RenderInfo) {
    let fileBaseName = file.basename;

    if (
        renderInfo.dateFormatPrefix &&
        fileBaseName.startsWith(renderInfo.dateFormatPrefix)
    ) {
        fileBaseName = fileBaseName.slice(renderInfo.dateFormatPrefix.length);
    }
    if (
        renderInfo.dateFormatSuffix &&
        fileBaseName.endsWith(renderInfo.dateFormatSuffix)
    ) {
        fileBaseName = fileBaseName.slice(
            0,
            fileBaseName.length - renderInfo.dateFormatSuffix.length
        );
    }
    // console.log(fileBaseName);

    let fileDate = window.moment(fileBaseName, renderInfo.dateFormat, true);
    // console.log(fileDate);

    return fileDate;
}

// Parsing
export function parseFloatFromAny(toParse: any) {
    let value = null;
    let valueType = ValueType.Number;
    if (typeof toParse === "string") {
        // time value
        if (toParse.includes(":")) {
            let negativeValue = false;
            if (toParse.startsWith("-")) {
                negativeValue = true;
                toParse = toParse.substring(1);
            }
            let timeValue = window.moment(toParse, timeFormat, true);
            if (timeValue.isValid()) {
                value = timeValue.diff(
                    window.moment("00:00", "HH:mm", true),
                    "seconds"
                );
                if (negativeValue) {
                    value = -1 * value;
                }
                valueType = ValueType.Time;
            }
        } else {
            value = parseFloat(toParse);
        }
    } else if (typeof toParse === "number") {
        value = toParse;
    }

    return { type: valueType, value: value };
}

// Chart helpers
export function measureTextSize(
    text: string,
    styleClass: string = "",
    rotate: string = ""
): Size {
    var container = d3.select("body").append("svg");
    let textBlock = container
        .append("text")
        .text(text)
        .attr("x", -99999)
        .attr("y", -99999);
    if (styleClass) {
        textBlock.attr("class", styleClass);
    }
    if (rotate) {
        textBlock.attr("transform", "rotate(" + rotate + ")");
    }
    var size = container.node().getBBox();
    container.remove();
    return { width: size.width, height: size.height };
}
