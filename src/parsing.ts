import Tracker from "./main";
import { RenderInfo, SummaryInfo } from "./graph";
import { TFolder, normalizePath } from "obsidian";
import * as Yaml from "yaml";
import { getDailyNoteSettings } from "obsidian-daily-notes-interface";

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

    // Search type
    let searchType = "";
    if (yaml.searchType === "tag" || yaml.searchType === "text") {
        searchType = yaml.searchType;
    } else {
        let errorMessage =
            "Invalid search type (searchType), choose 'tag' or 'text'";
        return errorMessage;
    }
    // console.log(searchType);

    // Search target
    let searchTarget = "";
    if (typeof yaml.searchTarget === "string" && yaml.searchTarget !== "") {
        if (yaml.searchType === "tag") {
            if (
                yaml.searchTarget.startsWith("#") &&
                yaml.searchTarget.length > 2
            ) {
                searchTarget = yaml.searchTarget.substring(1);
            } else {
                searchTarget = yaml.searchTarget;
            }
        } else {
            // yaml.searchType === "text"
            searchTarget = yaml.searchTarget;
        }
    } else {
        let errorMessage = "Invalid search target (searchTarget)";
        return errorMessage;
    }
    // console.log(searchTarget);

    // Create grarph info
    let renderInfo = new RenderInfo(searchType, searchTarget);

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
    if (typeof yaml.constValue === "number") {
        renderInfo.constValue = yaml.constValue;
    }

    // ignoreAttachedValue
    if (typeof yaml.ignoreAttachedValue === "boolean") {
        renderInfo.ignoreAttachedValue = yaml.ignoreAttachedValue;
    }

    // ignoreZeroValue
    if (typeof yaml.ignoreZeroValue === "boolean") {
        renderInfo.ignoreZeroValue = yaml.ignoreZeroValue;
    }

    // accum
    if (typeof yaml.accum === "boolean") {
        renderInfo.accum = yaml.accum;
    }
    // console.log(renderInfo.accum);

    // penalty
    if (typeof yaml.penalty === "number") {
        renderInfo.penalty = yaml.penalty;
    }
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
        // yAxisLabel
        if (typeof yaml.line.yAxisLabel === "string") {
            renderInfo.line.yAxisLabel = yaml.line.yAxisLabel;
        }
        // labelColor
        if (typeof yaml.line.labelColor === "string") {
            renderInfo.line.labelColor = yaml.line.labelColor;
        }
        // yAxisUnit
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
        if (typeof yaml.line.lineColor === "string") {
            renderInfo.line.lineColor = yaml.line.lineColor;
        }
        // lineWidth
        if (typeof yaml.line.lineWidth === "number") {
            renderInfo.line.lineWidth = yaml.line.lineWidth;
        }
        // showLine
        if (typeof yaml.line.showLine === "boolean") {
            renderInfo.line.showLine = yaml.line.showLine;
        }
        // showPoint
        if (typeof yaml.line.showPoint === "boolean") {
            renderInfo.line.showPoint = yaml.line.showPoint;
        }
        // pointColor
        if (typeof yaml.line.pointColor === "string") {
            renderInfo.line.pointColor = yaml.line.pointColor;
        }
        // pointBorderColor
        if (typeof yaml.line.pointBorderColor === "string") {
            renderInfo.line.pointBorderColor = yaml.line.pointBorderColor;
        }
        // pointBorderWidth
        if (typeof yaml.line.pointBorderWidth === "number") {
            renderInfo.line.pointBorderWidth = yaml.line.pointBorderWidth;
        }
        // pointSize
        if (typeof yaml.line.pointSize === "number") {
            renderInfo.line.pointSize = yaml.line.pointSize;
        }
        // allowInspectData
        if (typeof yaml.line.allowInspectData === "boolean") {
            renderInfo.line.allowInspectData = yaml.line.allowInspectData;
        }
        // fillGap
        if (typeof yaml.line.fillGap === "boolean") {
            renderInfo.line.fillGap = yaml.line.fillGap;
        }
        // console.log(renderInfo.line.fillGap)
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
