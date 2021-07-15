import { RenderInfo, Dataset } from "./data";
import * as d3 from "d3";
import { isMoment, Moment } from "moment";
import * as helper from "./helper";
import jsep from "jsep";
import { sprintf } from "sprintf-js";

// Function accept datasetId as first argument
type FnDatasetToValue = (
    dataset: Dataset,
    renderInfo: RenderInfo
) => number | Moment | string;
type FnDatasetToDataset = (dataset: Dataset, renderInfo: RenderInfo) => Dataset;
type FnBinaryOp = (
    l: number | Moment | Dataset,
    r: number | Moment | Dataset
) => number | Moment | Dataset | string;

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
        // return number
        return d3.min(dataset.getValues());
    },
    // the latest date with min value
    minDate: function (dataset, renderInfo) {
        // return Moment
        let min = d3.min(dataset.getValues());
        if (Number.isNumber(min)) {
            let arrayDataset = Array.from(dataset);
            for (let dataPoint of arrayDataset.reverse()) {
                if (dataPoint.value !== null && dataPoint.value === min) {
                    return dataPoint.date;
                }
            }
        }
        return "Error evaluating: min not found";
    },
    // max value of a dataset
    max: function (dataset, renderInfo) {
        // return number
        return d3.max(dataset.getValues());
    },
    // the latest date with max value
    maxDate: function (dataset, renderInfo) {
        // return Moment
        let max = d3.max(dataset.getValues());
        if (Number.isNumber(max)) {
            let arrayDataset = Array.from(dataset);
            for (let dataPoint of arrayDataset.reverse()) {
                if (dataPoint.value !== null && dataPoint.value === max) {
                    return dataPoint.date;
                }
            }
        }
        return "Error evaluating: max not found";
    },
    // start date of a dataset
    // if datasetId not found, return overall startDate
    startDate: function (dataset, renderInfo) {
        // return Moment
        if (dataset) {
            let startDate = dataset.getStartDate();
            if (startDate && startDate.isValid()) {
                return startDate;
            }
        }
        return renderInfo.startDate;
    },
    // end date of a dataset
    // if datasetId not found, return overall endDate
    endDate: function (dataset, renderInfo) {
        // return Moment
        if (dataset) {
            let endDate = dataset.getEndDate();
            if (endDate && endDate.isValid()) {
                return endDate;
            }
        }
        return renderInfo.endDate;
    },
    // sum of all values in a dataset
    sum: function (dataset, renderInfo) {
        // return number
        return d3.sum(dataset.getValues());
    },
    count: function (dataset, renderInfo) {
        return "Error evaluating: deprecated function 'count'";
    },
    // number of occurrences of a target in a dataset
    numTargets: function (dataset, renderInfo) {
        // return number
        return dataset.getNumTargets();
    },
    days: function (dataset, renderInfo) {
        return "Error evaluating: deprecated function 'days'";
    },
    numDays: function (dataset, renderInfo) {
        // return number
        return dataset.getLength();
    },
    numDaysHavingData: function (dataset, renderInfo) {
        // return number
        return dataset.getLengthNotNull();
    },
    maxStreak: function (dataset, renderInfo) {
        // return number
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
        // return Moment
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
        return maxStreakStart;
    },
    maxStreakEnd: function (dataset, renderInfo) {
        // return Moment
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
        return maxStreakEnd;
    },
    maxBreaks: function (dataset, renderInfo) {
        // return number
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
        // return Moment
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
        return maxBreaksStart;
    },
    maxBreaksEnd: function (dataset, renderInfo) {
        // return Moment
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
        return maxBreaksEnd;
    },
    lastStreak: function (dataset, renderInfo) {
        return "Error evaluating: deprecated function 'lastStreak'";
    },
    currentStreak: function (dataset, renderInfo) {
        // return number
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
        // return Moment
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
            return "Error evaluating: absense";
        }
        return currentStreakStart;
    },
    currentStreakEnd: function (dataset, renderInfo) {
        // return Moment
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
            return "Error evaluating: absense";
        }
        return currentStreakEnd;
    },
    currentBreaks: function (dataset, renderInfo) {
        // return number
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
        // return Moment
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
            return "Error evaluating: absense";
        }
        return currentBreaksStart;
    },
    currentBreaksEnd: function (dataset, renderInfo) {
        // return Moment
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
            return "Error evaluating: absense";
        }
        return currentBreaksEnd;
    },
    average: function (dataset, renderInfo) {
        // return number
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return "Error evaluating: divide by zero";
    },
    median: function (dataset, renderInfo) {
        // return number
        return d3.median(dataset.getValues());
    },
    variance: function (dataset, renderInfo) {
        // return number
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
        return "Error evaluating:";
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
        return "Error evaluating:";
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
        return "Error evaluating:";
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
        return "Error evaluating:";
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
        return "Error evaluating:";
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
                return "Error evaluating:";
            }

            if (fnName in fnMapDatasetToDataset) {
                if (evaluatedArgs.length === 1) {
                    return fnMapDatasetToDataset[fnName](
                        evaluatedArgs[0],
                        renderInfo
                    );
                }
            }

            return "Error evaluating:";
    }
    return "Error evaluating expression";
}

interface ExprResolved {
    source: string;
    value: number | Moment;
    format: string;
}

// Get a list of resolved result containing source, value, and format
function resolve(
    text: string,
    renderInfo: RenderInfo
): Array<ExprResolved> | string {
    // console.log(text);

    let exprMap: Array<ExprResolved> = [];

    // {{(?<expr>[\w+\-*\/0-9\s()\[\]%.]+)(::(?<format>[\w+\-*\/0-9\s()\[\]%.:]+))?}}
    let strExprRegex =
        "{{(?<expr>[\\w+\\-*\\/0-9\\s()\\[\\]%.]+)(::(?<format>[\\w+\\-*\\/0-9\\s()\\[\\]%.:]+))?}}";
    let exprRegex = new RegExp(strExprRegex, "gm");
    let match;
    while ((match = exprRegex.exec(text))) {
        let fullmatch = match[0];
        if (exprMap.some((e) => e.source === fullmatch)) continue;

        if (typeof match.groups !== "undefined") {
            if (typeof match.groups.expr !== "undefined") {
                let expr = match.groups.expr;

                const ast = jsep(expr);
                // console.log(ast);
                const value = evaluate(ast, renderInfo);
                if (typeof value === "string") {
                    return value; // error message
                }

                if (
                    typeof value === "number" ||
                    window.moment.isMoment(value)
                ) {
                    let format = null;
                    if (typeof match.groups.format !== "undefined") {
                        format = match.groups.format;
                    }

                    exprMap.push({
                        source: fullmatch,
                        value: value,
                        format: format,
                    });
                }
            }
        }
    }

    return exprMap;
}

// Resolve the template expression in string and return a resolved string
export function resolveTemplate(
    template: string,
    renderInfo: RenderInfo
): string {
    let retResolve = resolve(template, renderInfo);
    if (typeof retResolve === "string") {
        return retResolve; // error message
    }
    let exprMap = retResolve as Array<ExprResolved>;

    for (let exprResolved of exprMap) {
        let value = exprResolved.value;
        let format = exprResolved.format;
        let strValue = "";
        if (typeof value === "number") {
            if (format) {
                strValue = sprintf("%" + format, value);
            } else {
                strValue = value.toFixed(1);
            }
        } else if (window.moment.isMoment(value)) {
            if (format) {
                strValue = helper.dateToStr(value, format);
            } else {
                strValue = helper.dateToStr(value, renderInfo.dateFormat);
            }
        }

        if (strValue) {
            template = template.replaceAll(exprResolved.source, strValue);
        }
    }

    return template;
}

// Resolve the template expression in string and return a number or date
export function resolveValue(
    text: string,
    renderInfo: RenderInfo
): number | Moment | string {
    // console.log(template);
    text = text.trim();

    // input is pure number
    if (/^([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)$/.test(text)) {
        return parseFloat(text);
    }

    // template
    let retResolve = resolve(text, renderInfo);
    if (typeof retResolve === "string") {
        return retResolve; // error message
    }
    let exprMap = retResolve as Array<ExprResolved>;

    if (exprMap.length > 0) {
        return exprMap[0].value; // only first value will be return
    }

    return "Error resolving values";
}
