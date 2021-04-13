import { Moment } from "moment";

export type NullableNumber = number | null;

export interface DataPoint {
    date: Moment;
    value: NullableNumber;
}

export class Query {
    type: string;
    target: string;

    constructor(searchType: string, searchTarget: string) {
        this.type = searchType;
        this.target = searchTarget;
    }

    public equalTo(other: Query): boolean {
        if (this.type === other.type && this.target === other.target) {
            return true;
        }
        return false;
    }
}

export interface QueryValuePair {
    query: Query;
    value: NullableNumber;
}

export class DataSet implements IterableIterator<DataPoint> {
    // Array of DataPoints
    private query: Query;
    private values: NullableNumber[];
    private parent: DataSets;

    private currentIndex = 0; // IterableIterator

    constructor(parent: DataSets, query: Query) {
        this.query = query;
        this.values = [];
        this.parent = parent;

        for (let ind = 0; ind < parent.getDates().length; ind++) {
            this.values.push(null);
        }
    }

    public setValue(date: Moment, value: NullableNumber) {
        let ind = this.parent.getIndexOfDate(date);
        // console.log(ind);
        if (ind >= 0) {
            this.values[ind] = value;
        }
    }

    public setPenalty(penalty: number) {
        for (let ind = 0; ind < this.values.length; ind++) {
            if (this.values[ind] === null) {
                this.values[ind] = penalty;
            }
        }
    }

    public getQuery(): Query {
        return this.query;
    }

    public accumulateValues() {
        let accumValue = 0.0;
        for (let ind = 0; ind < this.values.length; ind++) {
            if (this.values[ind] !== null) {
                accumValue += this.values[ind];
            }
            this.values[ind] = accumValue;
        }
    }

    public getValues() {
        return this.values;
    }

    public getLength() {
        return this.values.length;
    }

    public getLengthNotNull() {
        let countNotNull = 0;
        for (let ind = 0; ind < this.values.length; ind++) {
            if (this.values[ind] !== null) {
                countNotNull++;
            }
        }
        return countNotNull;
    }

    next(): IteratorResult<DataPoint> {
        if (this.currentIndex < this.values.length) {
            let ind = this.currentIndex++;
            return {
                done: false,
                value: {
                    date: this.parent.getDates()[ind],
                    value: this.values[ind],
                },
            };
        } else {
            this.currentIndex = 0;
            return {
                done: true,
                value: null,
            };
        }
    }

    [Symbol.iterator](): IterableIterator<DataPoint> {
        return this;
    }
}

export class DataSets implements IterableIterator<DataSet> {
    // Iterable of DataSet
    private dates: Moment[];
    private dataSets: DataSet[];

    private currentIndex = 0; // IterableIterator

    constructor(startDate: Moment, endDate: Moment) {
        this.dates = [];
        this.dataSets = [];
        let cData = startDate.creationData();
        for (
            let curDate = startDate.clone();
            curDate <= endDate;
            curDate.add(1, "days")
        ) {
            this.dates.push(
                window.moment(curDate.format(cData.format.toString()))
            );
        }
        // console.log(this.dates);
    }

    public createDataSet(query: Query) {
        let dataSet = new DataSet(this, query);
        this.dataSets.push(dataSet);

        return dataSet;
    }

    public getIndexOfDate(date: Moment) {
        let cData = date.creationData();
        for (let ind = 0; ind < this.dates.length; ind++) {
            if (
                this.dates[ind].format(cData.format.toString()) ===
                date.format(cData.format.toString())
            ) {
                return ind;
            }
        }
        return -1;
    }

    public getDataSetByQuery(query: Query) {
        for (let dataSet of this.dataSets) {
            if (dataSet.getQuery().equalTo(query)) {
                return dataSet;
            }
        }
        return null;
    }

    public getDataSetById(id: number) {
        return this.dataSets[id];
    }

    public getDates() {
        return this.dates;
    }

    next(): IteratorResult<DataSet> {
        if (this.currentIndex < this.dataSets.length) {
            return {
                done: false,
                value: this.dataSets[this.currentIndex++],
            };
        } else {
            this.currentIndex = 0;
            return {
                done: true,
                value: null,
            };
        }
    }

    [Symbol.iterator](): IterableIterator<DataSet> {
        return this;
    }
}

export class RenderInfo {
    // Input
    searchType: string;
    searchTarget: string;
    folder: string;
    dateFormat: string;
    startDate: Moment;
    endDate: Moment;
    constValue: number;
    ignoreAttachedValue: boolean;
    ignoreZeroValue: boolean;
    accum: boolean;
    penalty: number;

    output: string;
    line: LineInfo | null;
    summary: SummaryInfo | null;

    public dataSets: DataSets | null;

    constructor(searchType: string, searchTarget: string) {
        this.searchType = searchType;
        this.searchTarget = searchTarget;
        this.folder = "";
        this.dateFormat = "";
        this.startDate = window.moment("");
        this.endDate = window.moment("");
        this.constValue = 1.0;
        this.ignoreAttachedValue = false;
        this.ignoreZeroValue = false;
        this.accum = false; // accum values start from zero over days
        this.penalty = null; // use this value instead of null value

        this.output = "";
        this.line = new LineInfo();
        this.summary = null;

        this.dataSets = null;
    }
}

export class LineInfo {
    title: string;
    xAxisLabel: string;
    yAxisLabel: string;
    labelColor: string;
    yAxisUnit: string;
    yAxisLocation: string;
    yMin: number | null;
    yMax: number | null;
    axisColor: string;
    lineColor: string;
    lineWidth: number;
    showLine: boolean;
    showPoint: boolean;
    pointColor: string;
    pointBorderColor: string;
    pointBorderWidth: number;
    pointSize: number;
    allowInspectData: boolean;
    fillGap: boolean;

    constructor() {
        this.title = "";
        this.xAxisLabel = "Date";
        this.yAxisLabel = "Value";
        this.labelColor = "";
        this.yAxisUnit = "";
        this.yAxisLocation = "left";
        this.yMin = null;
        this.yMax = null;
        this.axisColor = "";
        this.lineColor = "";
        this.lineWidth = 1.5;
        this.showLine = true;
        this.showPoint = true;
        this.pointColor = "#69b3a2";
        this.pointBorderColor = "#69b3a2";
        this.pointBorderWidth = 0.0;
        this.pointSize = 3.0;
        this.allowInspectData = true;
        this.fillGap = false;
    }
}

export class SummaryInfo {
    template: string;
    style: string;

    constructor() {
        this.template = "";
        this.style = "";
    }
}
