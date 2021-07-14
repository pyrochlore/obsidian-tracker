import { RenderInfo, Dataset } from "./data";
import * as d3 from "d3";
import { Moment } from "moment";
import * as helper from "./helper";
import jsep from "jsep";
import sprintf from "sprintf-js";

// Function accept datasetId as first argument
type FnDatasetToValue = (
    dataset: Dataset,
    renderInfo: RenderInfo
) => number | string;
type FnDatasetToDataset = (dataset: Dataset, renderInfo: RenderInfo) => Dataset;
type FnBinaryOp = (
    l: number | Dataset,
    r: number | Dataset
) => number | Dataset;

interface FnMapDatasetToValue {
    [key: string]: FnDatasetToValue;
}

interface FnMapDatasetToDataset {
    [key: string]: FnDatasetToDataset;
}

interface FnMapBinaryOp {
    [key: string]: FnBinaryOp;
}

const fnMapDatasetToValue: FnMapDatasetToValue = {
    // min value of a dataset
    min: function (dataset, renderInfo) {
        return d3.min(dataset.getValues());
    },
    // the latest date with min value
    minDate: function (dataset, renderInfo) {
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
    max: function (dataset, renderInfo) {
        return d3.max(dataset.getValues());
    },
    // the latest date with max value
    maxDate: function (dataset, renderInfo) {
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
    startDate: function (dataset, renderInfo) {
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
    endDate: function (dataset, renderInfo) {
        if (dataset) {
            let endDate = dataset.getEndDate();
            if (endDate && endDate.isValid()) {
                return helper.dateToStr(endDate, renderInfo.dateFormat);
            }
        }
        return helper.dateToStr(renderInfo.endDate, renderInfo.dateFormat);
    },
    // sum of all values in a dataset
    sum: function (dataset, renderInfo) {
        return d3.sum(dataset.getValues());
    },
    count: function (dataset, renderInfo) {
        return "deprecated template variable 'count'";
    },
    // number of occurrences of a target in a dataset
    numTargets: function (dataset, renderInfo) {
        return dataset.getNumTargets();
    },
    days: function (dataset, renderInfo) {
        return "deprecated template variable 'days'";
    },
    numDays: function (dataset, renderInfo) {
        return dataset.getLength();
    },
    numDaysHavingData: function (dataset, renderInfo) {
        return dataset.getLengthNotNull();
    },
    maxStreak: function (dataset, renderInfo) {
        let streak = 0;
        let maxStreak = 0;
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
    maxStreakStart: function (dataset, renderInfo) {
        let streak = 0;
        let maxStreak = 0;
        let streakStart: Moment = null;
        let maxStreakStart: Moment = null;
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
    maxStreakEnd: function (dataset, renderInfo) {
        let streak = 0;
        let maxStreak = 0;
        let streakEnd: Moment = null;
        let maxStreakEnd: Moment = null;
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
    maxBreaks: function (dataset, renderInfo) {
        let breaks = 0;
        let maxBreaks = 0;
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
    maxBreaksStart: function (dataset, renderInfo) {
        let breaks = 0;
        let maxBreaks = 0;
        let breaksStart: Moment = null;
        let maxBreaksStart: Moment = null;
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
    maxBreaksEnd: function (dataset, renderInfo) {
        let breaks = 0;
        let maxBreaks = 0;
        let breaksEnd: Moment = null;
        let maxBreaksEnd: Moment = null;
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
    lastStreak: function (dataset, renderInfo) {
        return "deprecated template variable 'lastStreak'";
    },
    currentStreak: function (dataset, renderInfo) {
        let currentStreak = 0;
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
    currentStreakStart: function (dataset, renderInfo) {
        let currentStreak = 0;
        let currentStreakStart: Moment = null;
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
    currentStreakEnd: function (dataset, renderInfo) {
        let currentStreak = 0;
        let currentStreakEnd: Moment = null;
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
    currentBreaks: function (dataset, renderInfo) {
        let currentBreaks = 0;
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
    currentBreaksStart: function (dataset, renderInfo) {
        let currentBreaks = 0;
        let currentBreaksStart: Moment = null;
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
    currentBreaksEnd: function (dataset, renderInfo) {
        let currentBreaks = 0;
        let currentBreaksEnd: Moment = null;
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
    average: function (dataset, renderInfo) {
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    median: function (dataset, renderInfo) {
        return d3.median(dataset.getValues());
    },
    variance: function (dataset, renderInfo) {
        return d3.variance(dataset.getValues());
    },
};

const fnMapBinaryOp: FnMapBinaryOp = {
    "+": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number

            return l + r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = l + value;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value + r;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value + r.getValues()[index];
            });
            return tmpDataset;
        }
        return null;
    },
    "-": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l - r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = l - value;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value - r;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value - r.getValues()[index];
            });
            return tmpDataset;
        }
        return null;
    },
    "*": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l * r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = l * value;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value * r;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value * r.getValues()[index];
            });
            return tmpDataset;
        }
        return null;
    },
    "/": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l / r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = l / value;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value / r;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value / r.getValues()[index];
            });
            return tmpDataset;
        }
        return null;
    },
    "%": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l % r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = l % value;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value % r;
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                array[index] = value % r.getValues()[index];
            });
            return tmpDataset;
        }
        return null;
    },
};

const fnMapDatasetToDataset: FnMapDatasetToDataset = {
    // min value of a dataset
    normalize: function (dataset, renderInfo) {
        let yMin = dataset.getYMin();
        let yMax = dataset.getYMax();
        if (yMax > yMin) {
            let normalized = dataset.cloneToTmpDataset();
            normalized.getValues().forEach(function (value, index, array) {
                array[index] = (value - yMin) / (yMax - yMin);
            });
        }
        return dataset;
    },
};

function getDatasetById(datasetId: number, renderInfo: RenderInfo) {
    return renderInfo.datasets.getDatasetById(datasetId);
}

function evaluateArray(arr: any, renderInfo: RenderInfo) {
    return arr.map(function (expr: jsep.Expression) {
        return evaluate(expr, renderInfo);
    });
}

function evaluate(expr: jsep.Expression, renderInfo: RenderInfo): any {
    // console.log(expr);

    switch (expr.type) {
        case "Literal":
            let literalExpr = expr as jsep.Literal;
            return literalExpr.value; // string, number, boolean

        case "BinaryExpression":
            let binaryExpr = expr as jsep.BinaryExpression;
            let leftValue = evaluate(binaryExpr.left, renderInfo);
            let rightValue = evaluate(binaryExpr.right, renderInfo);
            return fnMapBinaryOp[binaryExpr.operator](leftValue, rightValue);

        case "CallExpression":
            let callExpr = expr as jsep.CallExpression;

            let calleeIdentifier = callExpr.callee as jsep.Identifier;
            let fnName = calleeIdentifier.name;
            let args = callExpr.arguments;
            // console.log(fnName);
            // console.log(args);
            let evaluatedArgs = evaluateArray(args, renderInfo);

            // function dataset accept only one arg in number
            if (fnName === "dataset") {
                if (evaluatedArgs.length === 1) {
                    return getDatasetById(evaluatedArgs[0], renderInfo);
                }
            }

            // fnDataset accept only one arg in number or Dataset
            if (fnName in fnMapDatasetToValue) {
                if (evaluatedArgs.length === 0) {
                    // Use first non-X dataset
                    let dataset = null;
                    for (let ds of renderInfo.datasets) {
                        if (!dataset && !ds.getQuery().usedAsXDataset) {
                            dataset = ds;
                            // if breaks here, the index of Datasets not reset???
                        }
                    }
                    if (dataset) {
                        return fnMapDatasetToValue[fnName](dataset, renderInfo);
                    }
                }
                if (evaluatedArgs.length === 1) {
                    return fnMapDatasetToValue[fnName](
                        evaluatedArgs[0],
                        renderInfo
                    );
                }
                return null;
            }

            if (fnName in fnMapDatasetToDataset) {
                if (evaluatedArgs.length === 1) {
                    return fnMapDatasetToDataset[fnName](
                        evaluatedArgs[0],
                        renderInfo
                    );
                }
            }

            return null;
    }
    return "Error evaluating expression";
}

export function resolve(str: string, renderInfo: RenderInfo) {
    // console.log(s);

    let exprMap: { [key: string]: string } = {};

    // {{[\w+\-*\/0-9\s()\[\]]+}}
    let strExprRegex = "{{[\\w+\\-*\\/0-9\\s()\\[\\]%]+}}";
    let exprRegex = new RegExp(strExprRegex, "gm");
    let match;
    while ((match = exprRegex.exec(str))) {
        let fullmatch = match[0];
        // console.log(match);
        let strExpr = fullmatch.substring(2, fullmatch.length - 2);
        // console.log(strExpr);

        if (!(fullmatch in exprMap)) {
            const ast = jsep(strExpr);
            // console.log(ast);

            const value = evaluate(ast, renderInfo);
            if (typeof value === "string") {
                exprMap[fullmatch] = value;
            } else if (typeof value === "number") {
                exprMap[fullmatch] = value.toString();
            }
        }
    }

    for (let fullmatch in exprMap) {
        let strValue = exprMap[fullmatch];
        str = str.replaceAll(fullmatch, strValue);
    }

    return str;
}

export function resolveTemplate(str: string, renderInfo: RenderInfo): string {
    // console.log(str);
    let retResolve = resolve(str, renderInfo);
    return retResolve;
}

export function resolveValue(
    str: string,
    renderInfo: RenderInfo
): number | string {
    // console.log(str);
    str = str.trim();
    let value = null;
    if (str.startsWith("{{") && str.endsWith("}}")) {
        let retResolve = resolve(str, renderInfo);
        value = parseFloat(retResolve);
    } else {
        value = parseFloat(str);
    }
    if (Number.isNumber(value) && !Number.isNaN(value)) {
        return value;
    }
    return "Error resolving values";
}
