import * as d3 from "d3";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    LineInfo,
    BarInfo,
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

export function render(canvas: HTMLElement, renderInfo: RenderInfo) {
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
    datasets: Datasets,
    renderInfo: LineInfo | BarInfo,
    location: string,
    datasetIds: Array<number>
) {
    // console.log(datasets);
    // console.log(renderInfo);
    // console.log(datasetIds);

    if (datasetIds.length === 0) {
        return null;
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
        yAxisLabelText += " (" + yAxisUnitText + ")";
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
    xOffset: number
) {
    // console.log(dataset);
    // console.log(barInfo);

    let bars = dataArea
        .selectAll("bar")
        .data(
            Array.from(dataset).filter(function (p: DataPoint) {
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
    if (barInfo.barColor[dataset.getId()]) {
        bars.attr("fill", barInfo.barColor[dataset.getId()]);
    }
}

function renderLegend(
    svg: any,
    datasets: Datasets,
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
    let names = datasets.getNames();

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
            return datasets.getDatasetById(i).getLineInfo().pointSize[i];
        })
        .style("fill", function (name: string, i: number) {
            return datasets.getDatasetById(i).getLineInfo().pointColor[i];
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
            return datasets.getDatasetById(i).getLineInfo().lineColor[i];
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
        marginBottom += 20 + renderInfo.datasets.getNames().length * 25;
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

    let xScale = renderXAxis(graphArea, renderInfo.datasets, renderInfo.line);

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

    let leftYScale = renderYAxis(
        graphArea,
        renderInfo.datasets,
        renderInfo.line,
        "left",
        datasetOnLeftYAxis
    );

    if (leftYScale) {
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

    let rightYScale = renderYAxis(
        graphArea,
        renderInfo.datasets,
        renderInfo.line,
        "right",
        datasetOnRightYAxis
    );

    if (rightYScale) {
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
        renderLegend(svg, renderInfo.datasets, renderInfo.line.legendPosition);
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
        marginBottom += 20 + renderInfo.datasets.getNames().length * 25;
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

    let xScale = renderXAxis(graphArea, renderInfo.datasets, renderInfo.bar);

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

    let leftYScale = renderYAxis(
        graphArea,
        renderInfo.datasets,
        renderInfo.bar,
        "left",
        datasetOnLeftYAxis
    );

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
            xOffset
        );
    }

    let rightYScale = renderYAxis(
        graphArea,
        renderInfo.datasets,
        renderInfo.bar,
        "right",
        datasetOnRightYAxis
    );

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
            xOffset
        );
    }

    if (renderInfo.bar.showLegend) {
        renderLegend(svg, renderInfo.datasets, renderInfo.bar.legendPosition);
    }
}

function checkSummaryTemplateValid(summaryTemplate: string): boolean {
    return true;
}

let fnSet = {
    "{{min}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return d3.min(dataset.getValues());
    },
    "{{max}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return d3.max(dataset.getValues());
    },
    "{{sum}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return d3.sum(dataset.getValues());
    },
    "{{count}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return dataset.getLengthNotNull();
    },
    "{{days}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        let result = dataset.getLength();
        return result;
    },
    "{{maxStreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let maxStreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(0);
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
    "{{maxBreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let maxBreak = 0;
        let dataset = renderInfo.datasets.getDatasetById(0);

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
    "{{lastStreak}}": function (renderInfo: RenderInfo) {
        let streak = 0;
        let dataset = renderInfo.datasets.getDatasetById(0);
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
    "{{average}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        let countNotNull = dataset.getLengthNotNull();
        if (countNotNull > 0) {
            let sum = d3.sum(dataset.getValues());
            return sum / countNotNull;
        }
        return null;
    },
    "{{median}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return d3.median(dataset.getValues());
    },
    "{{variance}}": function (renderInfo: RenderInfo) {
        let dataset = renderInfo.datasets.getDatasetById(0);
        return d3.variance(dataset.getValues());
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
