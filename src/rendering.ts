import * as d3 from "d3";
import { NamespaceLocalObject } from "d3";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    LineInfo,
    BarInfo,
    Size,
    Transform,
} from "./data";

// Dimension
let margin = { top: 10, right: 70, bottom: 70, left: 70 };
let width = 500 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;
let tooltipSize = { width: 90, height: 45 };

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

function getTickFormat(datasets: Datasets) {
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

    if (renderInfo.output === "") {
        if (renderInfo.summary !== null) {
            return renderSummary(canvas, renderInfo);
        }
        if (renderInfo.bar !== null) {
            return renderBarChart(canvas, renderInfo);
        }
        // Default
        return renderLineChart(canvas, renderInfo);
    } else if (renderInfo.output === "line") {
        return renderLineChart(canvas, renderInfo);
    } else if (renderInfo.output === "bar") {
        return renderBarChart(canvas, renderInfo);
    } else if (renderInfo.output === "summary") {
        return renderSummary(canvas, renderInfo);
    }

    return "Unknown output type";
}

function renderXAxis(
    svg: any,
    graphArea: any,
    datasets: Datasets,
    renderInfo: LineInfo | BarInfo
) {
    let xDomain = d3.extent(datasets.getDates());
    let xScale = d3.scaleTime().domain(xDomain).range([0, width]);

    let tickInterval = getTickInterval(datasets);
    let tickFormat = getTickFormat(datasets);

    let xAxisGen = d3
        .axisBottom(xScale)
        .ticks(tickInterval)
        .tickFormat(tickFormat);
    let xAxis = graphArea // axis includes ticks
        .append("g")
        .attr("id", "xAxis")
        .attr("transform", "translate(0," + height + ")") // relative to graphArea
        .call(xAxisGen)
        .attr("class", "tracker-axis");
    if (renderInfo.xAxisColor) {
        xAxis.style("stroke", renderInfo.xAxisColor);
    }

    let textSize = measureTextSize("99-99-99");

    let xAxisTickLabels = xAxis
        .selectAll("text")
        .attr("x", -1 * textSize.height * Math.cos((65 / 180) * Math.PI))
        .attr("y", 0)
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end")
        .attr("class", "tracker-tick-label");
    if (renderInfo.xAxisColor) {
        xAxisTickLabels.style("fill", renderInfo.xAxisColor);
    }

    let tickLength = 6;
    let tickLabelHeight = textSize.width * Math.sin((65 / 180) * Math.PI);
    let xAxisLabel = xAxis
        .append("text")
        .text(renderInfo.xAxisLabel)
        .attr(
            "transform",
            "translate(" +
                width / 2 +
                "," +
                (tickLength + tickLabelHeight) +
                ")"
        )
        .attr("class", "tracker-axis-label");
    if (renderInfo.xAxisLabelColor) {
        xAxisLabel.style("fill", renderInfo.xAxisLabelColor);
    }

    // Expand svg height
    let svgHeight = parseFloat(svg.attr("height"));
    svg.attr("height", svgHeight + tickLength + tickLabelHeight);

    xAxis.attr("height", tickLength + tickLabelHeight);

    return [xAxis, xScale];
}

function renderYAxis(
    svg: any,
    graphArea: any,
    datasets: Datasets,
    renderInfo: LineInfo | BarInfo,
    location: string,
    datasetIds: Array<number>
) {
    // console.log(datasets);
    // console.log(renderInfo);
    // console.log(datasetIds);

    if (datasetIds.length === 0) {
        return [null, null];
    }

    let yMinOfDatasets = null;
    let yMaxOfDatasets = null;
    for (let datasetId of datasetIds) {
        let dataset = datasets.getDatasetById(datasetId);

        if (yMinOfDatasets === null || dataset.getYMin() < yMinOfDatasets) {
            yMinOfDatasets = dataset.getYMin();
        }
        if (yMaxOfDatasets === null || dataset.getYMax() > yMaxOfDatasets) {
            yMaxOfDatasets = dataset.getYMax();
        }
    }
    // console.log(yMinOfDatasets);
    // console.log(yMaxOfDatasets);

    let yMin = location === "left" ? renderInfo.yMin[0] : renderInfo.yMin[1];
    let yMinAssigned = false;
    if (typeof yMin !== "number") {
        yMin = yMinOfDatasets;
    } else {
        yMinAssigned = true;
    }
    let yMax = location === "left" ? renderInfo.yMax[0] : renderInfo.yMax[1];
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
    yScale.domain([yLower, yUpper]).range([height, 0]);

    let yAxisColor =
        location === "left"
            ? renderInfo.yAxisColor[0]
            : renderInfo.yAxisColor[1];
    let yAxisLabelColor =
        location === "left"
            ? renderInfo.yAxisLabelColor[0]
            : renderInfo.yAxisLabelColor[1];
    let yAxisLabelText =
        location === "left"
            ? renderInfo.yAxisLabel[0]
            : renderInfo.yAxisLabel[1];
    let yAxisUnitText =
        location === "left" ? renderInfo.yAxisUnit[0] : renderInfo.yAxisUnit[1];

    let yAxisGen;
    if (location === "left") {
        yAxisGen = d3.axisLeft(yScale);
    } else {
        yAxisGen = d3.axisRight(yScale);
    }
    let yAxis = graphArea
        .append("g")
        .attr("id", "yAxis")
        .call(yAxisGen)
        .attr("class", "tracker-axis");
    if (location == "right") {
        yAxis.attr("transform", "translate(" + width + " ,0)");
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
        .attr("x", -height / 2.0)
        .attr("class", "tracker-axis-label");
    if (location === "left") {
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

    yAxis.attr(
        "width",
        yAxisLabelSize.height + maxTickLabelWidth + yTickLength
    );

    return [yAxis, yScale];
}

function renderLine(
    dataArea: any,
    lineInfo: LineInfo,
    dataset: Dataset,
    xScale: any,
    yScale: any
) {
    // console.log(dataset);
    // console.log(lineInfo);

    if (lineInfo.showLine[dataset.getId()]) {
        let lineGen = d3
            .line<DataPoint>()
            .defined(function (p: DataPoint) {
                return p.value !== null;
            })
            .x(function (p: DataPoint) {
                return xScale(p.date);
            })
            .y(function (p: DataPoint) {
                return yScale(p.value);
            });

        let line = dataArea
            .append("path")
            .attr("class", "tracker-line")
            .style("stroke-width", lineInfo.lineWidth[dataset.getId()]);

        if (lineInfo.fillGap[dataset.getId()]) {
            line.datum(dataset).attr("d", lineGen as any);
        } else {
            line.datum(dataset).attr("d", lineGen as any);
        }

        if (lineInfo.lineColor[dataset.getId()]) {
            line.style("stroke", lineInfo.lineColor[dataset.getId()]);
        }
    }
}

function renderPoints(
    dataArea: any,
    svg: any,
    lineInfo: LineInfo,
    dataset: Dataset,
    xScale: any,
    yScale: any
) {
    // console.log(lineInfo);
    // console.log(dataset);

    if (lineInfo.showPoint[dataset.getId()]) {
        let dots = dataArea
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
                return xScale(p.date);
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
            let tooltip = svg.append("g").style("opacity", 0);
            let tooltipBg = tooltip
                .append("rect")
                .attr("width", tooltipSize.width)
                .attr("height", tooltipSize.height)
                .attr("class", "tracker-tooltip");
            let tooltipLabel = tooltip
                .append("text")
                .attr("width", tooltipSize.width)
                .attr("height", tooltipSize.height)
                .attr("class", "tracker-tooltip-label");
            let tooltipLabelDate = tooltipLabel
                .append("tspan")
                .attr("x", 4)
                .attr("y", (tooltipSize.height / 5) * 2);
            let tooltipLabelValue = tooltipLabel
                .append("tspan")
                .attr("x", 4)
                .attr("y", (tooltipSize.height / 5) * 4);

            dots.on("mouseenter", function (event: any) {
                tooltipLabelDate.text("date:" + d3.select(this).attr("date"));
                tooltipLabelValue.text(
                    "value:" + d3.select(this).attr("value")
                );

                const [x, y] = d3.pointer(event);
                if (x < width / 2) {
                    tooltip.attr(
                        "transform",
                        "translate(" +
                            (x + tooltipSize.width * 1.3) +
                            "," +
                            (y - tooltipSize.height * 1.0) +
                            ")"
                    );
                } else {
                    tooltip.attr(
                        "transform",
                        "translate(" +
                            (x - tooltipSize.width * 0.0) +
                            "," +
                            (y - tooltipSize.height * 1.0) +
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
    dataArea: any,
    barInfo: BarInfo,
    dataset: Dataset,
    xScale: any,
    yScale: any,
    currBarSet: number,
    totalNumOfBarSets: number
) {
    // console.log(dataset);
    // console.log(barInfo);
    // console.log("%d/%d", currBarSet, totalNumOfBarSets);

    let barGap = 1;
    let barSetWidth = width / dataset.getLength();
    let barWidth = barSetWidth;
    if (barSetWidth - barGap > 0) {
        barWidth = barSetWidth - barGap;
    }
    barWidth = barWidth / totalNumOfBarSets;

    let portionLeft = (currBarSet + 1) / totalNumOfBarSets;

    let bars = dataArea
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
                        xScale(p.date) -
                        barSetWidth / 2.0 +
                        currBarSet * barWidth +
                        portionVisible * barWidth
                    );
                }
            }
            return xScale(p.date) - barSetWidth / 2.0 + currBarSet * barWidth;
        })
        .attr("y", function (p: DataPoint) {
            return yScale(p.value);
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
                return height - yScale(p.value);
            }
        })
        .attr("class", "tracker-bar");

    if (barInfo.barColor[dataset.getId()]) {
        bars.style("fill", barInfo.barColor[dataset.getId()]);
    }
}

function renderLegend(
    svg: any,
    graphArea: any,
    title: any,
    xAxis: any,
    leftYAxis: any,
    rightYAxis: any,
    datasets: Datasets,
    renderInfo: LineInfo | BarInfo
) {
    // console.log(renderInfo.legendPosition);
    // console.log(renderInfo.legendOrientation);

    let svgHeight = parseFloat(svg.attr("height"));
    let svgWidth = parseFloat(svg.attr("width"));
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
    if (renderInfo.legendOrientation === "vertical") {
        legendWidth = xSpacing * 3 + markerWidth + maxNameWidth;
        legendHeight = (numNames + 1) * ySpacing;
    } else if (renderInfo.legendOrientation === "horizontal") {
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

    let legendX = 0.0; // relative to svg
    let legendY = 0.0;
    if (renderInfo.legendPosition === "top") {
        // below title
        legendX = margin.left + width / 2.0 - legendWidth / 2.0; // relative to svg
        legendY = margin.top + titleHeight;
        // Expand svg
        svg.attr("height", svgHeight + legendHeight);
        // Move graphArea down
        let graphAreaTrans = new Transform(graphArea.attr("transform"));
        graphArea.attr(
            "transform",
            "translate(" +
                graphAreaTrans.translateX +
                "," +
                (graphAreaTrans.translateY + legendHeight) +
                ")"
        );
    } else if (renderInfo.legendPosition === "bottom") {
        // bellow x-axis label
        legendX = margin.left + width / 2.0 - legendWidth / 2.0; // relative to svg
        legendY = margin.top + titleHeight + height + xAxisHeight + ySpacing;
        // Expand svg
        svg.attr("height", svgHeight + legendHeight);
    } else if (renderInfo.legendPosition === "left") {
        legendX = margin.left - leftYAxisWidth - xSpacing;
        legendY = margin.top + titleHeight + height / 2.0 - legendHeight / 2.0;
        // Expand svg
        svg.attr("width", svgWidth + legendWidth);
        // Move graphArea right
        let graphAreaTrans = new Transform(graphArea.attr("transform"));
        graphArea.attr(
            "transform",
            "translate(" +
                (graphAreaTrans.translateX + legendWidth) +
                "," +
                graphAreaTrans.translateY +
                ")"
        );
    } else if (renderInfo.legendPosition === "right") {
        legendX = margin.left + width + rightYAxisWidth + xSpacing;
        legendY = margin.top + titleHeight + height / 2.0 - legendHeight / 2.0;
        // Expand svg
        svg.attr("width", svgWidth + legendWidth);
    } else {
        return;
    }

    let legend = svg
        .append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");
    // console.log('legendX: %d, legendY: %d', legendX, legendY);

    let legendBg = legend
        .append("rect")
        .attr("class", "tracker-legend")
        .attr("width", legendWidth)
        .attr("height", legendHeight);
    if (renderInfo.legendBgColor) {
        legendBg.style("fill", renderInfo.legendBgColor);
    }

    let firstMarkerX = xSpacing;
    let firstMarkerY = nameHeight;
    let firstLabelX = firstMarkerX + xSpacing + markerWidth; // xSpacing + 2 * xSpaing
    let firstLabelY = firstMarkerY;

    if (renderInfo.legendOrientation === "vertical") {
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
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
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
                    return datasets.getDatasetById(i).getLineInfo().pointSize[
                        i
                    ];
                }
                return 0.0;
            })
            .style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().pointColor[i];
            });

        // bars

        // names
        legend
            .selectAll("labels")
            .data(names)
            .enter()
            .append("text")
            .attr("x", firstLabelX)
            .attr("y", function (name: string, i: number) {
                return firstLabelY + i * ySpacing;
            })
            .style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
            })
            .text(function (name: string) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");
    } else if (renderInfo.legendOrientation === "horizontal") {
        let currRenderPosX = 0.0;
        let currRenderPosX2 = 0.0;
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
                        nameSizes[i].width + xSpacing + markerWidth + xSpacing;
                }
                return currRenderPosX;
            })
            .attr("x2", function (name: string, i: number) {
                if (i === 0) {
                    currRenderPosX2 = firstMarkerX + markerWidth;
                } else {
                    currRenderPosX2 +=
                        nameSizes[i].width + xSpacing + markerWidth + xSpacing;
                }
                return currRenderPosX2;
            })
            .attr("y1", firstMarkerY)
            .attr("y2", firstMarkerY)
            .style("stroke", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
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
                        nameSizes[i].width + xSpacing + markerWidth + xSpacing;
                }
                return currRenderPosX;
            })
            .attr("cy", firstMarkerY)
            .attr("r", function (name: string, i: number) {
                if (datasets.getDatasetById(i).getLineInfo().showPoint[i]) {
                    return datasets.getDatasetById(i).getLineInfo().pointSize[
                        i
                    ];
                }
                return 0.0;
            })
            .style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().pointColor[i];
            });

        // bars

        // names
        currRenderPosX = 0.0;
        legend
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
            .style("fill", function (name: string, i: number) {
                return datasets.getDatasetById(i).getLineInfo().lineColor[i];
            })
            .text(function (name: string) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");
    }
}

function renderTitle(svg: any, graphArea: any, strTitle: string) {
    // console.log("renderTitle")

    let titleSize = measureTextSize(strTitle, "tracker-title");

    // Expand svg height
    let svgHeight = parseFloat(svg.attr("height"));
    svg.attr("height", svgHeight + titleSize.height);

    // Move graphArea down
    let graphAreaTrans = new Transform(graphArea.attr("transform"));
    graphArea.attr(
        "transform",
        "translate(" +
            graphAreaTrans.translateX +
            "," +
            (graphAreaTrans.translateY + titleSize.height) +
            ")"
    );

    // Append title
    let title = svg
        .append("text")
        .text(strTitle) // pivot at center
        .attr("id", "title")
        .attr(
            "transform",
            "translate(" +
                (margin.left + width / 2.0) +
                "," +
                (margin.top + titleSize.height / 2.0) +
                ")"
        )
        .attr("height", titleSize.height) // for later use
        .attr("class", "tracker-title");

    return title;
}

function renderLineChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderLineChart");
    // console.log(renderInfo);

    // whole area for plotting
    let svg = d3
        .select(canvas)
        .append("svg")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    //
    let graphArea = svg
        .append("g")
        .attr("id", "graphArea")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let dataArea = graphArea.append("g").attr("id", "dataArea");

    let title = null;
    if (renderInfo.line.title) {
        title = renderTitle(svg, graphArea, renderInfo.line.title);
    }

    let [xAxis, xScale] = renderXAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.line
    );

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

    let [leftYAxis, leftYScale] = renderYAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.line,
        "left",
        datasetOnLeftYAxis
    );

    if (leftYAxis && leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderLine(dataArea, renderInfo.line, dataset, xScale, leftYScale);

            renderPoints(
                dataArea,
                svg,
                renderInfo.line,
                dataset,
                xScale,
                leftYScale
            );
        }
    }

    let [rightYAxis, rightYScale] = renderYAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.line,
        "right",
        datasetOnRightYAxis
    );

    if (rightYAxis && rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            renderLine(dataArea, renderInfo.line, dataset, xScale, rightYScale);

            renderPoints(
                dataArea,
                svg,
                renderInfo.line,
                dataset,
                xScale,
                rightYScale
            );
        }
    }

    if (renderInfo.line.showLegend) {
        renderLegend(
            svg,
            graphArea,
            title,
            xAxis,
            leftYAxis,
            rightYAxis,
            renderInfo.datasets,
            renderInfo.line
        );
    }
}

function renderBarChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderBarChart");
    // console.log(renderInfo);

    // whole area for plotting
    let svg = d3
        .select(canvas)
        .append("svg")
        .attr("id", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    let graphArea = svg
        .append("g")
        .attr("id", "graphArea")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let dataArea = graphArea.append("g").attr("id", "dataArea");

    let title = null;
    if (renderInfo.bar.title) {
        title = renderTitle(svg, graphArea, renderInfo.bar.title);
    }

    let [xAxis, xScale] = renderXAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.bar
    );

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

    let [leftYAxis, leftYScale] = renderYAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.bar,
        "left",
        datasetOnLeftYAxis
    );

    let totalNumOfBarSets =
        datasetOnLeftYAxis.length + datasetOnRightYAxis.length;
    let currBarSet = 0;

    if (leftYAxis && leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            let xOffset = 0;
            if (dataset.getId() === 0) {
                xOffset = -3;
            } else {
                xOffset = 3;
            }
            renderBar(
                dataArea,
                renderInfo.bar,
                dataset,
                xScale,
                leftYScale,
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    let [rightYAxis, rightYScale] = renderYAxis(
        svg,
        graphArea,
        renderInfo.datasets,
        renderInfo.bar,
        "right",
        datasetOnRightYAxis
    );

    if (rightYAxis && rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);

            let xOffset = 0;
            if (dataset.getId() === 0) {
                xOffset = -3;
            } else {
                xOffset = 3;
            }
            renderBar(
                dataArea,
                renderInfo.bar,
                dataset,
                xScale,
                rightYScale,
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    if (renderInfo.bar.showLegend) {
        renderLegend(
            svg,
            graphArea,
            title,
            xAxis,
            leftYAxis,
            rightYAxis,
            renderInfo.datasets,
            renderInfo.bar
        );
    }
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

    // Notice renderInfo.summary may be null
    if (renderInfo.summary === null) {
        return "Key 'summary' not foundin YAML";
    }

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
