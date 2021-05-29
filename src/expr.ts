import { RenderInfo } from "./data";
import * as d3 from "d3";

let fnSet = {
    min: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.min(dataset.getValues());
    },
    max: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.max(dataset.getValues());
    },
    sum: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.sum(dataset.getValues());
    },
    count: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLengthNotNull();
    },
    days: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let result = dataset.getLength();
        return result;
    },
    maxStreak: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxStreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        for (let dataPoint of dataset) {
            if (dataPoint.value !== null) {
                streak++;
            } else {
                streak = 0;
            }
            if (streak > maxStreak) {
                maxStreak = streak;
            }
        }
        return maxStreak;
    },
    maxBreaks: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxBreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);

        for (let dataPoint of dataset) {
            if (dataPoint.value === null) {
                streak++;
            } else {
                streak = 0;
            }
            if (streak > maxBreak) {
                maxBreak = streak;
            }
        }
        return maxBreak;
    },
    lastStreak: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let values = dataset.getValues();
        for (let ind = values.length - 1; ind >= 0; ind--) {
            let value = values[ind];
            if (value === null) {
                break;
            } else {
                streak++;
            }
        }
        return streak;
    },
    lastBreaks: function (renderInfo: RenderInfo, datasetId: number) {
        let breakDays = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let values = dataset.getValues();
        for (let ind = values.length - 1; ind >= 0; ind--) {
            let value = values[ind];
            if (value === null) {
                breakDays++;
            } else {
                break;
            }
        }
        return breakDays;
    },
    average: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    median: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.median(dataset.getValues());
    },
    variance: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.variance(dataset.getValues());
    },
};

export function resolveTemplate(template: string, renderInfo: RenderInfo) {
    let replaceMap: { [key: string]: string } = {};
    // Loop over fnSet, prepare replaceMap
    Object.entries(fnSet).forEach(([fnName, fn]) => {
        // {{\s*max(\(\s*Dataset\(\s*(?<datasetId>\d+)\s*\)\s*\))?\s*}}
        let strRegex =
            "{{\\s*" +
            fnName +
            "(\\(\\s*Dataset\\(\\s*((?<datasetId>\\d+)|(?<datasetName>\\w+))\\s*\\)\\s*\\))?\\s*}}";
        // console.log(strRegex);
        let regex = new RegExp(strRegex, "gm");
        let match;
        while ((match = regex.exec(template))) {
            // console.log(match);
            if (typeof match.groups !== "undefined") {
                if (typeof match.groups.datasetId !== "undefined") {
                    let datasetId = parseInt(match.groups.datasetId);
                    // console.log(datasetId);
                    if (Number.isInteger(datasetId)) {
                        let strReplaceRegex =
                            "{{\\s*" +
                            fnName +
                            "(\\(\\s*Dataset\\(\\s*" +
                            datasetId.toString() +
                            "\\s*\\)\\s*\\))?\\s*}}";

                        if (!(strReplaceRegex in replaceMap)) {
                            let result = fn(renderInfo, datasetId); // calculate result
                            let strResult = "{{NA}}";
                            if (
                                typeof result !== "undefined" &&
                                result !== null
                            ) {
                                if (Number.isInteger(result)) {
                                    strResult = result.toFixed(0);
                                } else {
                                    strResult = result.toFixed(2);
                                }
                            }

                            replaceMap[strReplaceRegex] = strResult;
                        }
                    }
                } else if (typeof match.groups.datasetName !== "undefined") {
                    let datasetName = match.groups.datasetName;
                    // console.log(datasetName);
                    let strReplaceRegex =
                        "{{\\s*" +
                        fnName +
                        "(\\(\\s*Dataset\\(\\s*" +
                        datasetName +
                        "\\s*\\)\\s*\\))?\\s*}}";

                    let datasetId = renderInfo.datasetName.indexOf(datasetName);
                    // console.log(datasetName);
                    // console.log(renderInfo.datasetName);
                    // console.log(datasetId);
                    if (!(strReplaceRegex in replaceMap)) {
                        let strResult = "{{NA}}";
                        if (datasetId >= 0) {
                            let result = fn(renderInfo, datasetId); // calculate result
                            if (
                                typeof result !== "undefined" &&
                                result !== null
                            ) {
                                if (Number.isInteger(result)) {
                                    strResult = result.toFixed(0);
                                } else {
                                    strResult = result.toFixed(2);
                                }
                            }
                        }
                        replaceMap[strReplaceRegex] = strResult;
                    }
                } else {
                    // no datasetId assigned use id 0
                    // console.log("{{" + fnName + "}}")
                    let strReplaceRegex = "{{\\s*" + fnName + "\\s*}}";
                    if (!(strReplaceRegex in replaceMap)) {
                        let result = fn(renderInfo, 0); // calculate result
                        let strResult = "{{NA}}";
                        if (typeof result !== "undefined" && result !== null) {
                            if (Number.isInteger(result)) {
                                strResult = result.toFixed(0);
                            } else {
                                strResult = result.toFixed(2);
                            }
                        }

                        replaceMap[strReplaceRegex] = strResult;
                    }
                }
            } else {
                // groups undefined
                // no datasetId assigned use id 0
                // console.log("{{" + fnName + "}}")
                let strReplaceRegex = "{{\\s*" + fnName + "\\s*}}";
                if (!(strReplaceRegex in replaceMap)) {
                    let result = fn(renderInfo, 0); // calculate result
                    let strResult = "{{NA}}";
                    if (typeof result !== "undefined" && result !== null) {
                        if (Number.isInteger(result)) {
                            strResult = result.toFixed(0);
                        } else {
                            strResult = result.toFixed(2);
                        }
                    }

                    replaceMap[strReplaceRegex] = strResult;
                }
            }
        }
    });

    // console.log(replaceMap);
    // Do replace
    for (let strReplaceRegex in replaceMap) {
        let strResult = replaceMap[strReplaceRegex];
        let regex = new RegExp(strReplaceRegex, "gi");
        template = template.replace(regex, strResult);
    }

    return template;
}
