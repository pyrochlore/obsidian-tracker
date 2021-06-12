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
    dataset: Dataset
) {}

function renderMonthDays(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    dataset: Dataset
) {
    // console.log("renderMonthDays");

    let maxDayTextSize = helper.measureTextSize("30");
    let dayCellWidth = maxDayTextSize.width * 1.2;
    let dayCellSpacing = dayCellWidth * 0.1;

    let lastDate = renderInfo.datasets.getDates().last();
    let monthOfLastDate = lastDate.month(); // 0~11
    let daysInMonth = lastDate.daysInMonth(); // 28~31

    let daysInThisMonth: Array<DayInfo> = [];
    const monthStartDate = lastDate.clone().startOf("month");
    const monthEndDate = lastDate.endOf("month");
    for (
        let curDate = monthStartDate.clone();
        curDate <= monthEndDate;
        curDate.add(1, "days")
    ) {
        let indCol = curDate.day();
        let indRow = Math.floor(
            (monthStartDate.day() - 1 + curDate.date()) / 7.0
        );
        daysInThisMonth.push({
            date: curDate.format(renderInfo.dateFormat),
            dayInMonth: curDate.date(),
            row: indRow,
            col: indCol,
        });
    }

    // scale
    let scale = d3
        .scaleLinear()
        .domain([0, 8])
        .range([0, renderInfo.dataAreaSize.width]);

    // streak lines

    // days in this month
    let dots = chartElements.dataArea
        .selectAll("dot")
        .data(daysInThisMonth)
        .enter()
        .append("circle")
        .attr("r", dayCellWidth / 2.0)
        .attr("cx", function (d: DayInfo) {
            return scale(d.col);
        })
        .attr("cy", function (d: DayInfo) {
            return scale(d.row);
        })
        .attr("class", "tracker-dot");

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
    if (renderInfo.month === null) return;

    let chartElements = createAreas(canvas, renderInfo, monthInfo);

    renderMonthHeader(
        chartElements,
        renderInfo,
        monthInfo,
        renderInfo.datasets.getDatasetById(0)
    );

    renderMonthDays(
        chartElements,
        renderInfo,
        monthInfo,
        renderInfo.datasets.getDatasetById(0)
    );
}
