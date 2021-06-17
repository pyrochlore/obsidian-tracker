import { Moment } from "moment";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    MonthInfo,
    Dataset,
    Size,
    Transform,
    ChartElements,
    OutputType,
    ValueType,
} from "./data";
import * as helper from "./helper";
import * as d3 from "d3";

interface DayInfo {
    date: string;
    dayInMonth: number;
    row: number;
    col: number;
    value: number; // 0~1
}

function createAreas(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo
): ChartElements {
    let chartElements: ChartElements = {};
    // whole area for plotting, includes margins
    let svg = d3
        .select(canvas)
        .append("svg")
        .attr("id", "svg")
        .attr(
            "width",
            renderInfo.dataAreaSize.width +
                renderInfo.margin.left +
                renderInfo.margin.right
        )
        .attr(
            "height",
            renderInfo.dataAreaSize.height +
                renderInfo.margin.top +
                renderInfo.margin.bottom
        );
    chartElements["svg"] = svg;

    // graphArea, includes chartArea, title, legend
    let graphArea = svg
        .append("g")
        .attr("id", "graphArea")
        .attr(
            "transform",
            "translate(" +
                renderInfo.margin.left +
                "," +
                renderInfo.margin.top +
                ")"
        )
        .attr("width", renderInfo.dataAreaSize.width + renderInfo.margin.right)
        .attr(
            "height",
            renderInfo.dataAreaSize.height + renderInfo.margin.bottom
        );
    chartElements["graphArea"] = graphArea;

    // dataArea, under graphArea, includes points, lines, xAxis, yAxis
    let dataArea = graphArea
        .append("g")
        .attr("id", "dataArea")
        .attr("width", renderInfo.dataAreaSize.width)
        .attr("height", renderInfo.dataAreaSize.height);
    chartElements["dataArea"] = dataArea;

    return chartElements;
}

function renderMonthHeader(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    dataset: Dataset,
    curDate: Moment
) {
    // console.log("renderMonthHeader")

    if (!renderInfo || !monthInfo) return;

    let curDate_month = curDate.month(); // 0~11
    let curDate_daysInMonth = curDate.daysInMonth(); // 28~31
    let curDate_year = curDate.year();

    let maxDayTextSize = helper.measureTextSize("30", "tracker-axis-label");
    let dotRadius = Math.max(maxDayTextSize.width, maxDayTextSize.height) * 1.2;
    let dayCellSpacing = dotRadius * 0.1;

    let titleText = curDate.format("YYYY MMM");
    let titleTextSize = helper.measureTextSize(titleText, "tracker-title");
    let titleHeight = Math.max(titleTextSize.height, dotRadius * 2);

    let headerHeight = 0;

    // Append title
    let monthTitle = chartElements.graphArea
        .append("text")
        .text(titleText) // pivot at center
        .attr("id", "title")
        .attr(
            "transform",
            "translate(" +
                (dayCellSpacing + dotRadius / 2.0 + titleTextSize.width / 2.0) +
                "," +
                titleHeight / 2.0 +
                ")"
        )
        .attr("height", titleHeight) // for later use
        .attr("class", "tracker-title");
    chartElements["title"] = monthTitle;
    headerHeight += titleHeight;

    // Append two arrow buttons

    // week day names
    let weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weekdayNameSize = helper.measureTextSize(
        titleText,
        "tracker-tick-label"
    );
    let weekDays = chartElements.graphArea
        .selectAll("weekDays")
        .data(weekdayNames)
        .enter()
        .append("text")
        .text(function (n: string) {
            return n;
        })
        .attr("transform", function (n: string, i: number) {
            let strTranslate =
                "translate(" +
                (i * (dayCellSpacing + 2 * dotRadius) + dotRadius / 2) +
                "," +
                headerHeight +
                ")";

            return strTranslate;
        })
        .attr("class", "tracker-tick-label");
    chartElements["weekDays"] = weekDays;
    headerHeight += weekdayNameSize.height;

    // Horizontal line
    let horizontalLineHeight = 3;
    chartElements.graphArea
        .append("rect")
        .attr("x", 0)
        .attr("y", headerHeight)
        .attr("width", renderInfo.dataAreaSize.width)
        .attr("height", horizontalLineHeight)
        .attr("class", "tracker-bar");
    headerHeight += horizontalLineHeight;

    // Expand parent areas
    helper.expandArea(chartElements.svg, 0, headerHeight);
    helper.expandArea(chartElements.graphArea, 0, headerHeight);

    // Move sibling areas
    helper.moveArea(chartElements.dataArea, 0, headerHeight);
}

function renderMonthDays(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    dataset: Dataset,
    curDate: Moment
) {
    // console.log("renderMonthDays");

    if (!renderInfo || !monthInfo) return;

    let curDate_month = curDate.month(); // 0~11
    let curDate_daysInMonth = curDate.daysInMonth(); // 28~31

    let maxDayTextSize = helper.measureTextSize("30", "tracker-axis-label");
    let dotRadius = Math.max(maxDayTextSize.width, maxDayTextSize.height) * 1.5;
    let dayCellSpacing = dotRadius * 0.1;

    // Get min and max, null values will be treated as zero here
    let values = dataset.getValues().map(function (v) {
        if (v === null) {
            return 0;
        }
        return v;
    });
    let yMin = d3.min(values);
    if (monthInfo.yMin !== null) {
        yMin = monthInfo.yMin;
    }
    let yMax = d3.max(values);
    if (monthInfo.yMax !== null) {
        yMax = monthInfo.yMax;
    }
    // console.log(`yMin:${yMin}, yMax:${yMax}`);

    // Prepare data for graph
    let daysInThisMonth: Array<DayInfo> = [];
    const monthStartDate = curDate.clone().startOf("month");
    const monthEndDate = curDate.endOf("month");
    let indCol = 0;
    let indRow = 0;
    for (
        let curDate = monthStartDate.clone();
        curDate <= monthEndDate;
        curDate.add(1, "days")
    ) {
        indCol = curDate.day();
        indRow = Math.floor((monthStartDate.day() - 1 + curDate.date()) / 7.0);
        let curValue = dataset.getValue(curDate);

        let scaledValue = 0;
        if (yMax - yMin > 0) {
            scaledValue = (curValue - yMin) / (yMax - yMin);
        }
        daysInThisMonth.push({
            date: curDate.format(renderInfo.dateFormat),
            dayInMonth: curDate.date(),
            row: indRow,
            col: indCol,
            value: scaledValue,
        });
    }

    let totalWidth = 2 * (indCol + 1) * dotRadius + indCol * dayCellSpacing;
    let totalHeight = 2 * (indRow + 1) * dotRadius + indRow * dayCellSpacing;

    // scale
    let scale = d3.scaleLinear().domain([-0.5, 7]).range([0, totalWidth]);

    // streak lines

    // days in this month
    let dots = chartElements.dataArea
        .selectAll("dot")
        .data(daysInThisMonth)
        .enter()
        .append("circle")
        .attr("r", dotRadius / 2.0)
        .attr("cx", function (d: DayInfo) {
            return scale(d.col);
        })
        .attr("cy", function (d: DayInfo) {
            return scale(d.row);
        })
        // .attr("class", "tracker-dot")
        .style("fill", function (d: DayInfo) {
            // console.log(d.value);
            return d3.interpolateLab("white", monthInfo.valueColor)(d.value);
            // return color;
        })
        .style("opacity", function (d: DayInfo) {
            return d.value;
        });

    // labels
    let dayLabals = chartElements.dataArea
        .selectAll("dayLabel")
        .data(daysInThisMonth)
        .enter()
        .append("text")
        .text(function (d: DayInfo) {
            return d.dayInMonth.toString();
        })
        .attr("transform", function (d: DayInfo) {
            let strTranslate =
                "translate(" +
                scale(d.col) +
                "," +
                (scale(d.row) + maxDayTextSize.height / 4) +
                ")";

            return strTranslate;
        })
        .attr("class", "tracker-axis-label");
}

export function renderMonth(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo
) {
    // console.log("renderMonth");
    // console.log(renderInfo);
    if (!renderInfo || !renderMonth) return;

    let chartElements = createAreas(canvas, renderInfo, monthInfo);

    let today = window.moment();
    let lastDataDate = renderInfo.datasets.getDates().last();

    renderMonthHeader(
        chartElements,
        renderInfo,
        monthInfo,
        renderInfo.datasets.getDatasetById(0),
        lastDataDate
    );

    renderMonthDays(
        chartElements,
        renderInfo,
        monthInfo,
        renderInfo.datasets.getDatasetById(0),
        lastDataDate
    );
}
