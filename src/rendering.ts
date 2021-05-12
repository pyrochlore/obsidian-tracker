import * as d3 from "d3";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    LineInfo,
    BarInfo,
    Size,
    Transform,
    CommonChartInfo,
    ChartElements,
    OutputType,
} from "./data";

function getTickInterval(datasets: Datasets) {
    let tickInterval;
    let days = datasets.getDates().length;

    if (days <= 15) {
        // number of ticks: 0-15
        tickInterval = d3.timeDay;
    } else if (days <= 4 * 15) {
        // number of ticks: 4-15
        tickInterval = d3.timeDay.every(4);
    } else if (days <= 7 * 15) {
        // number of ticks: 8-15
        tickInterval = d3.timeWeek;
    } else if (days <= 15 * 30) {
        // number of ticks: 4-15
        tickInterval = d3.timeMonth;
    } else if (days <= 15 * 60) {
        // number of ticks: 8-15
        tickInterval = d3.timeMonth.every(2);
    } else {
        tickInterval = d3.timeYear;
    }

    return tickInterval;
}

function getXTickFormat(datasets: Datasets) {
    let tickFormat;
    let days = datasets.getDates().length;

    if (days <= 15) {
        // number of ticks: 0-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    } else if (days <= 4 * 15) {
        // number of ticks: 4-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    } else if (days <= 7 * 15) {
        // number of ticks: 8-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    } else if (days <= 15 * 30) {
        // number of ticks: 4-15
        tickFormat = d3.timeFormat("%y %b");
    } else if (days <= 15 * 60) {
        // number of ticks: 8-15
        tickFormat = d3.timeFormat("%y %b");
    } else {
        tickFormat = d3.timeFormat("%Y");
    }

    return tickFormat;
}

function getYTickFormat() {
    // currently used for time value tick only
    // return a function convert value to time string
    function tickFormat(value: number): string {
        let dayStart = window.moment("00:00", "HH:mm", true);
        let tickTime = dayStart.add(value, "seconds");
        return tickTime.format("HH:mm");
    }

    return tickFormat;
}

// Is there a better way to measure text size??
function measureTextSize(
    text: string,
    styleClass: string = "",
    rotate: string = ""
): Size {
    var container = d3.select("body").append("svg");
    let textBlock = container
        .append("text")
        .text(text)
        .attr("x", -99999)
        .attr("y", -99999);
    if (styleClass) {
        textBlock.attr("class", styleClass);
    }
    if (rotate) {
        textBlock.attr("transform", "rotate(" + rotate + ")");
    }
    var size = container.node().getBBox();
    container.remove();
    return { width: size.width, height: size.height };
}

export function render(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("render");
    // console.log(renderInfo.datasets);

    // Data preprocessing

    for (let dataset of renderInfo.datasets) {
        if (renderInfo.penalty[dataset.getId()] !== null) {
            dataset.setPenalty(renderInfo.penalty[dataset.getId()]);
        }
        if (renderInfo.accum[dataset.getId()]) {
            dataset.accumulateValues();
        }
    }

    switch (renderInfo.output) {
        case OutputType.Line:
            return renderLineChart(canvas, renderInfo);
        case OutputType.Bar:
            return renderBarChart(canvas, renderInfo);
        case OutputType.Summary:
            return renderSummary(canvas, renderInfo);
        default:
            return "Unknown output type";
    }
}

function renderXAxis(chartElements: ChartElements, renderInfo: RenderInfo) {
    // console.log("renderXAxis");

    let chartInfo = null;
    if (renderInfo.output === OutputType.Line) {
        chartInfo = renderInfo.line;
    } else if (renderInfo.output === OutputType.Bar) {
        chartInfo = renderInfo.bar;
    } else {
        return;
    }
    if (!chartInfo) return;

    let datasets = renderInfo.datasets;
    let xDomain = d3.extent(datasets.getDates());
    let xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([0, renderInfo.dataAreaSize.width]);
    chartElements["xScale"] = xScale;

    let tickInterval = getTickInterval(datasets);
    let tickFormat = getXTickFormat(datasets);

    let xAxisGen = d3
        .axisBottom(xScale)
        .ticks(tickInterval)
        .tickFormat(tickFormat);
    let xAxis = chartElements.dataArea // axis includes ticks
        .append("g")
        .attr("id", "xAxis")
        .attr(
            "transform",
            "translate(0," + renderInfo.dataAreaSize.height + ")"
        ) // relative to graphArea
        .call(xAxisGen)
        .attr("class", "tracker-axis");
    if (chartInfo.xAxisColor) {
        xAxis.style("stroke", chartInfo.xAxisColor);
    }
    chartElements["xAxis"] = xAxis;

    let textSize = measureTextSize("99-99-99");

    let xAxisTickLabels = xAxis
        .selectAll("text")
        .attr("x", -1 * textSize.height * Math.cos((65 / 180) * Math.PI))
        .attr("y", 0)
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end")
        .attr("class", "tracker-tick-label");
    if (chartInfo.xAxisColor) {
        xAxisTickLabels.style("fill", chartInfo.xAxisColor);
    }

    let tickLength = 6;
    let tickLabelHeight = textSize.width * Math.sin((65 / 180) * Math.PI);
    let xAxisLabel = xAxis
        .append("text")
        .text(chartInfo.xAxisLabel)
        .attr(
            "transform",
            "translate(" +
                renderInfo.dataAreaSize.width / 2 +
                "," +
                (tickLength + tickLabelHeight) +
                ")"
        )
        .attr("class", "tracker-axis-label");
    if (chartInfo.xAxisLabelColor) {
        xAxisLabel.style("fill", chartInfo.xAxisLabelColor);
    }

    // xAxis height
    xAxis.attr("height", tickLength + tickLabelHeight);

    // Expand areas
    expandArea(chartElements.svg, 0, tickLength + tickLabelHeight);
    expandArea(chartElements.graphArea, 0, tickLength + tickLabelHeight);
}

function renderYAxis(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    yAxisLocation: string,
    datasetIds: Array<number>
) {
    // console.log("renderYAxis")
    // console.log(datasets);
    // console.log(renderInfo);
    // console.log(datasetIds);

    let chartInfo = null;
    if (renderInfo.output === OutputType.Line) {
        chartInfo = renderInfo.line;
    } else if (renderInfo.output === OutputType.Bar) {
        chartInfo = renderInfo.bar;
    } else {
        return;
    }
    if (!chartInfo) return;

    let datasets = renderInfo.datasets;
    if (datasetIds.length === 0) {
        return;
    }

    let yMinOfDatasets = null;
    let yMaxOfDatasets = null;
    let tmpValueIsTime = null;
    let valueIsTime = false;
    for (let datasetId of datasetIds) {
        let dataset = datasets.getDatasetById(datasetId);

        if (yMinOfDatasets === null || dataset.getYMin() < yMinOfDatasets) {
            yMinOfDatasets = dataset.getYMin();
        }
        if (yMaxOfDatasets === null || dataset.getYMax() > yMaxOfDatasets) {
            yMaxOfDatasets = dataset.getYMax();
        }

        // Need all datasets have same settings for time value
        valueIsTime = dataset.isUsingTimeValue();
        if (tmpValueIsTime === null) {
            tmpValueIsTime = valueIsTime;
        } else {
            if (valueIsTime !== tmpValueIsTime) {
                return "Not all values in time format";
            }
        }
    }
    // console.log(yMinOfDatasets);
    // console.log(yMaxOfDatasets);

    let yMin = yAxisLocation === "left" ? chartInfo.yMin[0] : chartInfo.yMin[1];
    let yMinAssigned = false;
    if (typeof yMin !== "number") {
        yMin = yMinOfDatasets;
    } else {
        yMinAssigned = true;
    }
    let yMax = yAxisLocation === "left" ? chartInfo.yMax[0] : chartInfo.yMax[1];
    let yMaxAssigned = false;
    if (typeof yMax !== "number") {
        yMax = yMaxOfDatasets;
    } else {
        yMaxAssigned = true;
    }
    if (yMax < yMin) {
        let yTmp = yMin;
        yMin = yMax;
        yMax = yTmp;
        let yTmpAssigned = yMinAssigned;
        yMinAssigned = yMaxAssigned;
        yMaxAssigned = yTmpAssigned;
    }

    let yExtent = yMax - yMin;

    let yScale = d3.scaleLinear();
    let yLower, yUpper;
    if (yMinAssigned) {
        yLower = yMin;
    } else {
        yLower = yMin - yExtent * 0.2;
    }
    if (yMaxAssigned) {
        yUpper = yMax;
    } else {
        yUpper = yMax + yExtent * 0.2;
    }
    // if it is bar chart, zero must be contained in the range
    if (renderInfo.output === OutputType.Bar) {
        if (yUpper < 0.0) {
            yUpper = 0;
        }
        if (yLower > 0.0) {
            yLower = 0.0;
        }
    }
    yScale.domain([yLower, yUpper]).range([renderInfo.dataAreaSize.height, 0]);

    if (yAxisLocation === "left") {
        chartElements["leftYScale"] = yScale;
    } else if (yAxisLocation === "right") {
        chartElements["rightYScale"] = yScale;
    }

    let yAxisColor =
        yAxisLocation === "left"
            ? chartInfo.yAxisColor[0]
            : chartInfo.yAxisColor[1];
    let yAxisLabelColor =
        yAxisLocation === "left"
            ? chartInfo.yAxisLabelColor[0]
            : chartInfo.yAxisLabelColor[1];
    let yAxisLabelText =
        yAxisLocation === "left"
            ? chartInfo.yAxisLabel[0]
            : chartInfo.yAxisLabel[1];
    let yAxisUnitText =
        yAxisLocation === "left"
            ? chartInfo.yAxisUnit[0]
            : chartInfo.yAxisUnit[1];

    let yAxisGen;
    if (yAxisLocation === "left") {
        yAxisGen = d3.axisLeft(yScale);
    } else {
        yAxisGen = d3.axisRight(yScale);
    }
    if (valueIsTime) {
        let tickFormat = getYTickFormat();
        yAxisGen.tickFormat(tickFormat);
    }
    let yAxis = chartElements.dataArea
        .append("g")
        .attr("id", "yAxis")
        .call(yAxisGen)
        .attr("class", "tracker-axis");
    if (yAxisLocation == "right") {
        yAxis.attr(
            "transform",
            "translate(" + renderInfo.dataAreaSize.width + " ,0)"
        );
    }
    if (yAxisLocation === "left") {
        chartElements["leftYAxis"] = yAxis;
    } else if (yAxisLocation === "right") {
        chartElements["rightYAxis"] = yAxis;
    }

    let yAxisLine = yAxis.selectAll("path");
    if (yAxisColor) {
        yAxisLine.style("stroke", yAxisColor);
    }

    let yAxisTicks = yAxis.selectAll("line");
    if (yAxisColor) {
        yAxisTicks.style("stroke", yAxisColor);
    }

    let yAxisTickLabels = yAxis
        .selectAll("text")
        .attr("class", "tracker-tick-label");
    if (yAxisColor) {
        yAxisTickLabels.style("fill", yAxisColor);
    }

    // Get max tick label width
    let yTickFormat = d3.tickFormat(yLower, yUpper, 10);
    let yLowerLabelSize = measureTextSize(
        yTickFormat(yLower),
        "tracker-axis-label"
    );
    let yUpperLabelSize = measureTextSize(
        yTickFormat(yUpper),
        "tracker-axis-label"
    );
    let maxTickLabelWidth = Math.max(
        yLowerLabelSize.width,
        yUpperLabelSize.width
    );

    if (yAxisUnitText !== "") {
        yAxisLabelText += " (" + yAxisUnitText + ")";
    }
    let yTickLength = 6;
    let yAxisLabelSize = measureTextSize(yAxisLabelText);
    let yAxisLabel = yAxis
        .append("text")
        .text(yAxisLabelText)
        .attr("transform", "rotate(-90)")
        .attr("x", (-1 * renderInfo.dataAreaSize.height) / 2.0)
        .attr("class", "tracker-axis-label");
    if (yAxisLocation === "left") {
        yAxisLabel.attr(
            "y",
            -yTickLength - maxTickLabelWidth - yAxisLabelSize.height / 2.0
        );
    } else {
        yAxisLabel.attr(
            "y",
            +yTickLength + maxTickLabelWidth + yAxisLabelSize.height / 2.0
        );
    }
    if (yAxisLabelColor) {
        yAxisLabel.style("fill", yAxisLabelColor);
    }

    let yAxisWidth = yAxisLabelSize.height + maxTickLabelWidth + yTickLength;
    yAxis.attr("width", yAxisWidth);

    // Expand areas
    expandArea(chartElements.svg, yAxisWidth, 0);
    expandArea(chartElements.graphArea, yAxisWidth, 0);

    // Move areas
    if (yAxisLocation === "left") {
        // Move dataArea
        moveArea(chartElements.dataArea, yAxisWidth, 0);

        // Move title
        if (chartElements.title) {
            moveArea(chartElements.title, yAxisWidth, 0);
        }
    }
}

function renderLine(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset,
    yAxisLocation: string
) {
    // console.log(dataset);
    // console.log(renderInfo);

    if (renderInfo.output !== OutputType.Line) return;

    let lineInfo = renderInfo.line;
    if (!lineInfo) return;

    let yScale: any = null;
    if (yAxisLocation === "left") {
        yScale = chartElements.leftYScale;
    } else if (yAxisLocation === "right") {
        yScale = chartElements.rightYScale;
    }

    if (lineInfo.showLine[dataset.getId()]) {
        let lineGen = d3
            .line<DataPoint>()
            .defined(function (p: DataPoint) {
                return p.value !== null;
            })
            .x(function (p: DataPoint) {
                return chartElements.xScale(p.date);
            })
            .y(function (p: DataPoint) {
                return yScale(p.value);
            });

        let line = chartElements.dataArea
            .append("path")
            .attr("class", "tracker-line")
            .style("stroke-width", lineInfo.lineWidth[dataset.getId()]);

        if (lineInfo.fillGap[dataset.getId()]) {
            line.datum(
                Array.from(dataset).filter(function (p) {
                    return p.value !== null;
                })
            ).attr("d", lineGen as any);
        } else {
            line.datum(dataset).attr("d", lineGen as any);
        }

        if (lineInfo.lineColor[dataset.getId()]) {
            line.style("stroke", lineInfo.lineColor[dataset.getId()]);
        }
    }
}

function renderPoints(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset,
    yAxisLocation: string
) {
    // console.log(lineInfo);
    // console.log(dataset);

    if (renderInfo.output !== OutputType.Line) return;

    let lineInfo = renderInfo.line;
    if (!lineInfo) return;

    let yScale: any = null;
    if (yAxisLocation === "left") {
        yScale = chartElements.leftYScale;
    } else if (yAxisLocation === "right") {
        yScale = chartElements.rightYScale;
    }

    if (lineInfo.showPoint[dataset.getId()]) {
        let dots = chartElements.dataArea
            .selectAll("dot")
            .data(
                Array.from(dataset).filter(function (p: DataPoint) {
                    return p.value !== null;
                })
            )
            .enter()
            .append("circle")
            .attr("r", lineInfo.pointSize[dataset.getId()])
            .attr("cx", function (p: DataPoint) {
                return chartElements.xScale(p.date);
            })
            .attr("cy", function (p: DataPoint) {
                return yScale(p.value);
            })
            .attr("date", function (p: DataPoint) {
                return d3.timeFormat("%y-%m-%d")(p.date as any);
            })
            .attr("value", function (p: DataPoint) {
                if (p.value !== null) {
                    if (Number.isInteger(p.value)) {
                        return p.value.toFixed(0);
                    }
                    return p.value.toFixed(2);
                }
            })
            .attr("class", "tracker-dot");
        if (lineInfo.pointColor[dataset.getId()]) {
            dots.style("fill", lineInfo.pointColor[dataset.getId()]);

            if (
                lineInfo.pointBorderColor[dataset.getId()] &&
                lineInfo.pointBorderWidth[dataset.getId()] > 0.0
            ) {
                dots.style(
                    "stroke",
                    lineInfo.pointBorderColor[dataset.getId()]
                );
                dots.style(
                    "stroke-width",
                    lineInfo.pointBorderWidth[dataset.getId()]
                );
            }
        }

        if (lineInfo.allowInspectData) {
            let tooltip = chartElements.svg.append("g").style("opacity", 0);
            let tooltipBg = tooltip
                .append("rect")
                .attr("width", renderInfo.tooltipSize.width)
                .attr("height", renderInfo.tooltipSize.height)
                .attr("class", "tracker-tooltip");
            let tooltipLabel = tooltip
                .append("text")
                .attr("width", renderInfo.tooltipSize.width)
                .attr("height", renderInfo.tooltipSize.height)
                .attr("class", "tracker-tooltip-label");
            let tooltipLabelDate = tooltipLabel
                .append("tspan")
                .attr("x", 4)
                .attr("y", (renderInfo.tooltipSize.height / 5) * 2);
            let tooltipLabelValue = tooltipLabel
                .append("tspan")
                .attr("x", 4)
                .attr("y", (renderInfo.tooltipSize.height / 5) * 4);

            dots.on("mouseenter", function (event: any) {
                tooltipLabelDate.text("date:" + d3.select(this).attr("date"));
                tooltipLabelValue.text(
                    "value:" + d3.select(this).attr("value")
                );

                const [x, y] = d3.pointer(event);
                if (x < renderInfo.dataAreaSize.width / 2) {
                    tooltip.attr(
                        "transform",
                        "translate(" +
                            (x + renderInfo.tooltipSize.width * 1.3) +
                            "," +
                            (y - renderInfo.tooltipSize.height * 1.0) +
                            ")"
                    );
                } else {
                    tooltip.attr(
                        "transform",
                        "translate(" +
                            (x - renderInfo.tooltipSize.width * 0.0) +
                            "," +
                            (y - renderInfo.tooltipSize.height * 1.0) +
                            ")"
                    );
                }

                tooltip.transition().duration(200).style("opacity", 1);
            }).on("mouseleave", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });
        }
    }
}

function renderBar(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    dataset: Dataset,
    yAxisLocation: string,
    currBarSet: number,
    totalNumOfBarSets: number
) {
    // console.log(dataset);
    // console.log(barInfo);
    // console.log("%d/%d", currBarSet, totalNumOfBarSets);

    if (renderInfo.output !== OutputType.Bar) return;

    let barInfo = renderInfo.bar;
    if (!barInfo) return;

    let barGap = 1;
    let barSetWidth = renderInfo.dataAreaSize.width / dataset.getLength();
    let barWidth = barSetWidth;
    if (barSetWidth - barGap > 0) {
        barWidth = barSetWidth - barGap;
    }
    barWidth = barWidth / totalNumOfBarSets;

    let portionLeft = (currBarSet + 1) / totalNumOfBarSets;

    let yScale: any = null;
    if (yAxisLocation === "left") {
        yScale = chartElements.leftYScale;
    } else if (yAxisLocation === "right") {
        yScale = chartElements.rightYScale;
    }

    let bars = chartElements.dataArea
        .selectAll("bar")
        .data(
            Array.from(dataset).filter(function (p: DataPoint) {
                return p.value !== null;
            })
        )
        .enter()
        .append("rect")
        .attr("x", function (p: DataPoint, i: number) {
            if (i === 0) {
                let portionVisible = currBarSet + 1 - totalNumOfBarSets / 2.0;
                if (portionVisible < 1.0) {
                    return (
                        chartElements.xScale(p.date) -
                        barSetWidth / 2.0 +
                        currBarSet * barWidth +
                        portionVisible * barWidth
                    );
                }
            }
            return (
                chartElements.xScale(p.date) -
                barSetWidth / 2.0 +
                currBarSet * barWidth
            );
        })
        .attr("y", function (p: DataPoint) {
            return yScale(Math.max(p.value, 0));
        })
        .attr("width", function (p: DataPoint, i: number) {
            if (i === 0) {
                let portionVisible = currBarSet + 1 - totalNumOfBarSets / 2.0;
                if (portionVisible < 0.0) {
                    return 0.0;
                } else if (portionVisible < 1.0) {
                    return barWidth * portionVisible;
                }
                return barWidth;
            } else if (i === dataset.getLength() - 1) {
                let portionVisible =
                    1.0 - (currBarSet + 1 - totalNumOfBarSets / 2.0);
                if (portionVisible < 0.0) {
                    return 0.0;
                } else if (portionVisible < 1.0) {
                    return barWidth * portionVisible;
                }
                return barWidth;
            }
            return barWidth;
        })
        .attr("height", function (p: DataPoint) {
            if (p.value !== null) {
                return Math.abs(yScale(p.value) - yScale(0));
            }
        })
        .attr("class", "tracker-bar");

    if (barInfo.barColor[dataset.getId()]) {
        bars.style("fill", barInfo.barColor[dataset.getId()]);
    }
}

function renderLegend(chartElements: ChartElements, renderInfo: RenderInfo) {
    // console.log(renderInfo.legendPosition);
    // console.log(renderInfo.legendOrientation);

    // Get chart info
    let chartInfo = null;
    if (renderInfo.output === OutputType.Line) {
        chartInfo = renderInfo.line;
    } else if (renderInfo.output === OutputType.Bar) {
        chartInfo = renderInfo.bar;
    }

    // Get chart elements
    let svg = chartElements.svg;
    let graphArea = chartElements.graphArea;
    let dataArea = chartElements.dataArea;
    let title = chartElements.title;
    let xAxis = chartElements.xAxis;
    let leftYAxis = chartElements.leftYAxis;
    let rightYAxis = chartElements.rightYAxis;

    // Get element width and height
    let titleHeight = 0.0;
    if (title) {
        titleHeight = parseFloat(title.attr("height"));
    }
    let xAxisHeight = parseFloat(xAxis.attr("height"));
    let leftYAxisWidth = 0.0;
    if (leftYAxis) {
        leftYAxisWidth = parseFloat(leftYAxis.attr("width"));
    }
    let rightYAxisWidth = 0.0;
    if (rightYAxis) {
        rightYAxisWidth = parseFloat(rightYAxis.attr("width"));
    }
    // Get datasets names and dimensions
    let datasets = renderInfo.datasets;
    let names = datasets.getNames();
    let nameSizes = names.map(function (n) {
        return measureTextSize(n, "tracker-legend-label");
    });
    let indMaxName = 0;
    let maxNameWidth = 0.0;
    for (let ind = 0; ind < names.length; ind++) {
        if (nameSizes[ind].width > maxNameWidth) {
            maxNameWidth = nameSizes[ind].width;
            indMaxName = ind;
        }
    }
    let maxName = names[indMaxName];
    let characterWidth = maxNameWidth / maxName.length;
    let nameHeight = nameSizes[indMaxName].height;
    let numNames = names.length;

    let xSpacing = 2 * characterWidth;
    let ySpacing = nameHeight;
    let markerWidth = 2 * characterWidth;

    // Get legend width and height
    let legendWidth = 0;
    let legendHeight = 0;
    if (chartInfo.legendOrientation === "vertical") {
        legendWidth = xSpacing * 3 + markerWidth + maxNameWidth;
        legendHeight = (numNames + 1) * ySpacing;
    } else if (chartInfo.legendOrientation === "horizontal") {
        legendWidth =
            (2 * xSpacing + markerWidth) * numNames +
            xSpacing +
            d3.sum(nameSizes, function (s) {
                return s.width;
            });
        legendHeight = ySpacing + nameHeight;
    }
    // console.log(
    //     `maxName: ${maxName}, characterWidth: ${characterWidth}, maxNameWidth: ${maxNameWidth}`
    // );
    // console.log(`xSpacing:${xSpacing}, numNames: ${numNames}, markerWidth: ${markerWidth}`);
    // console.log(`legendWidth: ${legendWidth}, legendHeight: ${legendHeight}`);

    // Calcualte lengendX and legendY
    let legendX = 0.0; // relative to graphArea
    let legendY = 0.0;
    if (chartInfo.legendPosition === "top") {
        // below title
        legendX =
            leftYAxisWidth +
            renderInfo.dataAreaSize.width / 2.0 -
            legendWidth / 2.0;
        legendY = titleHeight;
        // Expand svg
        expandArea(svg, 0, legendHeight + ySpacing);
        // Move dataArea down
        moveArea(dataArea, 0, legendHeight + ySpacing);
    } else if (chartInfo.legendPosition === "bottom") {
        // bellow x-axis label
        legendX =
            leftYAxisWidth +
            renderInfo.dataAreaSize.width / 2.0 -
            legendWidth / 2.0;
        legendY =
            titleHeight +
            renderInfo.dataAreaSize.height +
            xAxisHeight +
            ySpacing;
        // Expand svg
        expandArea(svg, 0, legendHeight + ySpacing);
    } else if (chartInfo.legendPosition === "left") {
        legendX = 0;
        legendY =
            titleHeight +
            renderInfo.dataAreaSize.height / 2.0 -
            legendHeight / 2.0;
        // Expand svg
        expandArea(svg, legendWidth + xSpacing, 0);
        // Move dataArea right
        moveArea(dataArea, legendWidth + xSpacing, 0);
    } else if (chartInfo.legendPosition === "right") {
        legendX =
            renderInfo.dataAreaSize.width +
            leftYAxisWidth +
            rightYAxisWidth +
            xSpacing;
        legendY =
            titleHeight +
            renderInfo.dataAreaSize.height / 2.0 -
            legendHeight / 2.0;
        // Expand svg
        expandArea(svg, legendWidth + xSpacing, 0);
    } else {
        return;
    }
    // console.log(`legendX: ${legendX}, legendY: ${legendY}`);

    let legend = chartElements.graphArea
        .append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");
    // console.log('legendX: %d, legendY: %d', legendX, legendY);

    let legendBg = legend
        .append("rect")
        .attr("class", "tracker-legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight);
    if (chartInfo.legendBgColor) {
        legendBg.style("fill", chartInfo.legendBgColor);
    }
    if (chartInfo.legendBorderColor) {
        legendBg.style("stroke", chartInfo.legendBorderColor);
    }

    let firstMarkerX = xSpacing;
    let firstMarkerY = nameHeight;
    let firstLabelX = firstMarkerX + xSpacing + markerWidth; // xSpacing + 2 * xSpaing
    let firstLabelY = firstMarkerY;

    if (chartInfo.legendOrientation === "vertical") {
        if (renderInfo.output === OutputType.Line) {
            // lines
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("line")
                .attr("x1", firstMarkerX)
                .attr("x2", firstMarkerX + markerWidth)
                .attr("y1", function (name: string, i: number) {
                    return firstMarkerY + i * ySpacing;
                })
                .attr("y2", function (name: string, i: number) {
                    return firstMarkerY + i * ySpacing;
                })
                .style("stroke", function (name: string, i: number) {
                    return datasets
                        .getDatasetById(i)
                        .getLineInfo().lineColor[i];
                });

            // points
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("circle")
                .attr("cx", firstMarkerX + markerWidth / 2.0)
                .attr("cy", function (name: string, i: number) {
                    return firstMarkerY + i * ySpacing;
                })
                .attr("r", function (name: string, i: number) {
                    if (datasets.getDatasetById(i).getLineInfo().showPoint[i]) {
                        return datasets.getDatasetById(i).getLineInfo()
                            .pointSize[i];
                    }
                    return 0.0;
                })
                .style("fill", function (name: string, i: number) {
                    return datasets
                        .getDatasetById(i)
                        .getLineInfo().pointColor[i];
                });
        } else if (renderInfo.output === OutputType.Bar) {
            // bars
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("rect")
                .attr("x", firstMarkerX)
                .attr("y", function (name: string, i: number) {
                    return firstMarkerY + i * ySpacing - nameHeight / 2.0;
                })
                .attr("width", markerWidth)
                .attr("height", nameHeight)
                .style("fill", function (name: string, i: number) {
                    return datasets.getDatasetById(i).getBarInfo().barColor[i];
                });
        }

        // names
        let nameLabels = legend
            .selectAll("labels")
            .data(names)
            .enter()
            .append("text")
            .attr("x", firstLabelX)
            .attr("y", function (name: string, i: number) {
                return firstLabelY + i * ySpacing;
            })
            .text(function (name: string) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        if (renderInfo.output === OutputType.Line) {
            nameLabels.style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
            });
        } else if (renderInfo.output === OutputType.Bar) {
            nameLabels.style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getBarInfo().barColor[i];
            });
        }
    } else if (chartInfo.legendOrientation === "horizontal") {
        let currRenderPosX = 0.0;
        let currRenderPosX2 = 0.0;
        if (renderInfo.output === OutputType.Line) {
            // lines
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("line")
                .attr("x1", function (name: string, i: number) {
                    if (i === 0) {
                        currRenderPosX = firstMarkerX;
                    } else {
                        currRenderPosX +=
                            nameSizes[i].width +
                            xSpacing +
                            markerWidth +
                            xSpacing;
                    }
                    return currRenderPosX;
                })
                .attr("x2", function (name: string, i: number) {
                    if (i === 0) {
                        currRenderPosX2 = firstMarkerX + markerWidth;
                    } else {
                        currRenderPosX2 +=
                            nameSizes[i].width +
                            xSpacing +
                            markerWidth +
                            xSpacing;
                    }
                    return currRenderPosX2;
                })
                .attr("y1", firstMarkerY)
                .attr("y2", firstMarkerY)
                .style("stroke", function (name: string, i: number) {
                    return datasets
                        .getDatasetById(i)
                        .getLineInfo().lineColor[i];
                });

            // points
            currRenderPosX = 0.0;
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("circle")
                .attr("cx", function (name: string, i: number) {
                    if (i === 0) {
                        currRenderPosX = firstMarkerX + markerWidth / 2.0;
                    } else {
                        currRenderPosX +=
                            nameSizes[i].width +
                            xSpacing +
                            markerWidth +
                            xSpacing;
                    }
                    return currRenderPosX;
                })
                .attr("cy", firstMarkerY)
                .attr("r", function (name: string, i: number) {
                    if (datasets.getDatasetById(i).getLineInfo().showPoint[i]) {
                        return datasets.getDatasetById(i).getLineInfo()
                            .pointSize[i];
                    }
                    return 0.0;
                })
                .style("fill", function (name: string, i: number) {
                    return datasets
                        .getDatasetById(i)
                        .getLineInfo().pointColor[i];
                });
        } else if (renderInfo.output === OutputType.Bar) {
            // bars
            currRenderPosX = 0.0;
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("rect")
                .attr("x", function (name: string, i: number) {
                    if (i === 0) {
                        currRenderPosX = firstMarkerX;
                    } else {
                        currRenderPosX +=
                            nameSizes[i].width +
                            xSpacing +
                            markerWidth +
                            xSpacing;
                    }
                    return currRenderPosX;
                })
                .attr("y", firstMarkerY - nameHeight / 2.0)
                .attr("width", markerWidth)
                .attr("height", nameHeight)
                .style("fill", function (name: string, i: number) {
                    return datasets.getDatasetById(i).getBarInfo().barColor[i];
                });
        }

        // names
        currRenderPosX = 0.0;
        let nameLabels = legend
            .selectAll("labels")
            .data(names)
            .enter()
            .append("text")
            .attr("x", function (name: string, i: number) {
                if (i === 0) {
                    currRenderPosX = firstLabelX;
                } else {
                    currRenderPosX +=
                        nameSizes[i].width + xSpacing + markerWidth + xSpacing;
                }
                return currRenderPosX;
            })
            .attr("y", firstLabelY)
            .text(function (name: string) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        if (renderInfo.output === OutputType.Line) {
            nameLabels.style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
            });
        } else if (renderInfo.output === OutputType.Bar) {
            nameLabels.style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getBarInfo().barColor[i];
            });
        }
    }
}

function renderTitle(chartElements: ChartElements, renderInfo: RenderInfo) {
    // console.log("renderTitle")
    // under graphArea

    let chartInfo = null;
    if (renderInfo.output === OutputType.Line) {
        chartInfo = renderInfo.line;
    } else if (renderInfo.output === OutputType.Bar) {
        chartInfo = renderInfo.bar;
    } else {
        return;
    }
    if (!chartInfo) return;

    if (!chartInfo.title) return;
    let titleSize = measureTextSize(chartInfo.title, "tracker-title");

    // Append title
    let title = chartElements.graphArea
        .append("text")
        .text(chartInfo.title) // pivot at center
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
        .attr("class", "tracker-title");
    chartElements["title"] = title;

    // Expand parent areas
    expandArea(chartElements.svg, 0, titleSize.height);
    expandArea(chartElements.graphArea, 0, titleSize.height);

    // Move sibling areas
    moveArea(chartElements.dataArea, 0, titleSize.height);

    return;
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

function createAreas(
    canvas: HTMLElement,
    renderInfo: RenderInfo
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

function expandArea(area: any, addW: number, addH: number) {
    let oriWidth = parseFloat(area.attr("width")) | 0;
    let oriHeight = parseFloat(area.attr("height")) | 0;
    let newWidth = oriWidth + addW;
    let newHeight = oriHeight + addH;
    area.attr("width", newWidth);
    area.attr("height", newHeight);
}

function moveArea(area: any, shiftX: number, shiftY: number) {
    let trans = new Transform(area.attr("transform"));
    area.attr(
        "transform",
        "translate(" +
            (trans.translateX + shiftX) +
            "," +
            (trans.translateY + shiftY) +
            ")"
    );
}

function renderLineChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderLineChart");
    // console.log(renderInfo);
    if (renderInfo.line === null) return;

    let chartElements = createAreas(canvas, renderInfo);

    renderTitle(chartElements, renderInfo);

    renderXAxis(chartElements, renderInfo);
    // console.log(chartElements.xAxis);
    // console.log(chartElements.xScale);

    let datasetOnLeftYAxis = [];
    let datasetOnRightYAxis = [];
    for (let ind = 0; ind < renderInfo.line.yAxisLocation.length; ind++) {
        let yAxisLocation = renderInfo.line.yAxisLocation[ind];
        if (yAxisLocation.toLowerCase() === "left") {
            datasetOnLeftYAxis.push(ind);
        } else {
            // right
            datasetOnRightYAxis.push(ind);
        }
    }

    let retRenderLeftYAxis = renderYAxis(chartElements, renderInfo, "left", datasetOnLeftYAxis);
    if (typeof retRenderLeftYAxis === "string") {
        return retRenderLeftYAxis;
    }

    if (chartElements.leftYAxis && chartElements.leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderLine(chartElements, renderInfo, dataset, "left");

            renderPoints(chartElements, renderInfo, dataset, "left");
        }
    }

    let retRenderRightYAxis = renderYAxis(chartElements, renderInfo, "right", datasetOnRightYAxis);
    if (typeof retRenderRightYAxis === "string") {
        return retRenderRightYAxis;
    }

    if (chartElements.rightYAxis && chartElements.rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderLine(chartElements, renderInfo, dataset, "right");

            renderPoints(chartElements, renderInfo, dataset, "right");
        }
    }

    if (renderInfo.line.showLegend) {
        renderLegend(chartElements, renderInfo);
    }

    setChartScale(canvas, chartElements, renderInfo);
}

function renderBarChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderBarChart");
    // console.log(renderInfo);
    if (renderInfo.bar === null) return;

    let chartElements = createAreas(canvas, renderInfo);

    renderTitle(chartElements, renderInfo);

    renderXAxis(chartElements, renderInfo);

    let datasetOnLeftYAxis = [];
    let datasetOnRightYAxis = [];
    for (let ind = 0; ind < renderInfo.bar.yAxisLocation.length; ind++) {
        let yAxisLocation = renderInfo.bar.yAxisLocation[ind];
        if (yAxisLocation.toLowerCase() === "left") {
            datasetOnLeftYAxis.push(ind);
        } else {
            // right
            datasetOnRightYAxis.push(ind);
        }
    }

    let retRenderLeftYAxis = renderYAxis(chartElements, renderInfo, "left", datasetOnLeftYAxis);
    if (typeof retRenderLeftYAxis === "string") {
        return retRenderLeftYAxis;
    }

    let totalNumOfBarSets =
        datasetOnLeftYAxis.length + datasetOnRightYAxis.length;
    let currBarSet = 0;

    if (chartElements.leftYAxis && chartElements.leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderBar(
                chartElements,
                renderInfo,
                dataset,
                "left",
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    let retRenderRightYAxis = renderYAxis(chartElements, renderInfo, "right", datasetOnRightYAxis);
    if (typeof retRenderRightYAxis === "string") {
        return retRenderRightYAxis;
    }

    if (chartElements.rightYAxis && chartElements.rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderBar(
                chartElements,
                renderInfo,
                dataset,
                "right",
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    if (renderInfo.bar.showLegend) {
        renderLegend(chartElements, renderInfo);
    }

    setChartScale(canvas, chartElements, renderInfo);
}

function checkSummaryTemplateValid(summaryTemplate: string): boolean {
    return true;
}

let fnSet = {
    min: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.min(dataset.getValues());
    },
    max: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.max(dataset.getValues());
    },
    sum: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.sum(dataset.getValues());
    },
    count: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return dataset.getLengthNotNull();
    },
    days: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let result = dataset.getLength();
        return result;
    },
    maxStreak: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxStreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        for (let dataPoint of dataset) {
            if (dataPoint.value !== null) {
                streak++;
            } else {
                streak = 0;
            }
            if (streak > maxStreak) {
                maxStreak = streak;
            }
        }
        return maxStreak;
    },
    maxBreak: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let maxBreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);

        for (let dataPoint of dataset) {
            if (dataPoint.value === null) {
                streak++;
            } else {
                streak = 0;
            }
            if (streak > maxBreak) {
                maxBreak = streak;
            }
        }
        return maxBreak;
    },
    lastStreak: function (renderInfo: RenderInfo, datasetId: number) {
        let streak = 0;
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let values = dataset.getValues();
        for (let ind = values.length - 1; ind >= 0; ind--) {
            let value = values[ind];
            if (value === null) {
                break;
            } else {
                streak++;
            }
        }
        return streak;
    },
    average: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    median: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.median(dataset.getValues());
    },
    variance: function (renderInfo: RenderInfo, datasetId: number) {
        let dataset = renderInfo.datasets.getDatasetById(datasetId);
        return d3.variance(dataset.getValues());
    },
};

function renderSummary(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderSummary");
    // console.log(renderInfo);
    if (renderInfo.summary === null) return;

    let outputSummary = "";
    if (checkSummaryTemplateValid(renderInfo.summary.template)) {
        outputSummary = renderInfo.summary.template;
    } else {
        return "Invalid summary template";
    }

    let replaceMap: { [key: string]: string } = {};
    // Loop over fnSet, prepare replaceMap
    Object.entries(fnSet).forEach(([fnName, fn]) => {
        // {{\s*max(\(\s*Dataset\(\s*(?<datasetId>\d+)\s*\)\s*\))?\s*}}
        let strRegex =
            "{{\\s*" +
            fnName +
            "(\\(\\s*Dataset\\(\\s*((?<datasetId>\\d+)|(?<datasetName>\\w+))\\s*\\)\\s*\\))?\\s*}}";
        // console.log(strRegex);
        let regex = new RegExp(strRegex, "gm");
        let match;
        while ((match = regex.exec(outputSummary))) {
            // console.log(match);
            if (typeof match.groups !== "undefined") {
                if (typeof match.groups.datasetId !== "undefined") {
                    let datasetId = parseInt(match.groups.datasetId);
                    // console.log(datasetId);
                    if (Number.isInteger(datasetId)) {
                        let strReplaceRegex =
                            "{{\\s*" +
                            fnName +
                            "(\\(\\s*Dataset\\(\\s*" +
                            datasetId.toString() +
                            "\\s*\\)\\s*\\))?\\s*}}";

                        if (!(strReplaceRegex in replaceMap)) {
                            let result = fn(renderInfo, datasetId); // calculate result
                            let strResult = "{{NA}}";
                            if (
                                typeof result !== "undefined" &&
                                result !== null
                            ) {
                                if (Number.isInteger(result)) {
                                    strResult = result.toFixed(0);
                                } else {
                                    strResult = result.toFixed(2);
                                }
                            }

                            replaceMap[strReplaceRegex] = strResult;
                        }
                    }
                } else if (typeof match.groups.datasetName !== "undefined") {
                    let datasetName = match.groups.datasetName;
                    // console.log(datasetName);
                    let strReplaceRegex =
                        "{{\\s*" +
                        fnName +
                        "(\\(\\s*Dataset\\(\\s*" +
                        datasetName +
                        "\\s*\\)\\s*\\))?\\s*}}";

                    let datasetId = renderInfo.datasetName.indexOf(datasetName);
                    // console.log(datasetName);
                    // console.log(renderInfo.datasetName);
                    // console.log(datasetId);
                    if (!(strReplaceRegex in replaceMap)) {
                        let strResult = "{{NA}}";
                        if (datasetId >= 0) {
                            let result = fn(renderInfo, datasetId); // calculate result
                            if (
                                typeof result !== "undefined" &&
                                result !== null
                            ) {
                                if (Number.isInteger(result)) {
                                    strResult = result.toFixed(0);
                                } else {
                                    strResult = result.toFixed(2);
                                }
                            }
                        }
                        replaceMap[strReplaceRegex] = strResult;
                    }
                } else {
                    // no datasetId assigned use id 0
                    // console.log("{{" + fnName + "}}")
                    let strReplaceRegex = "{{\\s*" + fnName + "\\s*}}";
                    if (!(strReplaceRegex in replaceMap)) {
                        let result = fn(renderInfo, 0); // calculate result
                        let strResult = "{{NA}}";
                        if (typeof result !== "undefined" && result !== null) {
                            if (Number.isInteger(result)) {
                                strResult = result.toFixed(0);
                            } else {
                                strResult = result.toFixed(2);
                            }
                        }

                        replaceMap[strReplaceRegex] = strResult;
                    }
                }
            } else {
                // groups undefined
                // no datasetId assigned use id 0
                // console.log("{{" + fnName + "}}")
                let strReplaceRegex = "{{\\s*" + fnName + "\\s*}}";
                if (!(strReplaceRegex in replaceMap)) {
                    let result = fn(renderInfo, 0); // calculate result
                    let strResult = "{{NA}}";
                    if (typeof result !== "undefined" && result !== null) {
                        if (Number.isInteger(result)) {
                            strResult = result.toFixed(0);
                        } else {
                            strResult = result.toFixed(2);
                        }
                    }

                    replaceMap[strReplaceRegex] = strResult;
                }
            }
        }
    });
    // console.log(replaceMap);
    // Do replace
    for (let strReplaceRegex in replaceMap) {
        let strResult = replaceMap[strReplaceRegex];
        let regex = new RegExp(strReplaceRegex, "gi");
        outputSummary = outputSummary.replace(regex, strResult);
    }

    if (outputSummary !== "") {
        let textBlock = d3.select(canvas).append("div");
        if (outputSummary.includes("\n")) {
            let outputLines = outputSummary.split("\n");
            for (let outputLine of outputLines) {
                textBlock.append("div").text(outputLine);
            }
        } else {
            textBlock.text(outputSummary);
        }

        if (renderInfo.summary.style !== "") {
            textBlock.attr("style", renderInfo.summary.style);
        }
    }
}

export function renderErrorMessage(canvas: HTMLElement, errorMessage: string) {
    let svg = d3
        .select(canvas)
        .append("div")
        .text(errorMessage)
        .style("background-color", "white")
        .style("margin-bottom", "20px")
        .style("padding", "10px")
        .style("color", "red");
}
