import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    Size,
    Transform,
    ChartElements,
    OutputType,
    ValueType,
} from "./data";
import * as helper from "./helper";
import * as d3 from "d3";

function createAreas(
    canvas: HTMLElement,
    renderInfo: RenderInfo
): ChartElements {
    let chartElements: ChartElements = {};
    // whole area for plotting, includes margins

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

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

function renderTitle(chartElements: ChartElements, renderInfo: RenderInfo) {
    // console.log("renderTitle");
    // under graphArea

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

    if (!bulletInfo.title) return;

    let titleSize = helper.measureTextSize(
        bulletInfo.title,
        "tracker-title-small"
    );
    let spacing = 6; // spacing between title and dataArea

    if (bulletInfo.orientation === "horizontal") {
        let title = chartElements.graphArea
            .append("text")
            .text(bulletInfo.title) // pivot at center
            .attr("id", "title")
            .attr("x", titleSize.width / 2.0)
            .attr("y", renderInfo.dataAreaSize.height / 2.0)
            .attr("height", titleSize.height) // for later use
            .attr("class", "tracker-title-small");
        chartElements["title"] = title;

        // Expand parent areas
        helper.expandArea(chartElements.svg, titleSize.width + spacing, 0);
        helper.expandArea(
            chartElements.graphArea,
            titleSize.width + spacing,
            0
        );

        // Move sibling areas
        helper.moveArea(chartElements.dataArea, titleSize.width + spacing, 0);
    } else if (bulletInfo.orientation === "vertical") {
        let title = chartElements.graphArea
            .append("text")
            .text(bulletInfo.title) // pivot at center
            .attr("id", "title")
            .attr(
                "transform",
                "translate(" +
                    renderInfo.dataAreaSize.width / 2.0 +
                    "," +
                    titleSize.height / 2.0 +
                    ")"
            )
            .attr("height", titleSize.height) // for later use
            .attr("class", "tracker-title-small");
        chartElements["title"] = title;

        // Expand parent areas
        let xExpand = helper.expandArea(
            chartElements.svg,
            0,
            titleSize.height + spacing
        );
        helper.expandArea(
            chartElements.graphArea,
            0,
            titleSize.height + spacing
        );

        // Move sibling areas
        helper.moveArea(chartElements.dataArea, 0, titleSize.height + spacing);
    }
}

// Render ticks, tick labels
function renderAxis(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset
) {
    // console.log("renderAxis");
    // console.log(chartElements);
    // console.log(dataset);

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

    let range = bulletInfo.range;
    let domain = [0, range[range.length - 1]];
    let tickLength = 6;

    if (bulletInfo.orientation === "horizontal") {
        let scale = d3.scaleLinear();
        scale.domain(domain).range([0, renderInfo.dataAreaSize.width]);
        chartElements["scale"] = scale;

        let axisGen = d3.axisBottom(scale);
        let axis = chartElements.dataArea
            .append("g")
            .attr("id", "axis")
            .attr(
                "transform",
                "translate(0," + renderInfo.dataAreaSize.height + ")"
            )
            .call(axisGen)
            .attr("class", "tracker-axis");

        let axisLine = axis.selectAll("path");

        let axisTicks = axis.selectAll("line");

        let tickLabelSize = helper.measureTextSize("123456789");
        let tickLabelHeight = tickLabelSize.height;

        axis.attr("width", renderInfo.dataAreaSize.width);
        axis.attr("height", tickLength + tickLabelHeight);

        // Expand areas
        helper.expandArea(chartElements.svg, 0, tickLength + tickLabelHeight);
        helper.expandArea(
            chartElements.graphArea,
            0,
            tickLength + tickLabelHeight
        );
    } else if (bulletInfo.orientation === "vertical") {
        let scale = d3.scaleLinear();
        scale.domain(domain).range([0, renderInfo.dataAreaSize.height]);
        chartElements["scale"] = scale;

        let axisGen = d3.axisLeft(scale);
        let axis = chartElements.dataArea
            .append("g")
            .attr("id", "axis")
            .attr(
                "transform",
                "translate(" + renderInfo.dataAreaSize.width + " ,0)"
            )
            .call(axisGen)
            .attr("class", "tracker-axis");

        let axisLine = axis.selectAll("path");

        let axisTicks = axis.selectAll("line");

        axis.attr("width", tickLength);
        axis.attr("height", renderInfo.dataAreaSize.width);

        // Expand areas
        helper.expandArea(chartElements.svg, tickLength, 0);
        helper.expandArea(chartElements.graphArea, tickLength, 0);
    }
}

// Render quantitative range, poor/average/good/...
function renderBackPanel(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset
) {
    // console.log("renderBackPanel");
    // console.log(dataset);

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

    let scale = chartElements.scale;

    // Prepare data
    let range = bulletInfo.range;
    let rangeColor = bulletInfo.rangeColor;
    let data = [];
    let lastBound = 0;
    for (let ind = 0; ind < range.length; ind++) {
        data.push({
            start: lastBound,
            end: range[ind],
            color: rangeColor[ind],
        });
        lastBound = range[ind];
    }

    if (bulletInfo.orientation === "horizontal") {
        let panel = chartElements.dataArea
            .selectAll("backPanel")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d: any, i: number) {
                return scale(d.start);
            })
            .attr("y", function (d: any) {
                return 0;
            })
            .attr("width", function (d: any, i: number) {
                return scale(d.end - d.start);
            })
            .attr("height", renderInfo.dataAreaSize.height)
            .style("fill", function (d: any) {
                return d.color;
            });
    } else if (bulletInfo.orientation === "vertical") {
        let panel = chartElements.dataArea
            .selectAll("backPanel")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function (d: any, i: number) {
                return 0;
            })
            .attr("y", function (d: any) {
                return scale(d.start);
            })
            .attr("width", renderInfo.dataAreaSize.width)
            .attr("height", function (d: any) {
                return scale(d.end - d.start);
            })
            .style("fill", function (d: any) {
                return d.color;
            });
    }
}

// Render bar for actual value
function renderBar(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset
) {
    // console.log("renderBar");
    // console.log(dataset);

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

    let strActualValue = bulletInfo.value;
    let actualValue = 25; // TODO
    let valueColor = bulletInfo.valueColor;

    let scale = chartElements.scale;

    if (bulletInfo.orientation === "horizontal") {
        let barWidth = renderInfo.dataAreaSize.height / 3;
        let bar = chartElements.dataArea
            .append("rect")
            .attr("x", scale(0))
            .attr("y", barWidth)
            .attr("width", scale(actualValue))
            .attr("height", barWidth)
            .style("fill", valueColor);
    } else if (bulletInfo.orientation === "vertical") {
        let barWidth = renderInfo.dataAreaSize.width / 3;
        let bar = chartElements.dataArea
            .append("rect")
            .attr("x", barWidth)
            .attr("y", renderInfo.dataAreaSize.height - scale(actualValue))
            .attr("width", barWidth)
            .attr("height", scale(actualValue))
            .style("fill", valueColor);
    }
}

// Render mark line for target value
function renderMark(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset
) {
    // console.log("renderMark");
    // console.log(dataset);

    let bulletInfo = renderInfo.bullet;
    if (!bulletInfo) return;

    let markerValue = bulletInfo.markerValue;
    let markerColor = bulletInfo.markerColor;

    let scale = chartElements.scale;

    if (bulletInfo.orientation === "horizontal") {
        let markerLength = (renderInfo.dataAreaSize.height * 2) / 3;
        let mark = chartElements.dataArea
            .append("rect")
            .attr("x", scale(markerValue) - 1.5)
            .attr("y", markerLength / 4)
            .attr("width", 3)
            .attr("height", markerLength)
            .style("fill", markerColor);
    } else if (bulletInfo.orientation === "vertical") {
        let markerLength = (renderInfo.dataAreaSize.width * 2) / 3;
        let mark = chartElements.dataArea
            .append("rect")
            .attr("x", markerLength / 4)
            .attr(
                "y",
                renderInfo.dataAreaSize.height - scale(markerValue) - 1.5
            )
            .attr("width", markerLength)
            .attr("height", 3)
            .style("fill", markerColor);
    }
}

// Bullet graph https://en.wikipedia.org/wiki/Bullet_graph
export function renderBullet(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderBullet");
    // console.log(renderInfo);
    let bulletInfo = renderInfo.bullet;
    if (bulletInfo === null) return;

    let datasetId = parseFloat(bulletInfo.dataset);
    let dataset = renderInfo.datasets.getDatasetById(datasetId);

    // Set initial dataArea size
    if (bulletInfo.orientation === "horizontal") {
        renderInfo.dataAreaSize = { width: 250, height: 24 };
    } else if (bulletInfo.orientation === "vertical") {
        renderInfo.dataAreaSize = { width: 24, height: 250 };
    }

    let chartElements = createAreas(canvas, renderInfo);

    let retRenderAxis = renderAxis(chartElements, renderInfo, dataset);
    if (typeof retRenderAxis === "string") {
        return retRenderAxis;
    }

    renderTitle(chartElements, renderInfo);

    renderBackPanel(chartElements, renderInfo, dataset);

    renderBar(chartElements, renderInfo, dataset);

    renderMark(chartElements, renderInfo, dataset);
}
