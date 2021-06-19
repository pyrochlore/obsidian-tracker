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
    row: number;
    col: number;
    showDot: boolean;
    streakIn: boolean;
    streakOut: boolean;
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

    let titleHeight =
        Math.max(titleYearSize.height, titleMonthSize.height) * 1.5;
    let titleSpacing = 8;

    let headerHeight = 0;

    // Append title
    let titleGroup = chartElements.graphArea
        .append("g")
        .attr("height", titleHeight);

    // title year
    let titleYearColor = null;
    if (monthInfo.titleYearColor) {
        titleYearColor = monthInfo.titleYearColor;
    } else {
        if (monthInfo.color) {
            titleYearColor = monthInfo.color;
        }
    }
    let titleYear = titleGroup
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
        .attr("class", "tracker-month-title-year");

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
    let titleMonth = titleGroup
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
        .attr("class", "tracker-month-title-month");

    if (titleMonthColor) {
        titleMonth.style("fill", titleMonthColor);
    }

    // arrow left

    // arrow right

    chartElements["title"] = titleGroup;
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
        .attr("text-anchor", "middle");
    chartElements["weekDays"] = weekDays;
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

    // Expand parent areas
    helper.expandArea(chartElements.svg, 0, headerHeight);
    helper.expandArea(chartElements.graphArea, 0, headerHeight);

    // Move sibling areas
    helper.moveArea(chartElements.dataArea, 0, headerHeight);
}

function renderMonthDays(
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

        // scaledValue
        let curValue = dataset.getValue(curDate);
        let showDot = false;
        if (curValue !== null) {
            if (curValue > monthInfo.threshold) {
                showDot = true;
            }
        }

        // if (curDate.format("YYYY-MM-DD") === "2021-12-16") {
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
            .attr("x", function (d: DayInfo) {
                let x = scale(d.col) - cellSize / 2.0 - streakWidth;
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
                if (monthInfo.dimDotsNotInMonth && !d.isInThisMonth) {
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
            .attr("x", function (d: DayInfo) {
                let x = scale(d.col) + cellSize / 2.0;
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
                if (monthInfo.dimDotsNotInMonth && !d.isInThisMonth) {
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
            if (monthInfo.dimDotsNotInMonth && !d.isInThisMonth) {
                return 0.2;
            }
            return 1.0;
        });

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
            if (monthInfo.dimDotsNotInMonth && !d.isInThisMonth) {
                return 0.2;
            }
            return 1.0;
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
    if (!renderInfo || !renderMonth) return;

    let chartElements = createAreas(canvas, renderInfo, monthInfo);

    let today = window.moment();
    let lastDataMonthDate = renderInfo.datasets.getDates().last();

    let datasetId = parseFloat(monthInfo.dataset);
    let dataset = renderInfo.datasets.getDatasetById(datasetId);

    renderMonthHeader(
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        lastDataMonthDate
    );

    renderMonthDays(
        chartElements,
        renderInfo,
        monthInfo,
        dataset,
        lastDataMonthDate
    );
}
