import { Moment } from "moment";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    PieInfo,
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
import * as expr from "./expr";

function createAreas(
    chartElements: ChartElements,
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
): ChartElements {
    // clean areas
    d3.select(canvas).select("#svg").remove();
    var props = Object.getOwnPropertyNames(chartElements);
    for (var i = 0; i < props.length; i++) {
        // d3.select(chartElements[props[i]]).remove();
        delete chartElements[props[i]];
    }
    // console.log(chartElements);

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

function renderTitle(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderTitle");
    // under graphArea

    if (!renderInfo || !pieInfo) return;

    if (!pieInfo.title) return;
    let titleSize = helper.measureTextSize(pieInfo.title, "tracker-title");
}

function renderPie(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderPie");
    // console.log(renderInfo);

    let radius = renderInfo.dataAreaSize.width * 0.5 * 0.8;

    // data
    let data = pieInfo.data.map(function (s) {
        let value = expr.resolve(s, renderInfo);
        return value;
    });

    // scale
    let colorScale = d3.scaleOrdinal().range(pieInfo.dataColor);

    let sectorsGroup = chartElements.dataArea.append("g");
    sectorsGroup.attr("transform", function () {
        let strTranslate =
            "translate(" +
            renderInfo.dataAreaSize.width * 0.5 +
            "," +
            renderInfo.dataAreaSize.height * 0.5 +
            ")";

        return strTranslate;
    });

    let pie = d3.pie();

    let sectors = sectorsGroup
        .selectAll("sector")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "sector");

    let arc = d3
        .arc()
        .innerRadius(radius * pieInfo.ratioInnerRadius)
        .outerRadius(radius);

    let sectorPaths = sectors
        .append("path")
        .attr("fill", function (d: any, i: number) {
            return colorScale(i.toString());
        })
        .attr("d", arc);
}

export function renderPieChart(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderPieChart");
    // console.log(renderInfo);
    if (!renderInfo || !pieInfo) return;

    let chartElements: ChartElements = {};
    chartElements = createAreas(chartElements, canvas, renderInfo, pieInfo);

    renderTitle(canvas, chartElements, renderInfo, pieInfo);

    renderPie(canvas, chartElements, renderInfo, pieInfo);
}
