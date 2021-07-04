import { RenderInfo } from "./data";
import * as d3 from "d3";
import { Moment } from "moment";
import * as helper from "./helper";

let fnSet = {
    // min value of a dataset
    min: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.min(dataset.getValues());
    },
    // the latest date with min value
    minDate: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let min = d3.min(dataset.getValues());
        if (Number.isNumber(min)) {
            let arrayDataset = Array.from(dataset);
            for (let dataPoint of arrayDataset.reverse()) {
                if (dataPoint.value !== null && dataPoint.value === min) {
                    return helper.dateToStr(
                        dataPoint.date,
                        renderInfo.dateFormat
                    );
                }
            }
        }
        return "min not found";
    },
    // max value of a dataset
    max: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.max(dataset.getValues());
    },
    // the latest date with max value
    maxDate: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let max = d3.max(dataset.getValues());
        if (Number.isNumber(max)) {
            let arrayDataset = Array.from(dataset);
            for (let dataPoint of arrayDataset.reverse()) {
                if (dataPoint.value !== null && dataPoint.value === max) {
                    return helper.dateToStr(
                        dataPoint.date,
                        renderInfo.dateFormat
                    );
                }
            }
        }
        return "max not found";
    },
    // start date of a dataset
    // if datasetId not found, return overall startDate
    startDate: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let startDate = dataset.getStartDate();
            if (startDate && startDate.isValid()) {
                return helper.dateToStr(startDate, renderInfo.dateFormat);
            }
        }
        return helper.dateToStr(renderInfo.startDate, renderInfo.dateFormat);
    },
    // end date of a dataset
    // if datasetId not found, return overall endDate
    endDate: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let endDate = dataset.getEndDate();
            if (endDate && endDate.isValid()) {
                return helper.dateToStr(endDate, renderInfo.dateFormat);
            }
        }
        return helper.dateToStr(renderInfo.endDate, renderInfo.dateFormat);
    },
    // sum of all values in a dataset
    sum: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.sum(dataset.getValues());
    },
    count: function (renderInfo: RenderInfo, datasetId: number) {
        return "deprecated template variable 'count'";
    },
    // number of occurrences of a target in a dataset
    numTargets: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getNumTargets();
    },
    days: function (renderInfo: RenderInfo, datasetId: number) {
        return "deprecated template variable 'days'";
    },
    numDays: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLength();
    },
    numDaysHavingData: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLengthNotNull();
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
            if (streak >= maxStreak) {
                maxStreak = streak;
            }
        }
        return maxStreak;
    },
    maxStreakStart: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxStreak = 0;
        let streakStart: Moment = null;
        let maxStreakStart: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            for (let dataPoint of dataset) {
                if (dataPoint.value !== null) {
                    if (streak === 0) {
                        streakStart = dataPoint.date;
                    }
                    streak++;
                } else {
                    streak = 0;
                }
                if (streak >= maxStreak) {
                    maxStreak = streak;
                    maxStreakStart = streakStart;
                }
            }
        }
        return helper.dateToStr(maxStreakStart, renderInfo.dateFormat);
    },
    maxStreakEnd: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxStreak = 0;
        let streakEnd: Moment = null;
        let maxStreakEnd: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = 0; ind < arrayDataset.length; ind++) {
                let point = arrayDataset[ind];
                let nextPoint = null;
                if (ind < arrayDataset.length - 1) {
                    nextPoint = arrayDataset[ind + 1];
                }
                if (point.value !== null) {
                    streak++;
                    if (nextPoint?.value === null) {
                        streakEnd = point.date;
                    }
                } else {
                    streak = 0;
                }
                if (streak >= maxStreak) {
                    // console.log(streak);
                    // console.log(maxStreak);
                    maxStreak = streak;
                    maxStreakEnd = streakEnd;
                }
            }
        }
        return helper.dateToStr(maxStreakEnd, renderInfo.dateFormat);
    },
    maxBreaks: function (renderInfo: RenderInfo, datasetId: number) {
        let breaks = 0;
        let maxBreaks = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);

        for (let dataPoint of dataset) {
            if (dataPoint.value === null) {
                breaks++;
            } else {
                breaks = 0;
            }
            if (breaks > maxBreaks) {
                maxBreaks = breaks;
            }
        }
        return maxBreaks;
    },
    maxBreaksStart: function (renderInfo: RenderInfo, datasetId: number) {
        let breaks = 0;
        let maxBreaks = 0;
        let breaksStart: Moment = null;
        let maxBreaksStart: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            for (let dataPoint of dataset) {
                if (dataPoint.value === null) {
                    if (breaks === 0) {
                        breaksStart = dataPoint.date;
                    }
                    breaks++;
                } else {
                    breaks = 0;
                }
                if (breaks >= maxBreaks) {
                    maxBreaks = breaks;
                    maxBreaksStart = breaksStart;
                }
            }
        }
        return helper.dateToStr(maxBreaksStart, renderInfo.dateFormat);
    },
    maxBreaksEnd: function (renderInfo: RenderInfo, datasetId: number) {
        let breaks = 0;
        let maxBreaks = 0;
        let breaksEnd: Moment = null;
        let maxBreaksEnd: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = 0; ind < arrayDataset.length; ind++) {
                let point = arrayDataset[ind];
                let nextPoint = null;
                if (ind < arrayDataset.length - 1) {
                    nextPoint = arrayDataset[ind + 1];
                }
                if (point.value === null) {
                    breaks++;
                    if (nextPoint?.value !== null) {
                        breaksEnd = point.date;
                    }
                } else {
                    breaks = 0;
                }
                if (breaks >= maxBreaks) {
                    maxBreaks = breaks;
                    maxBreaksEnd = breaksEnd;
                }
            }
        }
        return helper.dateToStr(maxBreaksEnd, renderInfo.dateFormat);
    },
    lastStreak: function (renderInfo: RenderInfo, datasetId: number) {
        return "deprecated template variable 'lastStreak'";
    },
    currentStreak: function (renderInfo: RenderInfo, datasetId: number) {
        let currentStreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (point.value === null) {
                    break;
                } else {
                    currentStreak++;
                }
            }
        }
        return currentStreak;
    },
    currentStreakStart: function (renderInfo: RenderInfo, datasetId: number) {
        let currentStreak = 0;
        let currentStreakStart: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (ind < arrayDataset.length - 1) {
                    currentStreakStart = arrayDataset[ind + 1].date;
                }
                if (point.value === null) {
                    break;
                } else {
                    currentStreak++;
                }
            }
        }

        if (currentStreakStart === null) {
            return "absense";
        }
        return helper.dateToStr(currentStreakStart, renderInfo.dateFormat);
    },
    currentStreakEnd: function (renderInfo: RenderInfo, datasetId: number) {
        let currentStreak = 0;
        let currentStreakEnd: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (point.value === null) {
                    break;
                } else {
                    if (currentStreak === 0) {
                        currentStreakEnd = point.date;
                    }
                    currentStreak++;
                }
            }
        }

        if (currentStreakEnd === null) {
            return "absense";
        }
        return helper.dateToStr(currentStreakEnd, renderInfo.dateFormat);
    },
    currentBreaks: function (renderInfo: RenderInfo, datasetId: number) {
        let currentBreaks = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (point.value === null) {
                    currentBreaks++;
                } else {
                    break;
                }
            }
        }
        return currentBreaks;
    },
    currentBreaksStart: function (renderInfo: RenderInfo, datasetId: number) {
        let currentBreaks = 0;
        let currentBreaksStart: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (ind < arrayDataset.length - 1) {
                    currentBreaksStart = arrayDataset[ind + 1].date;
                }
                if (point.value === null) {
                    currentBreaks++;
                } else {
                    break;
                }
            }
        }

        if (currentBreaksStart === null) {
            return "absense";
        }
        return helper.dateToStr(currentBreaksStart, renderInfo.dateFormat);
    },
    currentBreaksEnd: function (renderInfo: RenderInfo, datasetId: number) {
        let currentBreaks = 0;
        let currentBreaksEnd: Moment = null;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (point.value === null) {
                    if (currentBreaks === 0) {
                        currentBreaksEnd = point.date;
                    }
                    currentBreaks++;
                } else {
                    break;
                }
            }
        }

        if (currentBreaksEnd === null) {
            return "absense";
        }
        return helper.dateToStr(currentBreaksEnd, renderInfo.dateFormat);
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
    //console.log("resolveTemplate");
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
                            if (typeof result === "number") {
                                if (Number.isInteger(result)) {
                                    strResult = result.toFixed(0);
                                } else {
                                    strResult = result.toFixed(2);
                                }
                            } else if (typeof result === "string") {
                                strResult = result;
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
                    } else if (typeof result === "string") {
                        strResult = result;
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
