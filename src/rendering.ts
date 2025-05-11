import * as d3 from "d3";
import { Moment, Duration } from "moment";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    Size,
    Transform,
    ChartElements,
    GraphType,
    ValueType,
    CommonChartInfo,
    LineInfo,
    BarInfo,
    PieInfo,
    SummaryInfo,
    BulletInfo,
    MonthInfo,
    HeatmapInfo,
} from "./data";
import * as pie from "./pie";
import * as summary from "./summary";
import * as month from "./month";
import * as heatmap from "./heatmap";
import * as bullet from "./bullet";
import * as helper from "./helper";
import { sprintf } from "sprintf-js";

function getXTickValues(
    dates: Moment[],
    interval: Duration
): [Array<Date>, d3.TimeInterval] {
    // The input interval could be null,
    // generate tick values even if interval is null

    // console.log(interval);

    let tickValues: Array<Date> = [];
    let tickInterval = null;

    // y values are time values
    if (interval) {
        let firstDate = dates[0];
        let lastDate = dates[dates.length - 1];
        tickValues = d3.timeDay.range(
            firstDate.toDate(),
            lastDate.toDate(),
            interval.asDays()
        );
    } else {
        let days = dates.length;
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
    }

    return [tickValues, tickInterval];
}

function getXTickLabelFormat(dates: Moment[], inTickLabelFormat: string) {
    if (inTickLabelFormat) {
        function fnTickLabelFormat(date: Date): string {
            return helper.dateToStr(window.moment(date), inTickLabelFormat);
        }
        return fnTickLabelFormat;
    } else {
        let tickLabelFormat = null;
        let days = dates.length;

        if (days <= 15) {
            // number of ticks: 0-15
            tickLabelFormat = d3.timeFormat("%y-%m-%d");
        } else if (days <= 4 * 15) {
            // number of ticks: 4-15
            tickLabelFormat = d3.timeFormat("%y-%m-%d");
        } else if (days <= 7 * 15) {
            // number of ticks: 8-15
            tickLabelFormat = d3.timeFormat("%y-%m-%d");
        } else if (days <= 15 * 30) {
            // number of ticks: 4-15
            tickLabelFormat = d3.timeFormat("%y %b");
        } else if (days <= 15 * 60) {
            // number of ticks: 8-15
            tickLabelFormat = d3.timeFormat("%y %b");
        } else {
            tickLabelFormat = d3.timeFormat("%Y");
        }

        return tickLabelFormat;
    }
}

function getYTickValues(
    yLower: number,
    yUpper: number,
    interval: number | Duration,
    isTimeValue = false
) {
    // The input interval could be null,
    // generate tick values for time values even if interval is null

    // console.log(interval);
    // console.log(isTimeValue);

    const absExtent = Math.abs(yUpper - yLower);
    let tickValues: Array<number> = [];

    if (!isTimeValue) {
        // y values are numbers
        if (interval && typeof interval === "number") {
            // !==null && !== 0
            tickValues = d3.range(yLower, yUpper, interval);
        }
    } else {
        // y values are time values
        if (interval && window.moment.isDuration(interval)) {
            let intervalInSeconds = Math.abs(interval.asSeconds());
            tickValues = d3.range(yLower, yUpper, intervalInSeconds);
        } else {
            // auto interval for time values
            if (absExtent > 5 * 60 * 60) {
                // extent over than 5 hours
                // tick on the hour
                yLower = Math.floor(yLower / 3600) * 3600;
                yUpper = Math.ceil(yUpper / 3600) * 3600;

                tickValues = d3.range(yLower, yUpper, 3600);
            } else {
                // tick on the half hour
                yLower = Math.floor(yLower / 1800) * 1800;
                yUpper = Math.ceil(yUpper / 1800) * 1800;

                tickValues = d3.range(yLower, yUpper, 1800);
            }
        }
    }

    if (tickValues.length === 0) return null;
    return tickValues;
}

function getYTickLabelFormat(
    yLower: number,
    yUpper: number,
    inTickLabelFormat: string,
    isTimeValue = false
) {
    // return a function convert value to time string

    if (!isTimeValue) {
        if (inTickLabelFormat) {
            function tickFormat(value: number): string {
                let strValue = sprintf("%" + inTickLabelFormat, value);
                return strValue;
            }

            return tickFormat;
        }
        return d3.tickFormat(yLower, yUpper, 10);
    } else {
        // values in seconds
        if (inTickLabelFormat) {
            function fnTickLabelFormat(value: number): string {
                let dayStart = window.moment("00:00", "HH:mm", true);
                let tickTime = dayStart.add(value, "seconds");
                let format = tickTime.format(inTickLabelFormat);

                let devHour = (value - yLower) / 3600;
                let interleave = devHour % 2;

                return format;
            }
            return fnTickLabelFormat;
        } else {
            function fnTickLabelFormat(value: number): string {
                const absExtent = Math.abs(yUpper - yLower);
                let dayStart = window.moment("00:00", "HH:mm", true);
                let tickTime = dayStart.add(value, "seconds");
                let format = tickTime.format("HH:mm");
                // console.log(`yLower/yUpper: ${yLower}/${yUpper}`)
                // console.log(`value/extent/inter:${value}/${absExtent}/${(value-yLower)/3600}`);

                // auto interleave if extent over 12 hours
                if (absExtent > 12 * 60 * 60) {
                    let devHour = (value - yLower) / 3600;
                    let interleave = devHour % 2;
                    if (value < yLower || value > yUpper || interleave < 1.0) {
                        format = "";
                    }
                }

                return format;
            }

            return fnTickLabelFormat;
        }
    }

    return null;
}

export function render(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("render");
    // console.log(renderInfo.datasets);

    // Data preprocessing
    for (let dataset of renderInfo.datasets) {
        if (dataset.getQuery().usedAsXDataset) continue;
        // valueShift
        let shiftAmount = renderInfo.valueShift[dataset.getId()];
        if (shiftAmount !== null && shiftAmount !== 0) {
            dataset.shift(
                shiftAmount,
                renderInfo.shiftOnlyValueLargerThan[dataset.getId()]
            );
        }
        // penalty
        if (renderInfo.penalty[dataset.getId()] !== null) {
            dataset.setPenalty(renderInfo.penalty[dataset.getId()]);
        }
        // accum
        if (renderInfo.accum[dataset.getId()]) {
            dataset.accumulateValues();
        }
    }
    // stack
    if (renderInfo.stack) {
        // Traverse the datasets, and add up the values from each dataset.
        let lastDataset = null;
        for (let dataset of renderInfo.datasets) {
            if (dataset.getQuery().usedAsXDataset) continue;
            if (lastDataset) {
                dataset.shiftByDataset(lastDataset);
            }
            lastDataset = dataset;
        }
    }

    for (let lineInfo of renderInfo.line) {
        let ret = renderLineChart(canvas, renderInfo, lineInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let barInfo of renderInfo.bar) {
        let ret = renderBarChart(canvas, renderInfo, barInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let pieInfo of renderInfo.pie) {
        let ret = pie.renderPieChart(canvas, renderInfo, pieInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let summaryInfo of renderInfo.summary) {
        let ret = summary.renderSummary(canvas, renderInfo, summaryInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let bulletInfo of renderInfo.bullet) {
        let ret = bullet.renderBullet(canvas, renderInfo, bulletInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let monthInfo of renderInfo.month) {
        let ret = month.renderMonth(canvas, renderInfo, monthInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
    for (let heatmapInfo of renderInfo.heatmap) {
        let ret = heatmap.renderHeatmap(canvas, renderInfo, heatmapInfo);
        if (typeof ret === "string") {
            return ret;
        }
    }
}

function renderXAxis(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    chartInfo: CommonChartInfo
) {
    // console.log("renderXAxis");

    if (!renderInfo || !chartInfo) return;

    let datasets = renderInfo.datasets;
    let xDomain = d3.extent(datasets.getDates());
    if (chartInfo instanceof BarInfo && chartInfo.xAxisPadding !== null) {
        let xAxisPaddingDuration = helper.parseDurationString(
            chartInfo.xAxisPadding
        );
        if (xAxisPaddingDuration !== null) {
            xDomain = [
                xDomain[0].clone().subtract(xAxisPaddingDuration.asHours(), 'hours'),
                xDomain[1].clone().add(xAxisPaddingDuration.asHours(), 'hours'),
            ];
        }
    }
    // console.log(xDomain);
    let xScale = d3
        .scaleTime()
        .domain(xDomain)
        .range([0, renderInfo.dataAreaSize.width]);
    chartElements["xScale"] = xScale;

    let tickIntervalInDuration = helper.parseDurationString(
        chartInfo.xAxisTickInterval
    );

    let [tickValues, tickInterval] = getXTickValues(
        datasets.getDates(),
        tickIntervalInDuration
    );
    let tickFormat = getXTickLabelFormat(
        datasets.getDates(),
        chartInfo.xAxisTickLabelFormat
    );

    let xAxisGen = d3.axisBottom(xScale);

    if (tickValues && tickValues.length !== 0) {
        xAxisGen.tickValues(tickValues);
    } else if (tickInterval) {
        xAxisGen.ticks(tickInterval);
    }
    if (tickFormat) {
        xAxisGen.tickFormat(tickFormat);
    }

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

    let textSize = helper.measureTextSize("99-99-99");

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
    helper.expandArea(chartElements.svg, 0, tickLength + tickLabelHeight);
    helper.expandArea(chartElements.graphArea, 0, tickLength + tickLabelHeight);
}

function renderYAxis(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    chartInfo: CommonChartInfo,
    yAxisLocation: string,
    datasetIds: Array<number>
) {
    // console.log("renderYAxis")
    // console.log(datasets);
    // console.log(renderInfo);
    // console.log(datasetIds);

    if (!renderInfo || !chartInfo) return;

    let datasets = renderInfo.datasets;
    if (datasetIds.length === 0) {
        return;
    }

    if (yAxisLocation !== "left" && yAxisLocation !== "right") return;

    let yMinOfDatasets = null;
    let yMaxOfDatasets = null;
    let tmpValueIsTime = null;
    let valueIsTime = false;
    for (let datasetId of datasetIds) {
        let dataset = datasets.getDatasetById(datasetId);
        if (dataset.getQuery().usedAsXDataset) continue;

        if (yMinOfDatasets === null || dataset.getYMin() < yMinOfDatasets) {
            yMinOfDatasets = dataset.getYMin();
        }
        if (yMaxOfDatasets === null || dataset.getYMax() > yMaxOfDatasets) {
            yMaxOfDatasets = dataset.getYMax();
        }

        // Need all datasets have same settings for time value
        valueIsTime = dataset.valueType === ValueType.Time;
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

    let yMin = null;
    if (yAxisLocation === "left") {
        yMin = chartInfo.yMin[0];
    } else if (yAxisLocation === "right") {
        yMin = chartInfo.yMin[1];
    }
    let yMinAssigned = false;
    if (typeof yMin !== "number") {
        yMin = yMinOfDatasets;
    } else {
        yMinAssigned = true;
    }

    let yMax = null;
    if (yAxisLocation === "left") {
        yMax = chartInfo.yMax[0];
    } else if (yAxisLocation === "right") {
        yMax = chartInfo.yMax[1];
    }
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
    if (chartInfo.GetGraphType() === GraphType.Bar) {
        if (yUpper < 0.0) {
            yUpper = 0;
        }
        if (yLower > 0.0) {
            yLower = 0.0;
        }
    }
    let domain = [yLower, yUpper];
    if (
        (yAxisLocation === "left" && chartInfo.reverseYAxis[0]) ||
        (yAxisLocation === "right" && chartInfo.reverseYAxis[1])
    ) {
        domain = [yUpper, yLower];
    }
    yScale.domain(domain).range([renderInfo.dataAreaSize.height, 0]);

    if (yAxisLocation === "left") {
        chartElements["leftYScale"] = yScale;
    } else if (yAxisLocation === "right") {
        chartElements["rightYScale"] = yScale;
    }

    let yAxisColor = "";
    if (yAxisLocation === "left") {
        yAxisColor = chartInfo.yAxisColor[0];
    } else if (yAxisLocation === "right") {
        yAxisColor = chartInfo.yAxisColor[1];
    }

    let yAxisLabelColor = "";
    if (yAxisLocation === "left") {
        yAxisLabelColor = chartInfo.yAxisLabelColor[0];
    } else if (yAxisLocation === "right") {
        yAxisLabelColor = chartInfo.yAxisLabelColor[1];
    }

    let yAxisLabelText = "";
    if (yAxisLocation === "left") {
        yAxisLabelText = chartInfo.yAxisLabel[0];
    } else if (yAxisLocation === "right") {
        yAxisLabelText = chartInfo.yAxisLabel[1];
    }

    let yAxisUnitText = "";
    let yAxisTickInterval = null;
    let yAxisTickLabelFormat = null;
    if (yAxisLocation === "left") {
        yAxisUnitText = chartInfo.yAxisUnit[0];
        yAxisTickInterval = chartInfo.yAxisTickInterval[0]; // string
        yAxisTickLabelFormat = chartInfo.yAxisTickLabelFormat[0];
    } else if (yAxisLocation === "right") {
        yAxisUnitText = chartInfo.yAxisUnit[1];
        yAxisTickInterval = chartInfo.yAxisTickInterval[1]; // string
        yAxisTickLabelFormat = chartInfo.yAxisTickLabelFormat[1];
    }
    // get interval from string
    let tickInterval = null;
    if (valueIsTime) {
        tickInterval = helper.parseDurationString(yAxisTickInterval);
    } else {
        tickInterval = parseFloat(yAxisTickInterval);
        if (!Number.isNumber(tickInterval) || Number.isNaN(tickInterval)) {
            tickInterval = null;
        }
    }

    let yAxisGen;
    if (yAxisLocation === "left") {
        yAxisGen = d3.axisLeft(yScale);
    } else if (yAxisLocation === "right") {
        yAxisGen = d3.axisRight(yScale);
    }
    if (yAxisGen) {
        let tickLabelFormat = getYTickLabelFormat(
            yLower,
            yUpper,
            yAxisTickLabelFormat,
            valueIsTime
        );
        if (tickLabelFormat) {
            yAxisGen.tickFormat(tickLabelFormat);
        }
        let tickValues = getYTickValues(
            yLower,
            yUpper,
            tickInterval,
            valueIsTime
        );
        if (tickValues) {
            yAxisGen.tickValues(tickValues);
        }
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
    let maxTickLabelWidth = 0;
    for (let label of yAxisTickLabels) {
        // console.log(label.textContent);
        if (label.textContent) {
            let labelSize = helper.measureTextSize(
                label.textContent,
                "tracker-axis-label"
            );
            if (labelSize.width > maxTickLabelWidth) {
                maxTickLabelWidth = labelSize.width;
            }
        }
    }
    // console.log(maxTickLabelWidth);

    if (yAxisUnitText !== "") {
        yAxisLabelText += " (" + yAxisUnitText + ")";
    }
    let yTickLength = 6;
    let yAxisLabelSize = helper.measureTextSize(yAxisLabelText);
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
            +yTickLength + maxTickLabelWidth + yAxisLabelSize.height
        );
    }
    if (yAxisLabelColor) {
        yAxisLabel.style("fill", yAxisLabelColor);
    }

    let yAxisWidth = yAxisLabelSize.height + maxTickLabelWidth + yTickLength;
    yAxis.attr("width", yAxisWidth);

    // Expand areas
    helper.expandArea(chartElements.svg, yAxisWidth, 0);
    helper.expandArea(chartElements.graphArea, yAxisWidth, 0);

    // Move areas
    if (yAxisLocation === "left") {
        // Move dataArea
        helper.moveArea(chartElements.dataArea, yAxisWidth, 0);

        // Move title
        if (chartElements.title) {
            helper.moveArea(chartElements.title, yAxisWidth, 0);
        }
    }
}

function renderLine(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    lineInfo: LineInfo,
    dataset: Dataset,
    yAxisLocation: string
) {
    // console.log(dataset);
    // console.log(renderInfo);

    if (!renderInfo || !lineInfo) return;

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
    lineInfo: LineInfo,
    dataset: Dataset,
    yAxisLocation: string
) {
    // console.log(lineInfo);
    // console.log(dataset);

    if (!renderInfo || !lineInfo) return;

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
            .attr("valueType", ValueType[dataset.valueType])
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
            renderTooltip(dots, chartElements, renderInfo);
        }
    }
}

function renderTooltip(
    targetElements: any,
    chartElements: ChartElements,
    renderInfo: RenderInfo
) {
    let tooltip = chartElements.dataArea.append("svg").style("opacity", 0);
    let tooltipBg = tooltip.append("rect").attr("x", 0).attr("y", 0);
    let tooltipLabel = tooltip.append("text");
    let tooltipLabelDate = tooltipLabel
        .append("tspan")
        .attr("class", "tracker-tooltip-label");
    let tooltipLabelValue = tooltipLabel
        .append("tspan")
        .attr("class", "tracker-tooltip-label");

    let xSpacing = 3;
    let ySpacing = 3;

    targetElements
        .on("mouseenter", function (event: any) {
            const [x, y] = d3.pointer(event);
            let tooltipBgWidth = 0;
            let tooltipBgHeight = 0;
            // Date
            let labelDateText = "date: " + d3.select(this).attr("date");
            // labelDateText = x.toString();// debug
            let labelDateSize = helper.measureTextSize(
                labelDateText,
                "tracker-tooltip-label"
            );
            tooltipLabelDate.text(labelDateText);
            if (labelDateSize.width > tooltipBgWidth) {
                tooltipBgWidth = labelDateSize.width;
            }
            tooltipBgHeight += labelDateSize.height;
            tooltipLabelDate.attr("x", xSpacing).attr("y", tooltipBgHeight);

            // Value
            let labelValueText = "value: ";
            let valueType = d3.select(this).attr("valueType");
            let strValue = d3.select(this).attr("value");
            // strValue += y.toString();//debug
            if (valueType === "Time") {
                let dayStart = window.moment("00:00", "HH:mm", true);
                let tickTime = dayStart.add(parseFloat(strValue), "seconds");
                let dateValue = tickTime.format("HH:mm");
                labelValueText += dateValue;
                tooltipLabelValue.text(labelValueText);
            } else {
                labelValueText += strValue;
                tooltipLabelValue.text(labelValueText);
            }
            let labelValueSize = helper.measureTextSize(
                labelValueText,
                "tracker-tooltip-label"
            );
            if (labelValueSize.width > tooltipBgWidth) {
                tooltipBgWidth = labelValueSize.width;
            }
            tooltipBgHeight += ySpacing + labelValueSize.height;
            tooltipLabelValue.attr("x", xSpacing).attr("y", tooltipBgHeight);

            tooltipBgWidth += 2 * xSpacing;
            tooltipBgHeight += 2 * ySpacing;
            tooltipLabel
                .attr("width", tooltipBgWidth)
                .attr("height", tooltipBgHeight);

            tooltipBg
                .attr("width", tooltipBgWidth)
                .attr("height", tooltipBgHeight)
                .attr("class", "tracker-tooltip");

            let tooltipPosX = x;
            let tooltipPosY = y;
            let tooltipXOffset = 12;
            let tooltipYOffset = 12;
            if (
                x + tooltipXOffset + tooltipBgWidth >
                renderInfo.dataAreaSize.width
            ) {
                // move tooltip to left
                tooltipPosX = x - tooltipBgWidth - tooltipXOffset;
            } else {
                // default at the right side
                tooltipPosX = x + tooltipXOffset;
            }
            if (y - tooltipYOffset - tooltipBgHeight < 0) {
                // down side
                tooltipPosY = y + tooltipYOffset;
            } else {
                // default move to up side
                tooltipPosY = y - tooltipYOffset - tooltipBgHeight;
            }
            tooltip.attr("x", tooltipPosX).attr("y", tooltipPosY);
            tooltip.transition().duration(200).style("opacity", 1);
        })
        .on("mouseleave", function () {
            tooltip.transition().duration(500).style("opacity", 0);
        });
}

function renderBar(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    barInfo: BarInfo,
    dataset: Dataset,
    yAxisLocation: string,
    currBarSet: number,
    totalNumOfBarSets: number
) {
    // console.log(dataset);
    // console.log(barInfo);
    // console.log("%d/%d", currBarSet, totalNumOfBarSets);

    if (!renderInfo || !barInfo) return;

    let barGap = 1;
    let barSetWidth = renderInfo.dataAreaSize.width / dataset.getLength();
    let barWidth = barSetWidth;
    let currentDiaplayInd = currBarSet;
    let totalDiaplaySet = totalNumOfBarSets;
    if (barSetWidth - barGap > 0) {
        barWidth = barSetWidth - barGap;
    }
    if (!renderInfo.stack) {
        barWidth = barWidth / totalNumOfBarSets;
    } else {
        currentDiaplayInd = 0;
        totalDiaplaySet = 1;
    }

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
            if (i === 0 && barInfo.xAxisPadding === null) {
                let portionVisible = currentDiaplayInd + 1 - totalDiaplaySet / 2.0;
                if (portionVisible < 1.0) {
                    return (
                        chartElements.xScale(p.date) -
                        barSetWidth / 2.0 +
                        currentDiaplayInd * barWidth +
                        portionVisible * barWidth
                    );
                }
            }
            return (
                chartElements.xScale(p.date) -
                barSetWidth / 2.0 +
                currentDiaplayInd * barWidth
            );
        })
        .attr("y", function (p: DataPoint) {
            return yScale(Math.max(p.value, 0));
        })
        .attr("width", function (p: DataPoint, i: number) {
            if (i === 0 && barInfo.xAxisPadding === null) {
                let portionVisible = currentDiaplayInd + 1 - totalDiaplaySet / 2.0;
                if (portionVisible < 0.0) {
                    return 0.0;
                } else if (portionVisible < 1.0) {
                    return barWidth * portionVisible;
                }
                return barWidth;
            } else if (i === dataset.getLength() - 1 && barInfo.xAxisPadding === null) {
                let portionVisible =
                    1.0 - (currentDiaplayInd + 1 - totalDiaplaySet / 2.0);
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

function renderLegend(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    chartInfo: CommonChartInfo
) {
    // console.log(chartInfo.legendPosition);
    // console.log(chartInfo.legendOrientation);

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
    // Get datasets
    let datasets = renderInfo.datasets;
    let xDatasetIds = datasets.getXDatasetIds();
    // console.log(xDatasetIds);

    // Get names and their dimension
    let names = datasets.getNames(); // xDataset name included
    let nameSizes = names.map(function (n) {
        return helper.measureTextSize(n, "tracker-legend-label");
    });
    let indMaxName = 0;
    let maxNameWidth = 0.0;
    for (let ind = 0; ind < names.length; ind++) {
        if (xDatasetIds.includes(ind)) continue;
        if (nameSizes[ind].width > maxNameWidth) {
            maxNameWidth = nameSizes[ind].width;
            indMaxName = ind;
        }
    }
    let maxName = names[indMaxName];
    let characterWidth = maxNameWidth / maxName.length;
    let nameHeight = nameSizes[indMaxName].height;
    let numNames = names.length - xDatasetIds.length;

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
            d3.sum(nameSizes, function (s, i) {
                if (xDatasetIds.includes(i)) return 0;
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
        helper.expandArea(svg, 0, legendHeight + ySpacing);
        // Move dataArea down
        helper.moveArea(dataArea, 0, legendHeight + ySpacing);
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
        helper.expandArea(svg, 0, legendHeight + ySpacing);
    } else if (chartInfo.legendPosition === "left") {
        legendX = 0;
        legendY =
            titleHeight +
            renderInfo.dataAreaSize.height / 2.0 -
            legendHeight / 2.0;
        // Expand svg
        helper.expandArea(svg, legendWidth + xSpacing, 0);
        // Move dataArea right
        helper.moveArea(dataArea, legendWidth + xSpacing, 0);
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
        helper.expandArea(svg, legendWidth + xSpacing, 0);
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
        if (chartInfo.GetGraphType() === GraphType.Line) {
            // lines
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("line")
                .attr("x1", firstMarkerX)
                .attr("x2", firstMarkerX + markerWidth)
                .attr("y1", function (name: string, i: number) {
                    let numElemsExcluded = xDatasetIds.filter((id) => {
                        return id < i;
                    }).length;
                    i = i - numElemsExcluded;
                    return firstMarkerY + i * ySpacing;
                })
                .attr("y2", function (name: string, i: number) {
                    let numElemsExcluded = xDatasetIds.filter((id) => {
                        return id < i;
                    }).length;
                    i = i - numElemsExcluded;
                    return firstMarkerY + i * ySpacing;
                })
                .style("stroke", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as LineInfo).lineColor[i];
                });

            // points
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("circle")
                .attr("cx", firstMarkerX + markerWidth / 2.0)
                .attr("cy", function (name: string, i: number) {
                    let numElemsExcluded = xDatasetIds.filter((id) => {
                        return id < i;
                    }).length;
                    i = i - numElemsExcluded;
                    return firstMarkerY + i * ySpacing;
                })
                .attr("r", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    if ((chartInfo as LineInfo).showPoint[i]) {
                        return (chartInfo as LineInfo).pointSize[i];
                    }
                    return 0.0;
                })
                .style("fill", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as LineInfo).pointColor[i];
                });
        } else if (chartInfo.GetGraphType() === GraphType.Bar) {
            // bars
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("rect")
                .attr("x", firstMarkerX)
                .attr("y", function (name: string, i: number) {
                    let numElemsExcluded = xDatasetIds.filter((id) => {
                        return id < i;
                    }).length;
                    i = i - numElemsExcluded;
                    return firstMarkerY + i * ySpacing - nameHeight / 2.0;
                })
                .attr("width", markerWidth)
                .attr("height", nameHeight)
                .style("fill", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as BarInfo).barColor[i];
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
                let numElemsExcluded = xDatasetIds.filter((id) => {
                    return id < i;
                }).length;
                i = i - numElemsExcluded;
                return firstLabelY + i * ySpacing;
            })
            .text(function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return "";
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        if (chartInfo.GetGraphType() === GraphType.Line) {
            nameLabels.style("fill", function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return;
                return (chartInfo as LineInfo).lineColor[i];
            });
        } else if (chartInfo.GetGraphType() === GraphType.Bar) {
            nameLabels.style("fill", function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return;
                return (chartInfo as BarInfo).barColor[i];
            });
        }
    } else if (chartInfo.legendOrientation === "horizontal") {
        if (chartInfo.GetGraphType() === GraphType.Line) {
            // lines
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("line")
                .attr("x1", function (name: string, i: number) {
                    let posX = xSpacing;
                    for (let [ind, size] of nameSizes.entries()) {
                        if (xDatasetIds.includes(ind)) continue;
                        if (ind < i) {
                            posX +=
                                markerWidth + xSpacing + size.width + xSpacing;
                        } else {
                            break;
                        }
                    }
                    return posX;
                })
                .attr("x2", function (name: string, i: number) {
                    let posX = xSpacing + markerWidth;
                    for (let [ind, size] of nameSizes.entries()) {
                        if (xDatasetIds.includes(ind)) continue;
                        if (ind < i) {
                            posX +=
                                xSpacing + size.width + xSpacing + markerWidth;
                        } else {
                            break;
                        }
                    }
                    return posX;
                })
                .attr("y1", firstMarkerY)
                .attr("y2", firstMarkerY)
                .style("stroke", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as LineInfo).lineColor[i];
                });

            // points
            legend
                .selectAll("markers")
                .data(names)
                .enter()
                .append("circle")
                .attr("cx", function (name: string, i: number) {
                    let posX = xSpacing + markerWidth / 2.0;
                    for (let [ind, size] of nameSizes.entries()) {
                        if (xDatasetIds.includes(ind)) continue;
                        if (ind < i) {
                            posX +=
                                markerWidth / 2.0 +
                                xSpacing +
                                size.width +
                                xSpacing +
                                markerWidth / 2.0;
                        } else {
                            break;
                        }
                    }
                    return posX;
                })
                .attr("cy", firstMarkerY)
                .attr("r", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    if ((chartInfo as LineInfo).showPoint[i]) {
                        return (chartInfo as LineInfo).pointSize[i];
                    }
                    return 0.0;
                })
                .style("fill", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as LineInfo).pointColor[i];
                });
        } else if (chartInfo.GetGraphType() === GraphType.Bar) {
            // bars
            legend
                .selectAll("markers")
                .data(
                    names.filter((n, i) => {
                        return !xDatasetIds.includes(i);
                    })
                )
                .enter()
                .append("rect")
                .attr("x", function (name: string, i: number) {
                    let posX = xSpacing;
                    for (let [ind, size] of nameSizes.entries()) {
                        if (xDatasetIds.includes(ind)) continue;
                        if (ind < i) {
                            posX +=
                                markerWidth + xSpacing + size.width + xSpacing;
                        } else {
                            break;
                        }
                    }
                    return posX;
                })
                .attr("y", firstMarkerY - nameHeight / 2.0)
                .attr("width", markerWidth)
                .attr("height", nameHeight)
                .style("fill", function (name: string, i: number) {
                    if (xDatasetIds.includes(i)) return;
                    return (chartInfo as BarInfo).barColor[i];
                });
        }

        // names
        let nameLabels = legend
            .selectAll("labels")
            .data(names)
            .enter()
            .append("text")
            .attr("x", function (name: string, i: number) {
                let posX = xSpacing + markerWidth + xSpacing;
                for (let [ind, size] of nameSizes.entries()) {
                    if (xDatasetIds.includes(ind)) continue;
                    if (ind < i) {
                        posX += size.width + xSpacing + markerWidth + xSpacing;
                    } else {
                        break;
                    }
                }
                return posX;
            })
            .attr("y", firstLabelY)
            .text(function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return "";
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        if (chartInfo.GetGraphType() === GraphType.Line) {
            nameLabels.style("fill", function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return;
                return (chartInfo as LineInfo).lineColor[i];
            });
        } else if (chartInfo.GetGraphType() === GraphType.Bar) {
            nameLabels.style("fill", function (name: string, i: number) {
                if (xDatasetIds.includes(i)) return;
                return (chartInfo as BarInfo).barColor[i];
            });
        }
    }
}

function renderTitle(
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    chartInfo: CommonChartInfo
) {
    // console.log("renderTitle")
    // under graphArea

    if (!renderInfo || !chartInfo) return;

    if (!chartInfo.title) return;
    let titleSize = helper.measureTextSize(chartInfo.title, "tracker-title");

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
    helper.expandArea(chartElements.svg, 0, titleSize.height);
    helper.expandArea(chartElements.graphArea, 0, titleSize.height);

    // Move sibling areas
    helper.moveArea(chartElements.dataArea, 0, titleSize.height);

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

function renderLineChart(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    lineInfo: LineInfo
) {
    // console.log("renderLineChart");
    // console.log(renderInfo);

    if (!renderInfo || !lineInfo) return;

    let chartElements = createAreas(canvas, renderInfo);

    renderTitle(chartElements, renderInfo, lineInfo);

    renderXAxis(chartElements, renderInfo, lineInfo);
    // console.log(chartElements.xAxis);
    // console.log(chartElements.xScale);

    let datasetOnLeftYAxis = [];
    let datasetOnRightYAxis = [];
    let xDatasetIds = renderInfo.datasets.getXDatasetIds();
    for (let ind = 0; ind < lineInfo.yAxisLocation.length; ind++) {
        if (xDatasetIds.includes(ind)) continue;
        let yAxisLocation = lineInfo.yAxisLocation[ind];
        if (yAxisLocation.toLowerCase() === "left") {
            datasetOnLeftYAxis.push(ind);
        } else if (yAxisLocation.toLocaleLowerCase() === "right") {
            datasetOnRightYAxis.push(ind);
        }
    }

    let retRenderLeftYAxis = renderYAxis(
        chartElements,
        renderInfo,
        lineInfo,
        "left",
        datasetOnLeftYAxis
    );
    if (typeof retRenderLeftYAxis === "string") {
        return retRenderLeftYAxis;
    }

    if (chartElements.leftYAxis && chartElements.leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);
            if (dataset.getQuery().usedAsXDataset) continue;

            renderLine(chartElements, renderInfo, lineInfo, dataset, "left");

            renderPoints(chartElements, renderInfo, lineInfo, dataset, "left");
        }
    }

    let retRenderRightYAxis = renderYAxis(
        chartElements,
        renderInfo,
        lineInfo,
        "right",
        datasetOnRightYAxis
    );
    if (typeof retRenderRightYAxis === "string") {
        return retRenderRightYAxis;
    }

    if (chartElements.rightYAxis && chartElements.rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);
            if (dataset.getQuery().usedAsXDataset) continue;

            renderLine(chartElements, renderInfo, lineInfo, dataset, "right");

            renderPoints(chartElements, renderInfo, lineInfo, dataset, "right");
        }
    }

    if (lineInfo.showLegend) {
        renderLegend(chartElements, renderInfo, lineInfo);
    }

    setChartScale(canvas, chartElements, renderInfo);
}

function renderBarChart(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    barInfo: BarInfo
) {
    // console.log("renderBarChart");
    // console.log(renderInfo);
    if (!renderInfo || !barInfo) return;

    let chartElements = createAreas(canvas, renderInfo);

    renderTitle(chartElements, renderInfo, barInfo);

    renderXAxis(chartElements, renderInfo, barInfo);

    let datasetOnLeftYAxis = [];
    let datasetOnRightYAxis = [];
    let xDatasetIds = renderInfo.datasets.getXDatasetIds();
    if (renderInfo.stack) {
        for (let ind = barInfo.yAxisLocation.length - 1; ind >= 0; ind--) {
            if (xDatasetIds.includes(ind)) continue;
            let yAxisLocation = barInfo.yAxisLocation[ind];
            if (yAxisLocation.toLowerCase() === "left") {
                datasetOnLeftYAxis.push(ind);
            } else if (yAxisLocation.toLocaleLowerCase() === "right") {
                // right
                datasetOnRightYAxis.push(ind);
            }
        }

    } else {
        for (let ind = 0; ind < barInfo.yAxisLocation.length; ind++) {
            if (xDatasetIds.includes(ind)) continue;
            let yAxisLocation = barInfo.yAxisLocation[ind];
            if (yAxisLocation.toLowerCase() === "left") {
                datasetOnLeftYAxis.push(ind);
            } else if (yAxisLocation.toLocaleLowerCase() === "right") {
                // right
                datasetOnRightYAxis.push(ind);
            }
        }

    }

    let retRenderLeftYAxis = renderYAxis(
        chartElements,
        renderInfo,
        barInfo,
        "left",
        datasetOnLeftYAxis
    );
    if (typeof retRenderLeftYAxis === "string") {
        return retRenderLeftYAxis;
    }

    let totalNumOfBarSets =
        datasetOnLeftYAxis.length + datasetOnRightYAxis.length;
    let currBarSet = 0;

    if (chartElements.leftYAxis && chartElements.leftYScale) {
        for (let datasetId of datasetOnLeftYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);
            if (dataset.getQuery().usedAsXDataset) continue;

            renderBar(
                chartElements,
                renderInfo,
                barInfo,
                dataset,
                "left",
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    let retRenderRightYAxis = renderYAxis(
        chartElements,
        renderInfo,
        barInfo,
        "right",
        datasetOnRightYAxis
    );
    if (typeof retRenderRightYAxis === "string") {
        return retRenderRightYAxis;
    }

    if (chartElements.rightYAxis && chartElements.rightYScale) {
        for (let datasetId of datasetOnRightYAxis) {
            let dataset = renderInfo.datasets.getDatasetById(datasetId);
            if (dataset.getQuery().usedAsXDataset) continue;

            renderBar(
                chartElements,
                renderInfo,
                barInfo,
                dataset,
                "right",
                currBarSet,
                totalNumOfBarSets
            );

            currBarSet++;
        }
    }

    if (barInfo.showLegend) {
        renderLegend(chartElements, renderInfo, barInfo);
    }

    setChartScale(canvas, chartElements, renderInfo);
}

export function renderErrorMessage(canvas: HTMLElement, errorMessage: string) {
    // Remove graph not completed
    let graph = d3.select(canvas).select("#svg").remove();

    let svg = d3
        .select(canvas)
        .append("div")
        .text(errorMessage)
        .style("background-color", "white")
        .style("margin-bottom", "20px")
        .style("padding", "10px")
        .style("color", "red");
}
