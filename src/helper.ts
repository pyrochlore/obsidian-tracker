import { RenderInfo, Size } from "./data";
import { TFile, TFolder, normalizePath } from "obsidian";
import * as d3 from "d3";

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
