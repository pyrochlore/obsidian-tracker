import { RenderInfo, Dataset } from "./data";
import * as d3 from "d3";
import { Moment } from "moment";
import * as helper from "./helper";
import jsep from "jsep";

// Function accept datasetId as first argument
type FnDatasetId = (
    datasetId: number,
    renderInfo: RenderInfo
) => number | string;
type FnBinaryOp = (a: number, b: number) => number;

interface FnMapDatasetId {
    [key: string]: FnDatasetId;
}

interface FnMapBinaryOp {
    [key: string]: FnBinaryOp;
}

const fnMapDatasetId: FnMapDatasetId = {
    // min value of a dataset
    min: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.min(dataset.getValues());
    },
    // the latest date with min value
    minDate: function (datasetId: number, renderInfo: RenderInfo) {
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
    max: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.max(dataset.getValues());
    },
    // the latest date with max value
    maxDate: function (datasetId: number, renderInfo: RenderInfo) {
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
    startDate: function (datasetId: number, renderInfo: RenderInfo) {
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
    endDate: function (datasetId: number, renderInfo: RenderInfo) {
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
    sum: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.sum(dataset.getValues());
    },
    count: function (datasetId: number, renderInfo: RenderInfo) {
        return "deprecated template variable 'count'";
    },
    // number of occurrences of a target in a dataset
    numTargets: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getNumTargets();
    },
    days: function (datasetId: number, renderInfo: RenderInfo) {
        return "deprecated template variable 'days'";
    },
    numDays: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLength();
    },
    numDaysHavingData: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLengthNotNull();
    },
    maxStreak: function (datasetId: number, renderInfo: RenderInfo) {
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
    maxStreakStart: function (datasetId: number, renderInfo: RenderInfo) {
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
    maxStreakEnd: function (datasetId: number, renderInfo: RenderInfo) {
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
    maxBreaks: function (datasetId: number, renderInfo: RenderInfo) {
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
    maxBreaksStart: function (datasetId: number, renderInfo: RenderInfo) {
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
    maxBreaksEnd: function (datasetId: number, renderInfo: RenderInfo) {
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
    lastStreak: function (datasetId: number, renderInfo: RenderInfo) {
        return "deprecated template variable 'lastStreak'";
    },
    currentStreak: function (datasetId: number, renderInfo: RenderInfo) {
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
    currentStreakStart: function (datasetId: number, renderInfo: RenderInfo) {
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
    currentStreakEnd: function (datasetId: number, renderInfo: RenderInfo) {
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
    currentBreaks: function (datasetId: number, renderInfo: RenderInfo) {
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
    currentBreaksStart: function (datasetId: number, renderInfo: RenderInfo) {
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
    currentBreaksEnd: function (datasetId: number, renderInfo: RenderInfo) {
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
    average: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    median: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.median(dataset.getValues());
    },
    variance: function (datasetId: number, renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.variance(dataset.getValues());
    },
};

const fnMapBinaryOp: FnMapBinaryOp = {
    "+": function (a: number, b: number) {
        return a + b;
    },
    "-": function (a: number, b: number) {
        return a - b;
    },
    "*": function (a: number, b: number) {
        return a * b;
    },
    "/": function (a: number, b: number) {
        return a / b;
    },
    "%": function (a: number, b: number) {
        return a % b;
    },
};

function evaluate(expr: jsep.Expression, renderInfo: RenderInfo): any {
    // console.log(expr);

    switch (expr.type) {
        // case 'ArrayExpression':
        //     return evaluateArray(node.elements, context);

        case "BinaryExpression":
            let binaryExpr = expr as jsep.BinaryExpression;
            return fnMapBinaryOp[binaryExpr.operator](
                evaluate(binaryExpr.left, renderInfo),
                evaluate(binaryExpr.right, renderInfo)
            );

        case "CallExpression":
            let callExpr = expr as jsep.CallExpression;
            let fnName: string = (callExpr.callee as jsep.Identifier).name;
            let args = callExpr.arguments;

            if (args.length === 1) {
                let arg = args[0];
                if (arg.type === "Literal") {
                    let datasetId = (arg as jsep.Literal).value as number;
                    let fnDatasetId = fnMapDatasetId[fnName];
                    return fnDatasetId(datasetId, renderInfo);
                } else if (arg.type === "CallExpression") {
                }
            }

            return null;

        case "Literal":
            return (expr as jsep.Literal).value;
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
        str = str.replace(fullmatch, strValue);
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
