import { RenderInfo } from "./data";
import { TFile, TFolder, normalizePath } from "obsidian";

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
