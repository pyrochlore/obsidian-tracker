import { Moment } from "moment";

export enum SearchType {
    Tag,
    Frontmatter,
    Wiki,
    WikiLink,
    WikiDisplay,
    Text,
    dvField,
    Table,
    FileMeta,
    Task,
    TaskDone,
    TaskNotDone,
}

export enum GraphType {
    Line,
    Bar,
    Pie,
    Radar,
    Summary,
    Table,
    Month,
    Heatmap,
    Bullet,
    Unknown,
}

export enum ValueType {
    Number,
    Int,
    Date,
    Time,
    DateTime,
    String,
}

export type TextValueMap = {
    [key: string]: number;
};

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
    private numTargets: number;

    valueType: ValueType;
    usedAsXDataset: boolean;

    constructor(id: number, searchType: SearchType, searchTarget: string) {
        this.type = searchType;
        this.target = searchTarget;
        this.separator = ""; // separator to separate multiple values
        this.id = id;
        this.accessor = -1;
        this.accessor1 = -1;
        this.accessor2 = -1;
        this.valueType = ValueType.Number;
        this.usedAsXDataset = false;
        this.numTargets = 0;

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

    public getSeparator(isForFrontmatterTags: boolean = false) {
        if (this.separator === "") {
            if (isForFrontmatterTags) {
                return ",";
            }
            return "/";
        }
        return this.separator;
    }

    public addNumTargets(num: number = 1) {
        this.numTargets = this.numTargets + num;
    }

    public getNumTargets() {
        return this.numTargets;
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
    private startDate: Moment;
    private endDate: Moment;
    private numTargets: number;
    private lineInfo: LineInfo;
    private barInfo: BarInfo;

    private isTmpDataset: boolean;

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
        this.startDate = null;
        this.endDate = null;
        this.numTargets = 0;
        this.lineInfo = null;
        this.barInfo = null;

        this.isTmpDataset = false;

        this.valueType = query?.valueType;

        for (let ind = 0; ind < parent.getDates().length; ind++) {
            this.values.push(null);
        }
    }

    public cloneToTmpDataset() {
        if (!this.isTmpDataset) {
            let tmpDataset = new Dataset(this.parent, null);
            tmpDataset.name = "tmp";
            tmpDataset.values = [...this.values];
            tmpDataset.yMin = this.yMin;
            tmpDataset.yMax = this.yMax;
            tmpDataset.startDate = this.startDate.clone();
            tmpDataset.endDate = this.endDate.clone();
            tmpDataset.numTargets = this.numTargets;
            tmpDataset.isTmpDataset = true;
            tmpDataset.valueType = this.valueType;
            return tmpDataset;
        }
        return this; // already tmp dataset
    }

    public getName() {
        return this.name;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;
    }

    public addNumTargets(num: number) {
        this.numTargets = this.numTargets + num;
    }

    public getNumTargets() {
        return this.numTargets;
    }

    public getValue(date: Moment, dayShift: number = 0) {
        let ind = this.parent.getIndexOfDate(date) + Math.floor(dayShift);
        if (ind >= 0 && ind < this.values.length) {
            return this.values[ind];
        }
        return null;
    }

    public setValue(date: Moment, value: number) {
        let ind = this.parent.getIndexOfDate(date);
        // console.log(ind);

        if (ind >= 0 && ind < this.values.length) {
            // Set value
            this.values[ind] = value;

            // Update yMin and yMax
            if (this.yMin === null || value < this.yMin) {
                this.yMin = value;
            }
            if (this.yMax === null || value > this.yMax) {
                this.yMax = value;
            }

            // Update startDate and endDate
            if (this.startDate === null || date < this.startDate) {
                this.startDate = date.clone();
            }
            if (this.endDate === null || date > this.endDate) {
                this.endDate = date.clone();
            }
        }
    }

    public recalculateMinMax() {
        this.yMin = Math.min(...this.values);
        this.yMax = Math.max(...this.values);
    }

    public getYMin() {
        return this.yMin;
    }

    public getYMax() {
        return this.yMax;
    }

    public getStartDate() {
        return this.startDate;
    }

    public getEndDate() {
        return this.endDate;
    }

    public shift(shiftAmount: number, doLargerthan: number) {
        let anyShifted = false;
        for (let ind = 0; ind < this.values.length; ind++) {
            if (this.values[ind] !== null) {
                if (doLargerthan === null) {
                    this.values[ind] = this.values[ind] + shiftAmount;
                    anyShifted = true;
                } else {
                    if (this.values[ind] >= doLargerthan) {
                        this.values[ind] = this.values[ind] + shiftAmount;
                        anyShifted = true;
                    }
                }
            }
        }
        if (anyShifted) {
            this.yMin = this.yMin + shiftAmount;
            this.yMax = this.yMax + shiftAmount;
        }
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
        // console.log(cData);
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

        return null;
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
    file: string[];
    specifiedFilesOnly: boolean;
    fileContainsLinkedFiles: string[];
    fileMultiplierAfterLink: string;
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
    valueShift: number[];
    shiftOnlyValueLargerThan: number[];
    valueType: string[]; // number/float, int, string, boolean, date, time, datetime
    textValueMap: TextValueMap;

    dataAreaSize: Size;
    margin: Margin;

    fixedScale: number;
    fitPanelWidth: boolean;
    aspectRatio: AspectRatio;

    output: any[];
    line: LineInfo[];
    bar: BarInfo[];
    pie: PieInfo[];
    summary: SummaryInfo[];
    month: MonthInfo[];
    heatmap: HeatmapInfo[];
    bullet: BulletInfo[];
    customDataset: CustomDatasetInfo[];

    public datasets: Datasets | null;

    constructor(queries: Query[]) {
        this.queries = queries;
        this.xDataset = []; // use file name
        this.folder = "/";
        this.file = []; // extra files to use
        this.specifiedFilesOnly = false; // if true, use files specified only
        this.fileContainsLinkedFiles = [];
        this.fileMultiplierAfterLink = ""; // regex pattern to extract multiplier after link
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
        this.valueShift = [];
        this.shiftOnlyValueLargerThan = [];
        this.valueType = [];
        this.textValueMap = {};

        this.dataAreaSize = new Size(300, 300);
        this.aspectRatio = new AspectRatio(1, 1);
        this.margin = new Margin(10, 10, 10, 10); // top, right, bottom, left

        this.fixedScale = 1.0;
        this.fitPanelWidth = false;

        this.output = [];
        this.line = [];
        this.bar = [];
        this.pie = [];
        this.summary = [];
        this.month = [];
        this.heatmap = [];
        this.bullet = [];
        this.customDataset = [];

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

export class CustomDatasetInfo {
    id: number;
    name: string;
    xData: string[];
    yData: string[];

    constructor() {
        this.id = -1;
        this.name = "";
        this.xData = [];
        this.yData = [];
    }
}

export interface IGraph {
    GetGraphType(): GraphType;
}

export interface ILegend {
    showLegend: boolean;
    legendPosition: string;
    legendOrientation: string;
    legendBgColor: string;
    legendBorderColor: string;
}

export class CommonChartInfo implements IGraph, ILegend {
    title: string;
    xAxisLabel: string;
    xAxisColor: string;
    xAxisLabelColor: string;
    yAxisLabel: string[];
    yAxisColor: string[];
    yAxisLabelColor: string[];
    yAxisUnit: string[];
    xAxisTickInterval: string;
    yAxisTickInterval: string[];
    xAxisTickLabelFormat: string;
    yAxisTickLabelFormat: string[];
    yMin: number[];
    yMax: number[];
    reverseYAxis: boolean[];
    allowInspectData: boolean;

    // ILegend
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
        this.xAxisTickInterval = null; // the string will be converted to Duration (a month is not nesscesary to 30 days)
        this.yAxisTickInterval = []; // null, 2 elements
        this.xAxisTickLabelFormat = null;
        this.yAxisTickLabelFormat = []; // null, 2 elements
        this.yMin = []; // null, 2 elements
        this.yMax = []; // null, 2 elements
        this.reverseYAxis = []; // false, 2 elements
        this.allowInspectData = true;

        // ILegend
        this.showLegend = false;
        this.legendPosition = ""; // top, bottom, left, right
        this.legendOrientation = ""; // horizontal, vertical
        this.legendBgColor = "";
        this.legendBorderColor = "";
    }

    public GetGraphType() {
        return GraphType.Unknown;
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

    public GetGraphType() {
        return GraphType.Line;
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

    public GetGraphType() {
        return GraphType.Bar;
    }
}

export class PieInfo implements IGraph, ILegend {
    title: string;
    data: string[];
    dataColor: string[];
    dataName: string[];
    label: string[];
    hideLabelLessThan: number;
    showExtLabelOnlyIfNoLabel: boolean;
    extLabel: string[];

    ratioInnerRadius: number;

    // ILegend
    showLegend: boolean;
    legendPosition: string;
    legendOrientation: string;
    legendBgColor: string;
    legendBorderColor: string;

    constructor() {
        this.title = "";
        this.data = [];
        this.dataColor = [];
        this.dataName = [];
        this.label = [];
        this.hideLabelLessThan = 0.03;
        this.extLabel = [];
        this.showExtLabelOnlyIfNoLabel = false;
        this.ratioInnerRadius = 0.0;

        // ILegend
        this.showLegend = false;
        this.legendPosition = ""; // top, bottom, left, right
        this.legendOrientation = ""; // horizontal, vertical
        this.legendBgColor = "";
        this.legendBorderColor = "";
    }

    public GetGraphType() {
        return GraphType.Pie;
    }
}

export class SummaryInfo implements IGraph {
    template: string;
    style: string;

    constructor() {
        this.template = "";
        this.style = "";
    }

    public GetGraphType() {
        return GraphType.Summary;
    }
}

export class MonthInfo implements IGraph {
    mode: string;
    dataset: number[];
    startWeekOn: string;
    threshold: number[];
    yMin: number[];
    yMax: number[];
    color: string;
    dimNotInMonth: boolean;
    initMonth: string; // YYYY-MM
    showSelectedValue: boolean;

    // header
    headerYearColor: string;
    headerMonthColor: string;
    dividingLineColor: string;

    // circles and rings
    showCircle: boolean;
    showStreak: boolean;
    showTodayRing: boolean;
    showSelectedRing: boolean;
    circleColor: string;
    circleColorByValue: boolean;
    todayRingColor: string;
    selectedRingColor: string;

    // annotations
    showAnnotation: boolean;
    annotation: string[];
    showAnnotationOfAllTargets: boolean;

    // internal
    selectedDate: string;
    selectedDataset: number;

    constructor() {
        this.mode = "circle"; // circle, annotation
        this.dataset = [];
        this.startWeekOn = "Sun";
        this.threshold = []; // if value > threshold, will show dot
        this.yMin = [];
        this.yMax = [];
        this.color = null;
        this.dimNotInMonth = true;
        this.initMonth = "";
        this.showSelectedValue = true;

        // header
        this.headerYearColor = null;
        this.headerMonthColor = null;
        this.dividingLineColor = null;

        // circles and rings
        this.showCircle = true;
        this.showStreak = true; // a streak connects neigbor dots
        this.showTodayRing = true;
        this.showSelectedRing = true;
        this.circleColor = null;
        this.circleColorByValue = false;
        this.todayRingColor = ""; // white
        this.selectedRingColor = "firebrick";

        // annotations
        this.showAnnotation = true;
        this.annotation = []; // annotation for each dataset, accept expression thus value
        this.showAnnotationOfAllTargets = true;

        // internal
        this.selectedDate = ""; // selected date
        this.selectedDataset = null; // selected index of dataset
    }

    public GetGraphType() {
        return GraphType.Month;
    }
}

export class HeatmapInfo implements IGraph {
    dataset: string;
    startWeekOn: string;
    orientation: string;
    yMin: number;
    yMax: number;
    color: string;

    constructor() {
        this.dataset = "0";
        this.startWeekOn = "Sun";
        this.orientation = "vertical";
        this.yMin = null;
        this.yMax = null;
        this.color = null;
    }

    public GetGraphType() {
        return GraphType.Heatmap;
    }
}

export class BulletInfo implements IGraph {
    title: string;
    dataset: string;
    orientation: string;
    value: string;
    valueUnit: string;
    valueColor: string;
    range: number[];
    rangeColor: string[];
    showMarker: boolean;
    markerValue: number;
    markerColor: string;

    constructor() {
        this.title = "";
        this.dataset = "0"; // dataset id or name
        this.orientation = "horizontal"; // or vertical
        this.value = ""; // Can possess template varialbe
        this.valueUnit = "";
        this.valueColor = "#69b3a2";
        this.range = [];
        this.rangeColor = [];
        this.showMarker = false;
        this.markerValue = 0;
        this.markerColor = "";
    }

    public GetGraphType() {
        return GraphType.Bullet;
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

export class AspectRatio  {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public recalculateSize(size: Size): Size {
        let aspectRatio = this.x / this.y;
        let width = parseFloat((size.width * aspectRatio).toFixed(2))
        return new Size(width, size.height);
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

export class CollectingProcessInfo {
    fileTotal: number; // total number of files
    fileAvailable: number; // total available count
    fileOutOfDateRange: number;
    fileNotInFormat: number;
    errorMessage: string;
    minDate: Moment;
    maxDate: Moment;
    gotAnyValidXValue: boolean;
    gotAnyValidYValue: boolean;

    constructor() {
        this.fileTotal = 0;
        this.fileAvailable = 0;
        this.fileOutOfDateRange = 0;
        this.fileNotInFormat = 0;
        this.errorMessage = "";
        this.minDate = window.moment(""); // invalid date
        this.maxDate = window.moment(""); // invalid date
        this.gotAnyValidXValue = false;
        this.gotAnyValidYValue = false;
    }
}

export type XValueMap = Map<number, string>;
export type DataMap = Map<string, Array<QueryValuePair>>;
