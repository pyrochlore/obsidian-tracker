import {
    Datasets,
    DataPoint,
    RenderInfo,
    BulletInfo,
    Dataset,
    Size,
    Transform,
    ChartElements,
    GraphType,
    ValueType,
} from "./data";
import * as helper from "./helper";
import * as d3 from "d3";
import * as expr from "./expr";

function createAreas(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo
): ChartElements {
    let chartElements: ChartElements = {};
    // whole area for plotting, includes margins

    if (!renderInfo || !bulletInfo) return;

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

function setChartScale(
    _canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo
) {
    let canvas = d3.select(_canvas);
    let svg = chartElements.svg;
    let svgWidth = parseFloat(svg.attr("width"));
    let svgHeight = parseFloat(svg.attr("height"));
    svg.attr("width", null)
        .attr("height", null)
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    if (renderInfo.fitPanelWidth) {
        canvas.style("width", "100%");
    } else {
        canvas.style(
            "width",
            (svgWidth * renderInfo.fixedScale).toString() + "px"
        );
        canvas.style(
            "height",
            (svgHeight * renderInfo.fixedScale).toString() + "px"
        );
    }
}

function renderTitle(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo
) {
    // console.log("renderTitle");
    // under graphArea

    if (!renderInfo || !bulletInfo) return;

    const spacing = 6; // spacing between title and dataArea

    if (bulletInfo.title) {
        let titleSize = helper.measureTextSize(
            bulletInfo.title,
            "tracker-title-small"
        );

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
            helper.moveArea(
                chartElements.dataArea,
                titleSize.width + spacing,
                0
            );
        } else if (bulletInfo.orientation === "vertical") {
            // if label width > dataArea width
            let xMiddle = renderInfo.dataAreaSize.width / 2.0;
            if (titleSize.width > renderInfo.dataAreaSize.width) {
                // console.log("expand area for vertical title");
                helper.expandArea(
                    chartElements.svg,
                    titleSize.width - renderInfo.dataAreaSize.width,
                    0
                );
                helper.expandArea(
                    chartElements.graphArea,
                    titleSize.width - renderInfo.dataAreaSize.width,
                    0
                );

                helper.moveArea(
                    chartElements.dataArea,
                    titleSize.width / 2.0 - renderInfo.dataAreaSize.width / 2.0,
                    0
                );
                xMiddle = titleSize.width / 2.0;
            }

            let axisWidth = parseFloat(chartElements.axis.attr("width"));

            let title = chartElements.graphArea
                .append("text")
                .text(bulletInfo.title) // pivot at center
                .attr("id", "title")
                .attr("x", xMiddle + axisWidth)
                .attr("y", titleSize.height / 2.0)
                .attr("height", titleSize.height) // for later use
                .attr("class", "tracker-title-small");
            chartElements["title"] = title;

            // Expand parent areas
            helper.expandArea(chartElements.svg, 0, titleSize.height + spacing);
            helper.expandArea(
                chartElements.graphArea,
                0,
                titleSize.height + spacing
            );

            // Move sibling areas
            helper.moveArea(
                chartElements.dataArea,
                0,
                titleSize.height + spacing
            );
        }
    }

    if (bulletInfo.valueUnit) {
        let unitSize = helper.measureTextSize(
            bulletInfo.valueUnit,
            "tracker-tick-label"
        );

        if (bulletInfo.orientation === "horizontal") {
            let unit = chartElements.dataArea
                .append("text")
                .text(bulletInfo.valueUnit)
                .attr("id", "unit")
                .attr("x", -1 * (unitSize.width + spacing))
                .attr("y", renderInfo.dataAreaSize.height + spacing)
                .attr("height", unitSize.height) // for later use
                .attr("class", "tracker-tick-label"); // pivot at corder
            chartElements["unit"] = unit;
        } else if (bulletInfo.orientation === "vertical") {
            let unit = chartElements.dataArea
                .append("text")
                .text(bulletInfo.valueUnit)
                .attr("id", "unit")
                .attr(
                    "x",
                    renderInfo.dataAreaSize.width / 2 - unitSize.width / 2
                )
                .attr("y", -(unitSize.height / 2.0 + spacing))
                .attr("height", unitSize.height) // for later use
                .attr("class", "tracker-tick-label"); // pivot at corder
            chartElements["unit"] = unit;

            // Expand parent areas
            helper.expandArea(chartElements.svg, 0, unitSize.height + spacing);
            helper.expandArea(
                chartElements.graphArea,
                0,
                unitSize.height + spacing
            );

            // Move dataArea down
            helper.moveArea(
                chartElements.dataArea,
                0,
                unitSize.height + spacing
            );
        }
    }
}

// Render ticks, tick labels
function renderAxis(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo,
    dataset: Dataset
) {
    // console.log("renderAxis");
    // console.log(chartElements);
    // console.log(dataset);

    if (!renderInfo || !bulletInfo) return;

    let range = bulletInfo.range;
    let lastRange = range[range.length - 1];
    let domain = [0, lastRange];

    let tickLength = 6;
    let valueUnit = bulletInfo.valueUnit;
    let tickFormatFn: any = function (value: any) {
        if (valueUnit && valueUnit.endsWith("%")) {
            return d3.tickFormat(0, lastRange, 7)(value) + " %";
        }
        return d3.tickFormat(0, lastRange, 7)(value);
    };
    let maxTickLabel = tickFormatFn(lastRange);
    let maxTickLabelSize = helper.measureTextSize(
        maxTickLabel,
        "tracker-tick-label"
    );

    if (bulletInfo.orientation === "horizontal") {
        let scale = d3.scaleLinear();
        scale.domain(domain).range([0, renderInfo.dataAreaSize.width]);
        chartElements["scale"] = scale;

        let axisGen = d3.axisBottom(scale);
        axisGen.tickFormat(tickFormatFn);
        let axis = chartElements.dataArea
            .append("g")
            .attr("id", "axis")
            .attr(
                "transform",
                "translate(0," + renderInfo.dataAreaSize.height + ")"
            )
            .call(axisGen)
            .attr("class", "tracker-axis");
        chartElements["axis"] = axis;

        let axisLine = axis.selectAll("path").style("stroke", "none");

        let axisTicks = axis.selectAll("line");

        let axisTickLabels = axis
            .selectAll("text")
            .attr("class", "tracker-tick-label");

        axis.attr(
            "width",
            renderInfo.dataAreaSize.width + maxTickLabelSize.width
        );
        axis.attr("height", tickLength + maxTickLabelSize.height);

        // Expand areas
        helper.expandArea(
            chartElements.svg,
            +maxTickLabelSize.width,
            tickLength + maxTickLabelSize.height
        );
        helper.expandArea(
            chartElements.graphArea,
            +maxTickLabelSize.width,
            tickLength + maxTickLabelSize.height
        );
    } else if (bulletInfo.orientation === "vertical") {
        let scale = d3.scaleLinear();
        scale.domain(domain).range([renderInfo.dataAreaSize.height, 0]);
        chartElements["scale"] = scale;

        let axisGen = d3.axisLeft(scale);
        axisGen.tickFormat(tickFormatFn);
        let axis = chartElements.dataArea
            .append("g")
            .attr("id", "axis")
            .attr("x", 0)
            .attr("y", 0)
            .call(axisGen)
            .attr("class", "tracker-axis");
        chartElements["axis"] = axis;

        let axisLine = axis.selectAll("path").style("stroke", "none");

        let axisTicks = axis.selectAll("line");

        let axisTickLabels = axis
            .selectAll("text")
            .attr("class", "tracker-tick-label");

        axis.attr("width", tickLength + maxTickLabelSize.width);
        axis.attr("height", renderInfo.dataAreaSize.width);

        // Expand areas
        helper.expandArea(
            chartElements.svg,
            tickLength + maxTickLabelSize.width,
            0
        );
        helper.expandArea(
            chartElements.graphArea,
            tickLength + maxTickLabelSize.width,
            0
        );

        helper.moveArea(
            chartElements.dataArea,
            tickLength + maxTickLabelSize.width,
            0
        );
    }
}

// Render quantitative range, poor/average/good/...
function renderBackPanel(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo,
    dataset: Dataset
) {
    // console.log("renderBackPanel");
    // console.log(dataset);

    if (!renderInfo || !bulletInfo) return;

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
                return Math.floor(scale(d.start));
            })
            .attr("y", function (d: any) {
                return 0;
            })
            .attr("width", function (d: any, i: number) {
                return Math.ceil(scale(d.end - d.start));
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
                return Math.floor(scale(d.end));
            })
            .attr("width", renderInfo.dataAreaSize.width)
            .attr("height", function (d: any) {
                return (
                    renderInfo.dataAreaSize.height -
                    Math.floor(scale(d.end - d.start))
                );
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
    bulletInfo: BulletInfo,
    dataset: Dataset
) {
    // console.log("renderBar");
    // console.log(dataset);
    let errorMessage = "";

    if (!renderInfo || !bulletInfo) return;

    let retActualValue = expr.resolveValue(bulletInfo.value, renderInfo);
    // console.log(retActualValue);
    if (typeof retActualValue === "string") {
        return retActualValue;
    }
    let actualValue = retActualValue;
    if (Number.isNaN(actualValue)) {
        errorMessage = "Invalid input value: " + retActualValue;
        return errorMessage;
    }
    let valueColor = bulletInfo.valueColor;

    let scale = chartElements.scale;

    if (bulletInfo.orientation === "horizontal") {
        let barWidth = renderInfo.dataAreaSize.height / 3;
        let bar = chartElements.dataArea
            .append("rect")
            .attr("x", scale(0))
            .attr("y", barWidth)
            .attr("width", Math.floor(scale(actualValue)))
            .attr("height", barWidth)
            .style("fill", valueColor);
    } else if (bulletInfo.orientation === "vertical") {
        let barWidth = renderInfo.dataAreaSize.width / 3;
        let bar = chartElements.dataArea
            .append("rect")
            .attr("x", barWidth)
            .attr("y", Math.floor(scale(actualValue)))
            .attr("width", barWidth)
            .attr(
                "height",
                renderInfo.dataAreaSize.height - Math.floor(scale(actualValue))
            )
            .style("fill", valueColor);
    }
}

// Render mark line for target value
function renderMark(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo,
    dataset: Dataset
) {
    // console.log("renderMark");
    // console.log(dataset);

    if (!renderInfo || !bulletInfo) return;

    let showMarker = bulletInfo.showMarker;
    if (!showMarker) return;

    let markerValue = bulletInfo.markerValue;
    let markerColor = bulletInfo.markerColor;

    let scale = chartElements.scale;

    if (bulletInfo.orientation === "horizontal") {
        let markerLength = (renderInfo.dataAreaSize.height * 2) / 3;
        let marker = chartElements.dataArea
            .append("rect")
            .attr("x", scale(markerValue) - 1.5)
            .attr("y", markerLength / 4)
            .attr("width", 3)
            .attr("height", markerLength)
            .style("fill", markerColor);
    } else if (bulletInfo.orientation === "vertical") {
        let markerLength = (renderInfo.dataAreaSize.width * 2) / 3;
        let marker = chartElements.dataArea
            .append("rect")
            .attr("x", markerLength / 4)
            .attr("y", scale(markerValue) - 1.5)
            .attr("width", markerLength)
            .attr("height", 3)
            .style("fill", markerColor);
    }
}

// Bullet graph https://en.wikipedia.org/wiki/Bullet_graph
export function renderBullet(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    bulletInfo: BulletInfo
) {
    // console.log("renderBullet");
    // console.log(renderInfo);
    if (!renderInfo || !bulletInfo) return;

    let datasetId = parseFloat(bulletInfo.dataset);
    let dataset = renderInfo.datasets.getDatasetById(datasetId);

    // Set initial dataArea size
    if (bulletInfo.orientation === "horizontal") {
        renderInfo.dataAreaSize = { width: 250, height: 24 };
    } else if (bulletInfo.orientation === "vertical") {
        renderInfo.dataAreaSize = { width: 24, height: 250 };
    }

    let chartElements = createAreas(canvas, renderInfo, bulletInfo);

    let retRenderAxis = renderAxis(
        chartElements,
        renderInfo,
        bulletInfo,
        dataset
    );
    if (typeof retRenderAxis === "string") {
        return retRenderAxis;
    }

    renderTitle(chartElements, renderInfo, bulletInfo);

    renderBackPanel(chartElements, renderInfo, bulletInfo, dataset);

    let retRenderBar = renderBar(
        chartElements,
        renderInfo,
        bulletInfo,
        dataset
    );
    if (typeof retRenderBar === "string") {
        return retRenderBar;
    }

    renderMark(chartElements, renderInfo, bulletInfo, dataset);

    setChartScale(canvas, chartElements, renderInfo);
}
