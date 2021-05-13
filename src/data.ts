import { Moment } from "moment";

export enum SearchType {
    Tag,
    Frontmatter,
    Wiki,
    Text,
    dvField,
    Table,
}

export enum OutputType {
    Line,
    Bar,
    Radar,
    Summary,
    Table,
    Calendar,
}

export enum ValueType {
    Number,
    Int,
    Date,
    Time,
    DateTime,
    String
}

export class DataPoint {
    date: Moment;
    value: number;

    constructor(date: Moment, value: number) {
        this.date = date;
        this.value = value;
    }
}

export class Query {
    private type: SearchType | null;
    private target: string;
    private parentTarget: string | null;
    private separator: string; // multiple value separator
    private id: number;
    private accessor: number;
    private accessor1: number;
    private accessor2: number;

    valueType: ValueType;
    usedAsXDataset: boolean;

    constructor(id: number, searchType: SearchType, searchTarget: string) {
        this.type = searchType;
        this.target = searchTarget;
        this.separator = "/";
        this.id = id;
        this.accessor = -1;
        this.accessor1 = -1;
        this.accessor2 = -1;
        this.valueType = ValueType.Number;
        this.usedAsXDataset = false;

        if (searchType === SearchType.Table) {
            // searchTarget --> {{filePath}}[{{table}}][{{column}}]
            let strRegex =
                "\\[(?<accessor>[0-9]+)\\]\\[(?<accessor1>[0-9]+)\\](\\[(?<accessor2>[0-9]+)\\])?";
            let regex = new RegExp(strRegex, "gm");
            let match;
            while ((match = regex.exec(searchTarget))) {
                if (typeof match.groups.accessor !== "undefined") {
                    let accessor = parseFloat(match.groups.accessor);
                    if (Number.isNumber(accessor)) {
                        if (typeof match.groups.accessor1 !== "undefined") {
                            let accessor1 = parseFloat(match.groups.accessor1);
                            if (Number.isNumber(accessor1)) {
                                let accessor2;
                                if (
                                    typeof match.groups.accessor2 !==
                                    "undefined"
                                ) {
                                    accessor2 = parseFloat(
                                        match.groups.accessor2
                                    );
                                }

                                this.accessor = accessor;
                                this.accessor1 = accessor1;
                                if (Number.isNumber(accessor2)) {
                                    this.accessor2 = accessor2;
                                }
                                this.parentTarget = searchTarget.replace(
                                    regex,
                                    ""
                                );
                            }
                            break;
                        }
                    }
                }
            }
        } else {
            let strRegex = "\\[(?<accessor>[0-9]+)\\]";
            let regex = new RegExp(strRegex, "gm");
            let match;
            while ((match = regex.exec(searchTarget))) {
                if (typeof match.groups.accessor !== "undefined") {
                    let accessor = parseFloat(match.groups.accessor);
                    if (Number.isNumber(accessor)) {
                        this.accessor = accessor;
                        this.parentTarget = searchTarget.replace(regex, "");
                    }
                    break;
                }
            }
        }
    }

    public equalTo(other: Query): boolean {
        if (this.type === other.type && this.target === other.target) {
            return true;
        }
        return false;
    }

    public getType() {
        return this.type;
    }

    public getTarget() {
        return this.target;
    }

    public getParentTarget() {
        return this.parentTarget;
    }

    public getId() {
        return this.id;
    }

    public getAccessor(index = 0) {
        switch (index) {
            case 0:
                return this.accessor;
            case 1:
                return this.accessor1;
            case 2:
                return this.accessor2;
        }

        return null;
    }

    public setSeparator(sep: string) {
        this.separator = sep;
    }

    public getSeparator() {
        return this.separator;
    }
}

export interface QueryValuePair {
    query: Query;
    value: number;
}

export class Dataset implements IterableIterator<DataPoint> {
    // Array of DataPoints
    private name: string;
    private query: Query;
    private values: number[];
    private parent: Datasets;
    private id: number;
    private yMin: number;
    private yMax: number;
    private lineInfo: LineInfo;
    private barInfo: BarInfo;
    
    valueType: ValueType;

    private currentIndex = 0; // IterableIterator

    constructor(parent: Datasets, query: Query) {
        this.name = "untitled";
        this.query = query;
        this.values = [];
        this.parent = parent;
        this.id = -1;
        this.yMin = null;
        this.yMax = null;
        this.lineInfo = null;
        this.barInfo = null;
        this.valueType = query.valueType;

        for (let ind = 0; ind < parent.getDates().length; ind++) {
            this.values.push(null);
        }
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }
    public getLineInfo() {
        return this.lineInfo;
    }

    public setLineInfo(lineInfo: LineInfo) {
        this.lineInfo = lineInfo;
    }

    public getBarInfo() {
        return this.barInfo;
    }

    public setBarInfo(barInfo: BarInfo) {
        this.barInfo = barInfo;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;
    }

    public setValue(date: Moment, value: number) {
        let ind = this.parent.getIndexOfDate(date);
        // console.log(ind);
        if (ind >= 0) {
            this.values[ind] = value;

            if (this.yMin === null || value < this.yMin) {
                this.yMin = value;
            }
            if (this.yMax === null || value > this.yMax) {
                this.yMax = value;
            }
        }
    }

    public getYMin() {
        return this.yMin;
    }

    public getYMax() {
        return this.yMax;
    }

    public setPenalty(penalty: number) {
        for (let ind = 0; ind < this.values.length; ind++) {
            if (this.values[ind] === null) {
                this.values[ind] = penalty;
                if (penalty < this.yMin) {
                    this.yMin = penalty;
                }
                if (penalty > this.yMax) {
                    this.yMax = penalty;
                }
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
            if (accumValue < this.yMin) {
                this.yMin = accumValue;
            }
            if (accumValue > this.yMax) {
                this.yMax = accumValue;
            }
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
            let dataPoint = new DataPoint(
                this.parent.getDates()[ind],
                this.values[ind]
            );
            return {
                done: false,
                value: dataPoint,
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

export class Datasets implements IterableIterator<Dataset> {
    // Iterable of Dataset
    private dates: Moment[];
    private datasets: Dataset[];

    private currentIndex = 0; // IterableIterator

    constructor(startDate: Moment, endDate: Moment) {
        this.dates = [];
        this.datasets = [];
        let cData = startDate.creationData();
        const dateFormat = cData.format.toString();
        for (
            let curDate = startDate.clone();
            curDate <= endDate;
            curDate.add(1, "days")
        ) {
            let newDate = window.moment(
                curDate.format(dateFormat),
                dateFormat,
                true
            );
            this.dates.push(newDate);
        }
        // console.log(this.dates);
    }

    public createDataset(query: Query, renderInfo: RenderInfo) {
        let dataset = new Dataset(this, query);
        dataset.setId(query.getId());
        if (renderInfo) {
            dataset.setName(renderInfo.datasetName[query.getId()]);

            if (renderInfo.line) {
                dataset.setLineInfo(renderInfo.line);
            }
            if (renderInfo.bar) {
                dataset.setBarInfo(renderInfo.bar);
            }
        }

        this.datasets.push(dataset);

        return dataset;
    }

    public getIndexOfDate(date: Moment) {
        let cData = date.creationData();
        const dateFormat = cData.format.toString();
        for (let ind = 0; ind < this.dates.length; ind++) {
            if (
                this.dates[ind].format(dateFormat) === date.format(dateFormat)
            ) {
                return ind;
            }
        }
        return -1;
    }

    public getDatasetByQuery(query: Query) {
        for (let dataset of this.datasets) {
            if (dataset.getQuery().equalTo(query)) {
                return dataset;
            }
        }
        return null;
    }

    public getDatasetById(id: number) {
        for (let dataset of this.datasets) {
            if (dataset.getId() === id) {
                return dataset;
            }
        }
    }

    public getXDatasetIds() {
        let ids: Array<number> = [];
        for (let dataset of this.datasets) {
            if (dataset.getQuery().usedAsXDataset) {
                let id = dataset.getQuery().getId();
                if (!ids.includes(id) && id !== -1) {
                    ids.push(id);
                }
            }
        }
        return ids;
    }

    public getDates() {
        return this.dates;
    }

    public getNames() {
        let names = [];
        for (let dataset of this.datasets) {
            names.push(dataset.getName());
        }
        return names;
    }

    next(): IteratorResult<Dataset> {
        if (this.currentIndex < this.datasets.length) {
            return {
                done: false,
                value: this.datasets[this.currentIndex++],
            };
        } else {
            this.currentIndex = 0;
            return {
                done: true,
                value: null,
            };
        }
    }

    [Symbol.iterator](): IterableIterator<Dataset> {
        return this;
    }
}

export class RenderInfo {
    // Input
    queries: Query[];
    xDataset: number[];
    folder: string;
    dateFormat: string;
    dateFormatPrefix: string;
    dateFormatSuffix: string;
    startDate: Moment | null;
    endDate: Moment | null;
    datasetName: string[];
    constValue: number[];
    ignoreAttachedValue: boolean[];
    ignoreZeroValue: boolean[];
    accum: boolean[];
    penalty: number[];
    shift: number[];
    valueType: string[];// number/float, int, string, boolean, date, time, datetime

    dataAreaSize: Size;
    margin: Margin;
    tooltipSize: Size;

    fixedScale: number;
    fitPanelWidth: boolean;

    output: OutputType;
    line: LineInfo | null;
    bar: BarInfo | null;
    summary: SummaryInfo | null;
    calendar: CalendarInfo | null;

    public datasets: Datasets | null;

    constructor(queries: Query[]) {
        this.queries = queries;
        this.xDataset = []; // use file name
        this.folder = "/";
        this.dateFormat = "YYYY-MM-DD";
        this.dateFormatPrefix = "";
        this.dateFormatSuffix = "";
        this.startDate = null;
        this.endDate = null;
        this.datasetName = []; // untitled
        this.constValue = [1.0];
        this.ignoreAttachedValue = []; // false
        this.ignoreZeroValue = []; // false
        this.accum = []; // false, accum values start from zero over days
        this.penalty = []; // null, use this value instead of null value
        this.shift = [];
        this.valueType = [];

        this.dataAreaSize = new Size(300, 300);
        this.margin = new Margin(10, 10, 10, 10); // top, right, bottom, left
        this.tooltipSize = new Size(90, 45);

        this.fixedScale = 1.0;
        this.fitPanelWidth = false;

        this.output = OutputType.Line;
        this.line = null;
        this.summary = null;
        this.bar = null;
        this.calendar = null;

        this.datasets = null;
    }

    public getQueryById(id: number) {
        for (let query of this.queries) {
            if (query.getId() === id) {
                return query;
            }
        }
    }
}

export class CommonChartInfo {
    title: string;
    xAxisLabel: string;
    xAxisColor: string;
    xAxisLabelColor: string;
    yAxisLabel: string[];
    yAxisColor: string[];
    yAxisLabelColor: string[];
    yAxisUnit: string[];
    yMin: number[];
    yMax: number[];
    allowInspectData: boolean;
    showLegend: boolean;
    legendPosition: string;
    legendOrientation: string;
    legendBgColor: string;
    legendBorderColor: string;

    constructor() {
        this.title = "";
        this.xAxisLabel = "Date";
        this.xAxisColor = "";
        this.xAxisLabelColor = "";
        this.yAxisLabel = []; // "Value", 2 elements
        this.yAxisColor = []; // "", 2 elements
        this.yAxisLabelColor = []; // "", 2 elements
        this.yAxisUnit = []; // "", 2 elements
        this.yMin = []; // null, 2 elements
        this.yMax = []; // null, 2 elements
        this.allowInspectData = true;
        this.showLegend = false;
        this.legendPosition = ""; // top, bottom, left, right
        this.legendOrientation = ""; // horizontal, vertical
        this.legendBgColor = "";
        this.legendBorderColor = "";
    }
}

export class LineInfo extends CommonChartInfo {
    lineColor: string[];
    lineWidth: number[];
    showLine: boolean[];
    showPoint: boolean[];
    pointColor: string[];
    pointBorderColor: string[];
    pointBorderWidth: number[];
    pointSize: number[];
    fillGap: boolean[];
    yAxisLocation: string[];

    constructor() {
        super();
        this.lineColor = []; // ""
        this.lineWidth = []; // 1.5
        this.showLine = []; // true
        this.showPoint = []; // true
        this.pointColor = []; // #69b3a2
        this.pointBorderColor = [];
        this.pointBorderWidth = []; // 0.0
        this.pointSize = []; // 3.0
        this.fillGap = []; // false
        this.yAxisLocation = []; // left, for each target
    }
}

export class BarInfo extends CommonChartInfo {
    barColor: string[];
    yAxisLocation: string[];

    constructor() {
        super();
        this.barColor = []; // #69b3a2
        this.yAxisLocation = []; // left, for each target
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

export class CalendarInfo {
    heatMap: boolean;

    constructor() {
        this.heatMap = false;
    }
}

export class Size {
    width: number;
    height: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }
}

export class Margin {
    top: number;
    right: number;
    bottom: number;
    left: number;

    constructor(top: number, right: number, bottom: number, left: number) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
}

export class Transform {
    translateX: number;
    translateY: number;

    constructor(transform: any) {
        this.translateX = 0;
        this.translateY = 0;

        if (typeof transform === "string") {
            let groups = transform.match(
                /translate\(\s*(?<x>[\d\.\/-]+)\s*,\s*(?<y>[\d\.\/-]+)\s*\)/
            ).groups;
            if (groups) {
                this.translateX = parseFloat(groups.x);
                this.translateY = parseFloat(groups.y);
            }
        }
    }
}

export type ChartElements = {
    [key: string]: any;
};

export class TableData {
    filePath: string;
    tableIndex: number;
    xDataset: Query | null;
    yDatasets: Array<Query>;

    constructor(filePath: string, tableIndex: number) {
        this.filePath = filePath;
        this.tableIndex = tableIndex;
        this.xDataset = null;
        this.yDatasets = []; // array of query
    }
}

export type XValueMap = Map<number, string>;
export type DataMap = Map<string, Array<QueryValuePair>>;
