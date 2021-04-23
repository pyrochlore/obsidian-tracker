import * as d3 from "d3";
import {
    DataSets,
    DataPoint,
    RenderInfo,
    DataSet,
    LineInfo,
    BarInfo,
} from "./data";

// Dimension
let margin = { top: 10, right: 70, bottom: 70, left: 70 };
let width = 500 - margin.left - margin.right;
let height = 400 - margin.top - margin.bottom;
let tooltipSize = { width: 90, height: 45 };

function getTickInterval(dataSets: DataSets) {
    let tickInterval;
    let days = dataSets.getDates().length;

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

function getTickFormat(dataSets: DataSets) {
    let tickFormat;
    let days = dataSets.getDates().length;

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

export function render(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log(renderInfo.dataSets);

    // Data preprocessing

    for (let dataSet of renderInfo.dataSets) {
        if (renderInfo.penalty[dataSet.getId()] !== null) {
            dataSet.setPenalty(renderInfo.penalty[dataSet.getId()]);
        }
        if (renderInfo.accum[dataSet.getId()]) {
            dataSet.accumulateValues();
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
    graphArea: any,
    dataSets: DataSets,
    renderInfo: LineInfo | BarInfo
) {
    let xDomain = d3.extent(dataSets.getDates());
    let xScale = d3.scaleTime().domain(xDomain).range([0, width]);

    let tickInterval = getTickInterval(dataSets);
    let tickFormat = getTickFormat(dataSets);

    let xAxisGen = d3
        .axisBottom(xScale)
        .ticks(tickInterval)
        .tickFormat(tickFormat);
    let xAxis = graphArea
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisGen)
        .attr("class", "tracker-axis");
    if (renderInfo.axisColor) {
        xAxis.style("stroke", renderInfo.axisColor);
    }

    let xAxisTickLabels = xAxis
        .selectAll("text")
        .attr("x", -9)
        .attr("y", 0)
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end")
        .attr("class", "tracker-tick-label");
    if (renderInfo.labelColor) {
        xAxisTickLabels.style("fill", renderInfo.labelColor);
    }

    let xAxisLabel = xAxis
        .append("text")
        .text(renderInfo.xAxisLabel)
        .attr(
            "transform",
            "translate(" + width / 2 + " ," + margin.bottom + ")"
        )
        .attr("class", "tracker-axis-label");
    if (renderInfo.labelColor) {
        xAxisLabel.style("fill", renderInfo.labelColor);
    }

    return xScale;
}

function renderYAxis(
    graphArea: any,
    dataSets: DataSets,
    renderInfo: LineInfo | BarInfo,
    location: string,
    dataSetIds: Array<number>
) {
    // console.log(dataSets);
    // console.log(renderInfo);
    // console.log(dataSetIds);

    if (dataSetIds.length === 0) {
        return null;
    }

    let yMinOfDataSets = null;
    let yMaxOfDataSets = null;
    for (let dataSetId of dataSetIds) {
        let dataSet = dataSets.getDataSetById(dataSetId);

        if (yMinOfDataSets === null || dataSet.getYMin() < yMinOfDataSets) {
            yMinOfDataSets = dataSet.getYMin();
        }
        if (yMaxOfDataSets === null || dataSet.getYMax() > yMaxOfDataSets) {
            yMaxOfDataSets = dataSet.getYMax();
        }
    }
    // console.log(yMinOfDataSets);
    // console.log(yMaxOfDataSets);

    let yMin = location === "left" ? renderInfo.yMin[0] : renderInfo.yMin[1];
    let yMinAssigned = false;
    if (typeof yMin !== "number") {
        yMin = yMinOfDataSets;
    } else {
        yMinAssigned = true;
    }
    let yMax = location === "left" ? renderInfo.yMax[0] : renderInfo.yMax[1];
    let yMaxAssigned = false;
    if (typeof yMax !== "number") {
        yMax = yMaxOfDataSets;
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

    let yAxisLocation = renderInfo.yAxisLocation;
    let yAxisGen;
    if (location === "left") {
        yAxisGen = d3.axisLeft(yScale);
    } else {
        yAxisGen = d3.axisRight(yScale);
    }
    let yAxis = graphArea
        .append("g")
        .call(yAxisGen)
        .attr("class", "tracker-axis");
    if (location == "right") {
        yAxis.attr("transform", "translate(" + width + " ,0)");
    }
    if (renderInfo.axisColor) {
        yAxis.style("stroke", renderInfo.axisColor);
    }

    let yAxisTickLabels = yAxis
        .selectAll("text")
        .attr("class", "tracker-tick-label");
    if (renderInfo.labelColor) {
        yAxisTickLabels.style("fill", renderInfo.labelColor);
    }

    let yAxisLabelText =
        location === "left"
            ? renderInfo.yAxisLabel[0]
            : renderInfo.yAxisLabel[1];
    let yAxisUnitText =
        location === "left" ? renderInfo.yAxisUnit[0] : renderInfo.yAxisUnit[1];
    if (yAxisUnitText !== "") {
        yAxisLabelText += " (" + renderInfo.yAxisUnit + ")";
    }
    let yAxisLabel = yAxis
        .append("text")
        .text(yAxisLabelText)
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("class", "tracker-axis-label");
    if (location === "left") {
        yAxisLabel.attr("y", 0 - margin.left / 2);
    } else {
        yAxisLabel.attr("y", 0 + margin.right / 1.5);
    }
    if (renderInfo.labelColor) {
        yAxisLabel.style("fill", renderInfo.labelColor);
    }

    return yScale;
}

function renderLine(
    dataArea: any,
    lineInfo: LineInfo,
    dataSet: DataSet,
    xScale: any,
    yScale: any
) {
    // console.log(dataSet);
    // console.log(lineInfo);

    if (lineInfo.showLine[dataSet.getId()]) {
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
            .style("stroke-width", lineInfo.lineWidth[dataSet.getId()]);

        if (lineInfo.fillGap[dataSet.getId()]) {
            line.datum(dataSet).attr("d", lineGen as any);
        } else {
            line.datum(dataSet).attr("d", lineGen as any);
        }

        if (lineInfo.lineColor[dataSet.getId()]) {
            line.style("stroke", lineInfo.lineColor[dataSet.getId()]);
        }
    }
}

function renderPoints(
    dataArea: any,
    svg: any,
    lineInfo: LineInfo,
    dataSet: DataSet,
    xScale: any,
    yScale: any
) {
    console.log(lineInfo);
    console.log(dataSet);

    if (lineInfo.showPoint[dataSet.getId()]) {
        let dots = dataArea
            .selectAll("dot")
            .data(
                Array.from(dataSet).filter(function (p: DataPoint) {
                    return p.value !== null;
                })
            )
            .enter()
            .append("circle")
            .attr("r", lineInfo.pointSize[dataSet.getId()])
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
        if (lineInfo.pointColor[dataSet.getId()]) {
            dots.style("fill", lineInfo.pointColor[dataSet.getId()]);

            if (
                lineInfo.pointBorderColor[dataSet.getId()] &&
                lineInfo.pointBorderWidth[dataSet.getId()] > 0.0
            ) {
                dots.style(
                    "stroke",
                    lineInfo.pointBorderColor[dataSet.getId()]
                );
                dots.style(
                    "stroke-width",
                    lineInfo.pointBorderWidth[dataSet.getId()]
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
    dataSet: DataSet,
    xScale: any,
    yScale: any,
    xOffset: number
) {
    // console.log(dataSet);
    // console.log(barInfo);

    let bars = dataArea
        .selectAll("bar")
        .data(
            Array.from(dataSet).filter(function (p: DataPoint) {
                return p.value !== null;
            })
        )
        .enter()
        .append("rect")
        .attr("x", function (p: DataPoint) {
            return xScale(p.date) + xOffset;
        })
        .attr("y", function (p: DataPoint) {
            return yScale(p.value);
        })
        .attr("width", 2)
        .attr("height", function (p: DataPoint) {
            if (p.value !== null) {
                return height - yScale(p.value);
            }
        });
    if (barInfo.barColor[dataSet.getId()]) {
        bars.attr("fill", barInfo.barColor[dataSet.getId()]);
    }
}

function renderLegend(
    svg: any,
    dataSets: DataSets,
    position: string | { x: number; y: number }
) {
    let legendX = 0.0;
    let legendY = 0.0;
    if (typeof position === "string") {
        if (position.toLowerCase() === "top") {
        } else if (position.toLowerCase() === "bottom") {
            legendX = width / 2.0 + margin.left - 60;
            legendY = height + margin.bottom + margin.top + 40;
        } else if (position.toLowerCase() === "left") {
        } else if (position.toLowerCase() === "right") {
        } else if (position.toLowerCase() === "center") {
            legendX = width / 2.0 + margin.left;
            legendY = height / 2.0 + margin.top;
        }
    } else {
        legendX = position.x;
        legendY = position.y;
    }

    let legend = svg
        .append("g")
        .attr("transform", "translate(" + legendX + "," + legendY + ")");
    // console.log('legendX: %d, legendY: %d', legendX, legendY);

    // Get datasets names
    let names = dataSets.getNames();

    let firstMarkerX = 10;
    let firstMarkerY = 10;
    let markerYSpacing = 25;
    let firstLabelX = firstMarkerX + 20;
    let firstLabelY = firstMarkerY;

    // points
    legend
        .selectAll("dots")
        .data(names)
        .enter()
        .append("circle")
        .attr("cx", firstMarkerX)
        .attr("cy", function (name: string, i: number) {
            return firstMarkerY + i * markerYSpacing;
        })
        .attr("r", function (name: string, i: number) {
            return dataSets.getDataSetById(i).getLineInfo().pointSize[i];
        })
        .style("fill", function (name: string, i: number) {
            return dataSets.getDataSetById(i).getLineInfo().pointColor[i];
        });

    // names
    legend
        .selectAll("labels")
        .data(names)
        .enter()
        .append("text")
        .attr("x", firstLabelX)
        .attr("y", function (name: string, i: number) {
            return firstLabelY + i * markerYSpacing;
        }) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function (name: string, i: number) {
            return dataSets.getDataSetById(i).getLineInfo().lineColor[i];
        })
        .text(function (name: string) {
            return name;
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");
}

function renderLineChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderLineChart");
    // console.log(renderInfo);

    let marginTop = margin.top;
    let marginBottom = margin.bottom;
    if (renderInfo.line.title) {
        marginTop += 20;
    }
    if (renderInfo.line.showLegend) {
        marginBottom += 20 + renderInfo.dataSets.getNames().length * 25;
    }

    let svg = d3
        .select(canvas)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + marginTop + marginBottom);

    let graphArea = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + marginTop + ")");

    // Add graph title
    if (renderInfo.line.title) {
        graphArea
            .append("text")
            .text(renderInfo.line.title)
            .attr(
                "transform",
                "translate(" + width / 2 + "," + margin.top / 4 + ")"
            )
            .attr("class", "tracker-title");
    }

    let dataArea = graphArea.append("g");

    let xScale = renderXAxis(graphArea, renderInfo.dataSets, renderInfo.line);

    let dataSetOnLeftYAxis = [];
    let dataSetOnRightYAxis = [];
    for (let ind = 0; ind < renderInfo.line.yAxisLocation.length; ind++) {
        let yAxisLocation = renderInfo.line.yAxisLocation[ind];
        if (yAxisLocation.toLowerCase() === "left") {
            dataSetOnLeftYAxis.push(ind);
        } else {
            // right
            dataSetOnRightYAxis.push(ind);
        }
    }

    let leftYScale = renderYAxis(
        graphArea,
        renderInfo.dataSets,
        renderInfo.line,
        "left",
        dataSetOnLeftYAxis
    );

    if (leftYScale) {
        for (let dataSetId of dataSetOnLeftYAxis) {
            let dataSet = renderInfo.dataSets.getDataSetById(dataSetId);

            renderLine(dataArea, renderInfo.line, dataSet, xScale, leftYScale);

            renderPoints(
                dataArea,
                svg,
                renderInfo.line,
                dataSet,
                xScale,
                leftYScale
            );
        }
    }

    let rightYScale = renderYAxis(
        graphArea,
        renderInfo.dataSets,
        renderInfo.line,
        "right",
        dataSetOnRightYAxis
    );

    if (rightYScale) {
        for (let dataSetId of dataSetOnRightYAxis) {
            let dataSet = renderInfo.dataSets.getDataSetById(dataSetId);

            renderLine(dataArea, renderInfo.line, dataSet, xScale, rightYScale);

            renderPoints(
                dataArea,
                svg,
                renderInfo.line,
                dataSet,
                xScale,
                rightYScale
            );
        }
    }

    if (renderInfo.line.showLegend) {
        renderLegend(svg, renderInfo.dataSets, renderInfo.line.legendPosition);
    }
}

function renderBarChart(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderBarChart");
    // console.log(renderInfo);
    let marginTop = margin.top;
    let marginBottom = margin.bottom;
    if (renderInfo.bar.title) {
        marginTop += 20;
    }
    if (renderInfo.bar.showLegend) {
        marginBottom += 20 + renderInfo.dataSets.getNames().length * 25;
    }

    let svg = d3
        .select(canvas)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + marginTop + marginBottom);

    let graphArea = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + marginTop + ")");

    // Add graph title
    if (renderInfo.bar.title) {
        graphArea
            .append("text")
            .text(renderInfo.bar.title)
            .attr(
                "transform",
                "translate(" + width / 2 + "," + margin.top / 4 + ")"
            )
            .attr("class", "tracker-title");
    }

    let dataArea = graphArea.append("g");

    let xScale = renderXAxis(graphArea, renderInfo.dataSets, renderInfo.bar);

    let dataSetOnLeftYAxis = [];
    let dataSetOnRightYAxis = [];
    for (let ind = 0; ind < renderInfo.bar.yAxisLocation.length; ind++) {
        let yAxisLocation = renderInfo.bar.yAxisLocation[ind];
        if (yAxisLocation.toLowerCase() === "left") {
            dataSetOnLeftYAxis.push(ind);
        } else {
            // right
            dataSetOnRightYAxis.push(ind);
        }
    }

    let leftYScale = renderYAxis(
        graphArea,
        renderInfo.dataSets,
        renderInfo.bar,
        "left",
        dataSetOnLeftYAxis
    );

    for (let dataSetId of dataSetOnLeftYAxis) {
        let dataSet = renderInfo.dataSets.getDataSetById(dataSetId);

        let xOffset = 0;
        if (dataSet.getId() === 0) {
            xOffset = -3;
        } else {
            xOffset = 3;
        }
        renderBar(
            dataArea,
            renderInfo.bar,
            dataSet,
            xScale,
            leftYScale,
            xOffset
        );
    }

    let rightYScale = renderYAxis(
        graphArea,
        renderInfo.dataSets,
        renderInfo.bar,
        "right",
        dataSetOnRightYAxis
    );

    for (let dataSetId of dataSetOnRightYAxis) {
        let dataSet = renderInfo.dataSets.getDataSetById(dataSetId);

        let xOffset = 0;
        if (dataSet.getId() === 0) {
            xOffset = -3;
        } else {
            xOffset = 3;
        }
        renderBar(
            dataArea,
            renderInfo.bar,
            dataSet,
            xScale,
            rightYScale,
            xOffset
        );
    }

    if (renderInfo.bar.showLegend) {
        renderLegend(svg, renderInfo.dataSets, renderInfo.bar.legendPosition);
    }
}

function checkSummaryTemplateValid(summaryTemplate: string): boolean {
    return true;
}

let fnSet = {
    "{{min}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return d3.min(dataSet.getValues());
    },
    "{{max}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return d3.max(dataSet.getValues());
    },
    "{{sum}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return d3.sum(dataSet.getValues());
    },
    "{{count}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return dataSet.getLengthNotNull();
    },
    "{{days}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        let result = dataSet.getLength();
        return result;
    },
    "{{maxStreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let maxStreak = 0;
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        for (let dataPoint of dataSet) {
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
    "{{maxBreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let maxBreak = 0;
        let dataSet = renderInfo.dataSets.getDataSetById(0);

        for (let dataPoint of dataSet) {
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
    "{{lastStreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        let values = dataSet.getValues();
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
    "{{average}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        let countNotNull = dataSet.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataSet.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    "{{median}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return d3.median(dataSet.getValues());
    },
    "{{variance}}": function (renderInfo: RenderInfo) {
        let dataSet = renderInfo.dataSets.getDataSetById(0);
        return d3.variance(dataSet.getValues());
    },
};

function renderSummary(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderSummary");
    // console.log(renderInfo);

    // Notice renderInfo.text may be null
    if (renderInfo.summary === null) {
        return "Key 'summary' not foundin YAML";
    }

    let outputSummary = "";
    if (checkSummaryTemplateValid(renderInfo.summary.template)) {
        outputSummary = renderInfo.summary.template;
    } else {
        return "Invalid summary template";
    }

    // Loop over fnSet
    Object.entries(fnSet).forEach(([strRegex, fn]) => {
        let regex = new RegExp(strRegex, "gm");
        if (regex.test(outputSummary)) {
            // console.log("Found " + strRegex + " in text template")
            let result = fn(renderInfo);
            // console.log(result);
            if (typeof result !== "undefined" && result !== null) {
                if (Number.isInteger(result)) {
                    result = result.toFixed(0);
                } else {
                    result = result.toFixed(2);
                }
                outputSummary = outputSummary.replace(regex, result);
            } else {
                outputSummary = outputSummary.replace(regex, "{{NA}}");
            }
        }
    });

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
