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

let logToConsole = false;
let ratioCellToText = 2.5;
let ratioDotToText = 1.5;

interface DayInfo {
    date: string;
    dayInMonth: number;
    isInThisMonth: boolean;
    isOutOfDataRange: boolean;
    row: number;
    col: number;
    showDot: boolean;
    streakIn: boolean;
    streakOut: boolean;
}

function createAreas(
    chartElements: ChartElements,
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo
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

function renderMonthHeader(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    dataset: Dataset,
    curMonthDate: Moment
) {
    // console.log("renderMonthHeader")

    if (!renderInfo || !monthInfo) return;

    let curMonth = curMonthDate.month(); // 0~11
    let curDaysInMonth = curMonthDate.daysInMonth(); // 28~31
    let curYear = curMonthDate.year();

    let maxDayTextSize = helper.measureTextSize("30", "tracker-axis-label");
    let cellSize =
        Math.max(maxDayTextSize.width, maxDayTextSize.height) * ratioCellToText;
    let dotRadius = ((cellSize / ratioCellToText) * ratioDotToText) / 2.0;

    let titleYearText = curMonthDate.format("YYYY");
    let titleMonthText = curMonthDate.format("MMM");
    let titleYearSize = helper.measureTextSize(
        titleYearText,
        "tracker-month-title-year"
    );
    let titleMonthSize = helper.measureTextSize(
        titleMonthText,
        "tracker-month-title-month"
    );

    let headerHeight = 0;
    // Append header group
    let headerGroup = chartElements.graphArea.append("g");

    // title
    let titleHeight =
        Math.max(titleYearSize.height, titleMonthSize.height) * 1.5;
    let titleSpacing = 8;

    // title year
    let titleYearColor = null;
    if (monthInfo.titleYearColor) {
        titleYearColor = monthInfo.titleYearColor;
    } else {
        if (monthInfo.color) {
            titleYearColor = monthInfo.color;
        }
    }
    let titleYear = headerGroup
        .append("text")
        .text(titleYearText) // pivot at center
        .attr("id", "titleYear")
        .attr(
            "transform",
            "translate(" +
                (titleYearSize.width / 2.0 + cellSize / 4.0) +
                "," +
                titleYearSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-year")
        .style("cursor", "default");

    if (titleYearColor) {
        titleYear.style("fill", titleYearColor);
    }

    // title month
    let titleMonthColor = null;
    if (monthInfo.titleMonthColor) {
        titleMonthColor = monthInfo.titleMonthColor;
    } else {
        if (monthInfo.color) {
            titleMonthColor = monthInfo.color;
        }
    }
    let titleMonth = headerGroup
        .append("text")
        .text(titleMonthText) // pivot at center
        .attr("id", "titleMonth")
        .attr(
            "transform",
            "translate(" +
                (titleYearSize.width +
                    titleMonthSize.width / 2.0 +
                    cellSize / 4.0 +
                    titleSpacing) +
                "," +
                titleMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-month")
        .style("cursor", "default");

    if (titleMonthColor) {
        titleMonth.style("fill", titleMonthColor);
    }

    // arrow left
    let arrowLeft = headerGroup
        .append("text")
        .text("<") // pivot at center
        .attr("id", "arrowLeft")
        .attr(
            "transform",
            "translate(" +
                5.5 * cellSize +
                "," +
                titleMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function () {
            // console.log("left arrow clicked");
            let prevMonthDate = curMonthDate.clone().add(-1, "month");
            refresh(
                canvas,
                chartElements,
                renderInfo,
                monthInfo,
                prevMonthDate
            );
        })
        .style("cursor", "pointer");

    // arrow right
    let arrowRight = headerGroup
        .append("text")
        .text(">") // pivot at center
        .attr("id", "arrowLeft")
        .attr(
            "transform",
            "translate(" +
                6.5 * cellSize +
                "," +
                titleMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function () {
            // console.log("right arrow clicked");
            let nextMonthDate = curMonthDate.clone().add(1, "month");
            refresh(
                canvas,
                chartElements,
                renderInfo,
                monthInfo,
                nextMonthDate
            );
        })
        .style("cursor", "pointer");
    headerHeight += titleHeight;

    // week day names
    let weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let weekdayNameSize = helper.measureTextSize(
        weekdayNames[0],
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
                "translate(" + (i + 0.5) * cellSize + "," + headerHeight + ")";
            return strTranslate;
        })
        .attr("class", "tracker-tick-label")
        .attr("text-anchor", "middle")
        .style("cursor", "default");
    headerHeight += weekdayNameSize.height;

    // dividing line
    let dividingLineHeight = 1;
    let dividingLineColor = null;
    if (monthInfo.dividingLineColor) {
        dividingLineColor = monthInfo.dividingLineColor;
    } else {
        if (monthInfo.color) {
            dividingLineColor = monthInfo.color;
        }
    }
    let dividingLine = chartElements.graphArea
        .append("rect")
        .attr("x", 0)
        .attr("y", headerHeight)
        .attr("width", 6.5 * cellSize + weekdayNameSize.width)
        .attr("height", dividingLineHeight)
        .attr("class", "tracker-month-dividing-line");

    if (dividingLineColor) {
        dividingLine.style("fill", dividingLineColor);
    }
    headerHeight += dividingLineHeight;

    headerGroup.attr("height", headerHeight);
    chartElements["header"] = headerGroup;

    // Move sibling areas
    helper.moveArea(chartElements.dataArea, 0, headerHeight);
}

function renderMonthDays(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    dataset: Dataset,
    curMonthDate: Moment
) {
    // console.log("renderMonthDays");

    if (!renderInfo || !monthInfo) return;

    let curMonth = curMonthDate.month(); // 0~11
    let curDaysInMonth = curMonthDate.daysInMonth(); // 28~31

    let maxDayTextSize = helper.measureTextSize("30", "tracker-axis-label");
    let cellSize =
        Math.max(maxDayTextSize.width, maxDayTextSize.height) * ratioCellToText;
    let dotRadius = ((cellSize / ratioCellToText) * ratioDotToText) / 2.0;
    let streakWidth = (cellSize - dotRadius * 2.0) / 2.0;
    let streakHeight = 3;

    // Prepare data for graph
    let daysInMonthView: Array<DayInfo> = [];
    const monthStartDate = curMonthDate.clone().startOf("month");
    const startDate = monthStartDate
        .clone()
        .subtract(monthStartDate.day(), "days");
    const monthEndDate = curMonthDate.clone().endOf("month");
    const endDate = monthEndDate
        .clone()
        .add(7 - monthEndDate.day() - 1, "days");
    const dataStartDate = dataset.getStartDate().clone();
    const dataEndDate = dataset.getEndDate().clone();
    // console.log(monthStartDate.format("YYYY-MM-DD"));
    // console.log(startDate.format("YYYY-MM-DD"));
    let indCol = 0;
    let indRow = 0;
    let ind = 0;
    for (
        let curDate = startDate.clone();
        curDate <= endDate;
        curDate.add(1, "days")
    ) {
        indCol = curDate.day();
        indRow = Math.floor(ind / 7);

        // is this day in this month
        let isInThisMonth = true;
        if (
            curDate.diff(monthStartDate) < 0 ||
            curDate.diff(monthEndDate) > 0
        ) {
            isInThisMonth = false;
        }
        // is this day out of data range
        let isOutOfDataRange = false;
        if (curDate.diff(dataStartDate) < 0 || curDate.diff(dataEndDate) > 0) {
            isOutOfDataRange = true;
        }

        // scaledValue
        let curValue = dataset.getValue(curDate);
        let showDot = false;
        if (curValue !== null) {
            if (curValue > monthInfo.threshold) {
                showDot = true;
            }
        }

        // if (curDate.format("YYYY-MM-DD") === "2021-11-02") {
        //     logToConsole = true;
        // }

        // streakIn and streakOut
        let nextValue = dataset.getValue(curDate, 1);
        let prevValue = dataset.getValue(curDate, -1);
        let streakIn = false;
        if (curValue !== null && curValue > monthInfo.threshold) {
            if (prevValue !== null && prevValue > monthInfo.threshold) {
                streakIn = true;
            }
        }
        let streakOut = false;
        if (curValue !== null && curValue > monthInfo.threshold) {
            if (nextValue !== null && nextValue > monthInfo.threshold) {
                streakOut = true;
            }
        }
        // if (logToConsole) {
        //     console.log(`preValue: ${prevValue}, curValue: ${curValue}, nextValue: ${nextValue}`);
        //     console.log(monthInfo.threshold);
        //     console.log(`streakIn: ${streakIn}, streakOut: ${streakOut}`);
        //     logToConsole = false;
        // }

        daysInMonthView.push({
            date: curDate.format(renderInfo.dateFormat),
            dayInMonth: curDate.date(),
            isInThisMonth: isInThisMonth,
            isOutOfDataRange: isOutOfDataRange,
            row: indRow,
            col: indCol,
            showDot: showDot,
            streakIn: streakIn,
            streakOut: streakOut,
        });

        ind++;
    }
    // console.log(daysInMonthView);
    // console.log(daysInMonthView.filter(function (d: DayInfo) {
    //     return d.streakIn;
    // }));
    // console.log(daysInMonthView.filter(function (d: DayInfo) {
    //     return d.streakOut;
    // }));

    // scale
    let totalDayBlockWidth = (indCol + 1) * cellSize;
    let totalBlockHeight = (indRow + 1) * cellSize;
    let scale = d3
        .scaleLinear()
        .domain([-0.5, 6.5])
        .range([0, totalDayBlockWidth]);

    // streak lines
    if (monthInfo.showStreak) {
        chartElements.dataArea
            .selectAll("streakIn")
            .data(
                daysInMonthView.filter(function (d: DayInfo) {
                    return d.streakIn;
                })
            )
            .enter()
            .append("rect")
            // .attr("id", function(d: DayInfo) {
            //     return "in" + d.date.format("YYYY-MM-DD");
            // })
            .attr("x", function (d: DayInfo) {
                let x = scale(d.col) - dotRadius - streakWidth;
                return x;
            })
            .attr("y", function (d: DayInfo) {
                return scale(d.row) - streakHeight / 2.0;
            })
            .attr("width", streakWidth)
            .attr("height", streakHeight)
            .style("fill", function (d: DayInfo) {
                if (d.showDot) {
                    if (monthInfo.dotColor) {
                        return monthInfo.dotColor;
                    } else if (monthInfo.color) {
                        return monthInfo.color;
                    }
                    return "#69b3a2";
                }
                return "none";
            })
            .style("fill-opacity", function (d: DayInfo) {
                if (
                    d.isOutOfDataRange ||
                    (monthInfo.dimDotsNotInMonth && !d.isInThisMonth)
                ) {
                    return 0.2;
                }
                return 1.0;
            });

        chartElements.dataArea
            .selectAll("streakOut")
            .data(
                daysInMonthView.filter(function (d: DayInfo) {
                    return d.streakOut;
                })
            )
            .enter()
            .append("rect")
            // .attr("id", function(d: DayInfo) {
            //     return "out" + d.date.format("YYYY-MM-DD");
            // })
            .attr("x", function (d: DayInfo) {
                let x = scale(d.col) + dotRadius;
                return x;
            })
            .attr("y", function (d: DayInfo) {
                return scale(d.row) - streakHeight / 2.0;
            })
            .attr("width", streakWidth)
            .attr("height", streakHeight)
            .style("fill", function (d: DayInfo) {
                if (d.showDot) {
                    if (monthInfo.dotColor) {
                        return monthInfo.dotColor;
                    } else if (monthInfo.color) {
                        return monthInfo.color;
                    }
                    return "#69b3a2";
                }
                return "none";
            })
            .style("fill-opacity", function (d: DayInfo) {
                if (
                    d.isOutOfDataRange ||
                    (monthInfo.dimDotsNotInMonth && !d.isInThisMonth)
                ) {
                    return 0.2;
                }
                return 1.0;
            });
    }

    // dots
    let dots = chartElements.dataArea
        .selectAll("dot")
        .data(daysInMonthView)
        .enter()
        .append("circle")
        .attr("r", dotRadius)
        .attr("cx", function (d: DayInfo) {
            return scale(d.col);
        })
        .attr("cy", function (d: DayInfo) {
            return scale(d.row);
        })
        .style("fill", function (d: DayInfo) {
            if (d.showDot) {
                if (monthInfo.dotColor) {
                    return monthInfo.dotColor;
                } else if (monthInfo.color) {
                    return monthInfo.color;
                }
                return "#69b3a2";
            }
            return "none";
        })
        .style("fill-opacity", function (d: DayInfo) {
            if (
                d.isOutOfDataRange ||
                (monthInfo.dimDotsNotInMonth && !d.isInThisMonth)
            ) {
                return 0.2;
            }
            return 1.0;
        })
        .style("cursor", "default");

    // today circles
    let today = window.moment().format(renderInfo.dateFormat);
    if (monthInfo.showTodayCircle) {
        let todayCircles = chartElements.dataArea
            .selectAll("todayCircle")
            .data(
                daysInMonthView.filter(function (d: DayInfo) {
                    return d.date === today;
                })
            )
            .enter()
            .append("circle")
            .attr("r", dotRadius)
            .attr("cx", function (d: DayInfo) {
                return scale(d.col);
            })
            .attr("cy", function (d: DayInfo) {
                return scale(d.row);
            })
            .attr("class", "tracker-month-today-circle") // stroke not works??
            .style("cursor", "default");

        if (monthInfo.todayCircleColor !== "") {
            todayCircles.style("stroke", monthInfo.todayCircleColor);
        } else {
            todayCircles.style("stroke", "white");
        }
    }

    // labels
    let dayLabals = chartElements.dataArea
        .selectAll("dayLabel")
        .data(daysInMonthView)
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
        .style("fill-opacity", function (d: DayInfo) {
            if (
                d.isOutOfDataRange ||
                (monthInfo.dimDotsNotInMonth && !d.isInThisMonth)
            ) {
                return 0.2;
            }
            return 1.0;
        })
        .attr("class", "tracker-axis-label")
        .style("cursor", "default");

    // Expand areas
    let svgHeight = parseFloat(chartElements.svg.attr("height"));
    let graphAreaHeight = parseFloat(chartElements.graphArea.attr("height"));
    let totalHeight =
        7 * cellSize + parseFloat(chartElements.header.attr("height"));
    if (totalHeight > svgHeight) {
        helper.expandArea(chartElements.svg, 0, totalHeight - svgHeight);
    }
    if (totalHeight > graphAreaHeight) {
        helper.expandArea(
            chartElements.graphArea,
            0,
            totalHeight - graphAreaHeight
        );
    }
}

function refresh(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo,
    curMonthDate: Moment
) {
    // console.log("refresh");
    // console.log(renderInfo);
    if (!renderInfo || !renderMonth) return;

    chartElements = createAreas(chartElements, canvas, renderInfo, monthInfo);

    let datasetId = parseFloat(monthInfo.dataset);
    let dataset = renderInfo.datasets.getDatasetById(datasetId);

    // render
    renderMonthHeader(
        canvas,
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        curMonthDate
    );

    renderMonthDays(
        canvas,
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        curMonthDate
    );
}

export function renderMonth(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo
) {
    // console.log("renderMonth");
    // console.log(renderInfo);
    if (!renderInfo || !renderMonth) return;

    let chartElements: ChartElements = {};
    chartElements = createAreas(chartElements, canvas, renderInfo, monthInfo);

    let today = window.moment();
    let lastDataMonthDate = renderInfo.datasets.getDates().last();

    let datasetId = parseFloat(monthInfo.dataset);
    let dataset = renderInfo.datasets.getDatasetById(datasetId);

    renderMonthHeader(
        canvas,
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        lastDataMonthDate
    );

    renderMonthDays(
        canvas,
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        lastDataMonthDate
    );
}
