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
type FnDatasetToDataset = (
    dataset: Dataset,
    args: Array<number | Dataset>,
    renderInfo: RenderInfo
) => Dataset | string;
type FnUniryOp = (
    u: number | Moment | Dataset
) => number | Moment | Dataset | string;
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

interface FnMapUniryOp {
    [key: string]: FnUniryOp;
}

function checkDivisor(divisor: any) {
    // console.log("checking divior");
    if (typeof divisor === "number") {
        if (divisor === 0) return false;
    } else if (divisor instanceof Dataset) {
        if (
            divisor.getValues().some(function (v) {
                return v === 0;
            })
        ) {
            return false;
        }
    }
    return true;
}

function checkBinaryOperantType(left: any, right: any) {
    if (typeof left === "string") return left;
    if (typeof right === "string") return right;
    if (
        typeof left !== "number" &&
        !window.moment.isMoment(left) &&
        !(left instanceof Dataset)
    ) {
        return "Error: invalid operant type";
    }
    if (
        typeof right !== "number" &&
        !window.moment.isMoment(right) &&
        !(right instanceof Dataset)
    ) {
        return "Error: invalide operant type";
    }
    return "";
}

const fnMapDatasetToValue: FnMapDatasetToValue = {
    // first value of a dataset
    first: function (dataset, renderInfo) {
        // return number
        return dataset.getValue(this.startDate(...arguments));
    },
    // last value of a dataset
    last: function (dataset, renderInfo) {
        // return number
        return dataset.getValue(this.endDate(...arguments));
    },
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
        return "Error: min not found";
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
        return "Error: max not found";
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
        return "Error: deprecated function 'count'";
    },
    // number of occurrences of a target in a dataset
    numTargets: function (dataset, renderInfo) {
        // return number
        return dataset.getNumTargets();
    },
    days: function (dataset, renderInfo) {
        return "Error: deprecated function 'days'";
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
            if (dataPoint.value) {
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
                if (dataPoint.value) {
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
                if (point.value) {
                    streak++;
                    if (!nextPoint?.value) {
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
            if (!dataPoint.value) {
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
                if (!dataPoint.value) {
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
                if (!point.value) {
                    breaks++;
                    if (nextPoint?.value) {
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
        return "Error: deprecated function 'lastStreak'";
    },
    currentStreak: function (dataset, renderInfo) {
        // return number
        let currentStreak = 0;
        if (dataset) {
            let arrayDataset = Array.from(dataset);
            for (let ind = arrayDataset.length - 1; ind >= 0; ind--) {
                let point = arrayDataset[ind];
                if (!point.value) {
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
                if (!point.value) {
                    break;
                } else {
                    currentStreak++;
                }
            }
        }

        if (currentStreakStart === null) {
            return "Error: absense";
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
                if (!point.value) {
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
            return "Error: absense";
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
                if (!point.value) {
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
                if (!point.value) {
                    currentBreaks++;
                } else {
                    break;
                }
            }
        }

        if (currentBreaksStart === null) {
            return "Error: absense";
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
                if (!point.value) {
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
            return "Error: absense";
        }
        return currentBreaksEnd;
    },
    average: function (dataset, renderInfo) {
        // return number
        let countNotNull = dataset.getLengthNotNull();
        if (!checkDivisor(countNotNull)) {
            return "Error: divide by zero in expression";
        }
        let sum = d3.sum(dataset.getValues());
        return sum / countNotNull;
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

const fnMapUniryOp: FnMapUniryOp = {
    "-": function (u) {
        if (typeof u === "number") {
            return -1 * u;
        } else if (u instanceof Dataset) {
            let tmpDataset = u.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = -1 * value;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '-'";
    },
    "+": function (u) {
        if (typeof u === "number") {
            return u;
        } else if (u instanceof Dataset) {
            let tmpDataset = u.cloneToTmpDataset();
            return tmpDataset;
        }
        return "Error: unknown operation for '+'";
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
                if (array[index] !== null) {
                    array[index] = l + value;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value + r;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value + r.getValues()[index];
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '+'";
    },
    "-": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l - r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = l - value;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value - r;
                } else {
                    array[index] = null;
                }
            });
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value - r.getValues()[index];
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '-'";
    },
    "*": function (l, r) {
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l * r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = l * value;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value * r;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value * r.getValues()[index];
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '*'";
    },
    "/": function (l, r) {
        if (!checkDivisor(r)) {
            return "Error: divide by zero in expression";
        }
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l / r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = l / value;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value / r;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value / r.getValues()[index];
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '/'";
    },
    "%": function (l, r) {
        if (!checkDivisor(r)) {
            return "Error: divide by zero in expression";
        }
        if (typeof l === "number" && typeof r === "number") {
            // return number
            return l % r;
        } else if (typeof l === "number" && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = r.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = l % value;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && typeof r === "number") {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value % r;
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        } else if (l instanceof Dataset && r instanceof Dataset) {
            // return Dataset
            let tmpDataset = l.cloneToTmpDataset();
            tmpDataset.getValues().forEach(function (value, index, array) {
                if (array[index] !== null) {
                    array[index] = value % r.getValues()[index];
                } else {
                    array[index] = null;
                }
            });
            tmpDataset.recalculateMinMax();
            return tmpDataset;
        }
        return "Error: unknown operation for '%'";
    },
};

const fnMapDatasetToDataset: FnMapDatasetToDataset = {
    // min value of a dataset
    normalize: function (dataset, args, renderInfo) {
        // console.log("normalize");
        // console.log(dataset);
        let yMin = dataset.getYMin();
        let yMax = dataset.getYMax();
        // console.log(`yMin/yMax: ${yMin}/${yMax}`);
        if (yMin !== null && yMax !== null && yMax > yMin) {
            let normalized = dataset.cloneToTmpDataset();
            normalized.getValues().forEach(function (value, index, array) {
                array[index] = (value - yMin) / (yMax - yMin);
            });
            normalized.recalculateMinMax();
            return normalized;
        }
        return "Error: invalid data range for function 'normalize'";
    },
    setMissingValues: function (dataset, args, renderInfo) {
        // console.log("setMissingValues");
        // console.log(dataset);
        // console.log(args);
        if (args && args.length > 0) {
            let missingValue = args[0];
            // console.log(missingValue);
            let newDataset = dataset.cloneToTmpDataset();
            if (Number.isNumber(missingValue) && !Number.isNaN(missingValue)) {
                newDataset.getValues().forEach(function (value, index, array) {
                    if (value === null) {
                        array[index] = missingValue as number;
                    }
                });
                newDataset.recalculateMinMax();
                return newDataset;
            }
            return "Error: invalid arguments for function 'setMissingValues'";
        }
        return "Error: invalid arguments for function 'setMissingValues";
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

        case "Identifier":
            let identifierExpr = expr as jsep.Identifier;
            let identifierName = identifierExpr.name;
            if (identifierName in fnMapDatasetToValue) {
                return `Error: deprecated template variable '${identifierName}', use '${identifierName}()' instead`;
            } else if (identifierName in fnMapDatasetToDataset) {
                return `Error: deprecated template variable '${identifierName}', use '${identifierName}()' instead`;
            }
            return `Error: unknown function name '${identifierName}'`;

        case "UnaryExpression":
            let uniryExpr = expr as jsep.UnaryExpression;
            let retUniryArg = evaluate(uniryExpr.argument, renderInfo);
            if (typeof retUniryArg === "string") {
                return retUniryArg;
            }
            return fnMapUniryOp[uniryExpr.operator](retUniryArg);

        case "BinaryExpression":
            let binaryExpr = expr as jsep.BinaryExpression;
            let leftValue = evaluate(binaryExpr.left, renderInfo);
            let rightValue = evaluate(binaryExpr.right, renderInfo);
            let retCheck = checkBinaryOperantType(leftValue, rightValue);
            if (typeof retCheck === "string" && retCheck.startsWith("Error:")) {
                return retCheck;
            }
            return fnMapBinaryOp[binaryExpr.operator](leftValue, rightValue);

        case "CallExpression":
            let callExpr = expr as jsep.CallExpression;

            let calleeIdentifier = callExpr.callee as jsep.Identifier;
            let fnName = calleeIdentifier.name;
            let args = callExpr.arguments;
            // console.log(fnName);
            // console.log(args);
            let evaluatedArgs = evaluateArray(args, renderInfo);
            if (typeof evaluatedArgs === "string") return evaluatedArgs;

            // function dataset accept only one arg in number
            if (fnName === "dataset") {
                if (evaluatedArgs.length === 1) {
                    let arg = evaluatedArgs[0];
                    if (typeof arg === "string") return arg;
                    if (typeof arg !== "number") {
                        return "Error: function 'dataset' only accepts id in number";
                    }
                    let dataset = getDatasetById(arg, renderInfo);
                    if (!dataset) {
                        return `Error: no dataset found for id '${arg}'`;
                    }
                    return dataset;
                }
            }
            // fnDataset accept only one arg in number or Dataset
            else if (fnName in fnMapDatasetToValue) {
                if (evaluatedArgs.length === 0) {
                    // Use first non-X dataset
                    let dataset = null;
                    for (let ds of renderInfo.datasets) {
                        if (!dataset && !ds.getQuery().usedAsXDataset) {
                            dataset = ds;
                            // if breaks here, the index of Datasets not reset???
                        }
                    }
                    if (!dataset) {
                        return `No available dataset found for function ${fnName}`;
                    }
                    return fnMapDatasetToValue[fnName](dataset, renderInfo);
                }
                if (evaluatedArgs.length === 1) {
                    let arg = evaluatedArgs[0];
                    if (typeof arg === "string") return arg;
                    if (arg instanceof Dataset) {
                        return fnMapDatasetToValue[fnName](arg, renderInfo);
                    } else {
                        return `Error: function '${fnName}' only accepts Dataset`;
                    }
                }
                return `Error: Too many arguments for function ${fnName}`;
            } else if (fnName in fnMapDatasetToDataset) {
                if (evaluatedArgs.length === 1) {
                    if (typeof evaluatedArgs[0] === "string")
                        return evaluatedArgs[0]; // error message
                    if (evaluatedArgs[0] instanceof Dataset) {
                        let dataset = evaluatedArgs[0];
                        return fnMapDatasetToDataset[fnName](
                            dataset,
                            null,
                            renderInfo
                        );
                    } else {
                        return `Error: function ${fnName} only accept Dataset`;
                    }
                } else if (evaluatedArgs.length > 1) {
                    if (typeof evaluatedArgs[0] === "string") {
                        return evaluatedArgs[0];
                    }
                    if (evaluatedArgs[0] instanceof Dataset) {
                        let dataset = evaluatedArgs[0];
                        return fnMapDatasetToDataset[fnName](
                            dataset,
                            evaluatedArgs.filter(function (
                                value: any,
                                index: number,
                                arr: any
                            ) {
                                return index > 0;
                            }),
                            renderInfo
                        );
                    } else {
                        return `Error: function ${fnName} only accept Dataset`;
                    }
                }
                return `Error: Too many arguments for function ${fnName}`;
            }
            return `Error: unknown function name '${fnName}'`;
    }
    return "Error: unknown expression";
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
        "{{(?<expr>[\\w+\\-*\\/0-9\\s()\\[\\]%.,]+)(::(?<format>[\\w+\\-*\\/0-9\\s()\\[\\]%.:]+))?}}";
    let exprRegex = new RegExp(strExprRegex, "gm");
    let match;
    while ((match = exprRegex.exec(text))) {
        // console.log(match);
        let fullmatch = match[0];
        if (exprMap.some((e) => e.source === fullmatch)) continue;

        if (typeof match.groups !== "undefined") {
            if (typeof match.groups.expr !== "undefined") {
                let expr = match.groups.expr;

                let ast = null;
                try {
                    ast = jsep(expr);
                } catch (err) {
                    return "Error:" + err.message;
                }
                if (!ast) {
                    return "Error: failed to parse expression";
                }
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
        let source = exprResolved.source;
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
            // console.log(exprResolved);
            template = template.split(source).join(strValue);
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

    return "Error: failed to resolve values";
}
