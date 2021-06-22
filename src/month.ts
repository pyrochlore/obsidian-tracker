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
let ratioCellToText = 2.8;
let ratioDotToText = 1.8;

interface DayInfo {
    date: string;
    value: number;
    scaledValue: number;
    dayInMonth: number;
    isInThisMonth: boolean;
    isOutOfDataRange: boolean;
    row: number;
    col: number;
    showCircle: boolean;
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

function clearSelection(chartElements: ChartElements, monthInfo: MonthInfo) {
    let circles = chartElements.svg.selectAll("circle");
    // console.log(circles);
    for (let circle of circles) {
        // console.log(circle);
        let id = d3.select(circle).attr("id");
        if (id && id.startsWith("tracker-selected-circle-")) {
            d3.select(circle).style("stroke", "none");
        }
    }
    monthInfo.selectedDate = "";

    chartElements.monitor.text("");
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

    let headerYearText = curMonthDate.format("YYYY");
    let headerMonthText = curMonthDate.format("MMM");
    let headerYearSize = helper.measureTextSize(
        headerYearText,
        "tracker-month-title-year"
    );
    let headerMonthSize = helper.measureTextSize(
        headerMonthText,
        "tracker-month-title-month"
    );

    let headerHeight = 0;
    // Append header group
    let headerGroup = chartElements.graphArea.append("g");

    // title
    let titleHeight =
        Math.max(headerYearSize.height, headerMonthSize.height) * 1.5;
    let titleSpacing = 8;

    // title year
    let headerYearColor = null;
    if (monthInfo.headerYearColor) {
        headerYearColor = monthInfo.headerYearColor;
    } else {
        if (monthInfo.color) {
            headerYearColor = monthInfo.color;
        }
    }
    let titleYear = headerGroup
        .append("text")
        .text(headerYearText) // pivot at center
        .attr("id", "titleYear")
        .attr(
            "transform",
            "translate(" +
                (headerYearSize.width / 2.0 + cellSize / 4.0) +
                "," +
                headerYearSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-year")
        .style("cursor", "default")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });

    if (headerYearColor) {
        titleYear.style("fill", headerYearColor);
    }

    // title month
    let titleMonthColor = null;
    if (monthInfo.headerMonthColor) {
        titleMonthColor = monthInfo.headerMonthColor;
    } else {
        if (monthInfo.color) {
            titleMonthColor = monthInfo.color;
        }
    }
    let titleMonth = headerGroup
        .append("text")
        .text(headerMonthText) // pivot at center
        .attr("id", "titleMonth")
        .attr(
            "transform",
            "translate(" +
                (headerYearSize.width +
                    headerMonthSize.width / 2.0 +
                    cellSize / 4.0 +
                    titleSpacing) +
                "," +
                headerMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-month")
        .style("cursor", "default")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });

    if (titleMonthColor) {
        titleMonth.style("fill", titleMonthColor);
    }

    // value monitor
    let valueMonitor = headerGroup
        .append("text")
        .text("")
        .attr("id", "valueMonitor")
        .attr(
            "transform",
            "translate(" +
                3.5 * cellSize +
                "," +
                headerMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-monitor")
        .style("cursor", "pointer")
        .style("fill", monthInfo.selectedRingColor);
    chartElements["monitor"] = valueMonitor;

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
                headerMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function (event: any) {
            // console.log("left arrow clicked");
            clearSelection(chartElements, monthInfo);
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
                headerMonthSize.height / 2.0 +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function (event: any) {
            // console.log("right arrow clicked");
            clearSelection(chartElements, monthInfo);
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
    if (monthInfo.startWeekOn.toLowerCase() === "mon") {
        weekdayNames.push(weekdayNames.shift());
    }
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
        .style("cursor", "default")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });
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

    // Get min and max, null values will be treated as zero here
    let yMin = d3.min(dataset.getValues());
    if (monthInfo.yMin !== null) {
        yMin = monthInfo.yMin;
    }
    let yMax = d3.max(dataset.getValues());
    if (monthInfo.yMax !== null) {
        yMax = monthInfo.yMax;
    }
    // console.log(`yMin:${yMin}, yMax:${yMax}`);

    // Prepare data for graph
    let daysInMonthView: Array<DayInfo> = [];
    const monthStartDate = curMonthDate.clone().startOf("month");
    let startDate = monthStartDate
        .clone()
        .subtract(monthStartDate.day(), "days");
    if (monthInfo.startWeekOn.toLowerCase() === "mon") {
        startDate = startDate.add(1, "days");
    }
    const monthEndDate = curMonthDate.clone().endOf("month");
    let endDate = monthEndDate.clone().add(7 - monthEndDate.day() - 1, "days");
    if (monthInfo.startWeekOn.toLowerCase() === "mon") {
        endDate = endDate.add(1, "days");
    }
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
        if (monthInfo.startWeekOn.toLowerCase() === "mon") {
            indCol = curDate.day() - 1;
            if (indCol < 0) {
                indCol = 6;
            }
            indRow = Math.floor(ind / 7);
        } else {
            indCol = curDate.day(); // 0~6
            indRow = Math.floor(ind / 7);
        }

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

        // showCircle
        let curValue = dataset.getValue(curDate);
        let showCircle = false;
        if (curValue !== null) {
            if (curValue > monthInfo.threshold) {
                showCircle = true;
            }
        }

        // scaledValue
        let scaledValue = 0;
        if (Number.isNumber(yMax) && Number.isNumber(yMin) && yMax - yMin > 0) {
            scaledValue = (curValue - yMin) / (yMax - yMin);
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
            value: curValue,
            scaledValue: scaledValue,
            dayInMonth: curDate.date(),
            isInThisMonth: isInThisMonth,
            isOutOfDataRange: isOutOfDataRange,
            row: indRow,
            col: indCol,
            showCircle: showCircle,
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
        let streakColor = "#69b3a2";
        if (monthInfo.circleColor) {
            streakColor = monthInfo.circleColor;
        } else if (monthInfo.color) {
            streakColor = monthInfo.color;
        }

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
                if (d.showCircle) {
                    if (!monthInfo.circleColorByValue) {
                        return streakColor;
                    }
                    return d3.interpolateLab(
                        "white",
                        streakColor
                    )(d.scaledValue);
                }
                return "none";
            })
            .style("fill-opacity", function (d: DayInfo) {
                if (
                    d.isOutOfDataRange ||
                    (monthInfo.dimNotInMonth && !d.isInThisMonth)
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
                if (d.showCircle) {
                    if (!monthInfo.circleColorByValue) {
                        return streakColor;
                    }
                    return d3.interpolateLab(
                        "white",
                        streakColor
                    )(d.scaledValue);
                }
                return "none";
            })
            .style("fill-opacity", function (d: DayInfo) {
                if (
                    d.isOutOfDataRange ||
                    (monthInfo.dimNotInMonth && !d.isInThisMonth)
                ) {
                    return 0.2;
                }
                return 1.0;
            });
    }

    // circles
    let circleColor = "#69b3a2";
    if (monthInfo.circleColor) {
        circleColor = monthInfo.circleColor;
    } else if (monthInfo.color) {
        circleColor = monthInfo.color;
    }
    if (monthInfo.showCircle) {
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
                if (d.showCircle) {
                    if (!monthInfo.circleColorByValue) {
                        return circleColor;
                    }
                    return d3.interpolateLab(
                        "white",
                        circleColor
                    )(d.scaledValue);
                }
                return "none";
            })
            .style("fill-opacity", function (d: DayInfo) {
                if (
                    d.isOutOfDataRange ||
                    (monthInfo.dimNotInMonth && !d.isInThisMonth)
                ) {
                    return 0.2;
                }
                return 1.0;
            })
            .style("cursor", "default");
    }

    // today rings
    let today = window.moment().format(renderInfo.dateFormat);
    if (monthInfo.showTodayRing) {
        let todayRings = chartElements.dataArea
            .selectAll("todayRing")
            .data(
                daysInMonthView.filter(function (d: DayInfo) {
                    return d.date === today;
                })
            )
            .enter()
            .append("circle")
            .attr("r", dotRadius * 0.9)
            .attr("cx", function (d: DayInfo) {
                return scale(d.col);
            })
            .attr("cy", function (d: DayInfo) {
                return scale(d.row);
            })
            .attr("class", "tracker-month-today-circle") // stroke not works??
            .style("cursor", "default");

        if (monthInfo.todayRingColor !== "") {
            todayRings.style("stroke", monthInfo.todayRingColor);
        } else {
            todayRings.style("stroke", "white");
        }
    }

    // selected rings
    if (monthInfo.showSelectedRing) {
        let selectedRings = chartElements.dataArea
            .selectAll("selectedRing")
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
            .attr("id", function (d: DayInfo) {
                return "tracker-selected-circle-" + d.date;
            })
            .attr("class", "tracker-month-selected-circle") // stroke not works??
            .style("cursor", "default")
            .style("stroke", "none");
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
                (monthInfo.dimNotInMonth && !d.isInThisMonth)
            ) {
                return 0.2;
            }
            return 1.0;
        })
        .attr("date", function (d: DayInfo) {
            return d.date;
        })
        .attr("value", function (d: DayInfo) {
            return d.value;
        })
        .attr("valueType", function (d: DayInfo) {
            return ValueType[dataset.valueType];
        })
        .attr("class", "tracker-axis-label")
        .on("click", function (event: any) {
            // clear circles
            clearSelection(chartElements, monthInfo);
            // show new selected circle
            let date = d3.select(this).attr("date");
            monthInfo.selectedDate = date;
            if (monthInfo.showSelectedRing) {
                chartElements.dataArea
                    .select("#tracker-selected-circle-" + date)
                    .style("stroke", monthInfo.selectedRingColor);
            }
            // show value on monitor
            if (monthInfo.showSelectedValue) {
                let strValue = d3.select(this).attr("value");
                let valueType = d3.select(this).attr("valueType");
                let valueText = "";
                if (valueType === "Time") {
                    let dayStart = window.moment("00:00", "HH:mm", true);
                    let tickTime = dayStart.add(
                        parseFloat(strValue),
                        "seconds"
                    );
                    valueText = tickTime.format("HH:mm");
                } else {
                    valueText = strValue;
                }
                chartElements.monitor.text(valueText);
            }
        })
        .style("cursor", "pointer");

    // Expand areas
    let svgWidth = parseFloat(chartElements.svg.attr("width"));
    let svgHeight = parseFloat(chartElements.svg.attr("height"));
    let graphAreaWidth = parseFloat(chartElements.graphArea.attr("width"));
    let graphAreaHeight = parseFloat(chartElements.graphArea.attr("height"));
    let totalHeight =
        7 * cellSize + parseFloat(chartElements.header.attr("height"));
    let totalWidth = 7 * cellSize;
    if (totalHeight > svgHeight) {
        helper.expandArea(chartElements.svg, 0, totalHeight - svgHeight);
    }
    if (totalWidth > svgWidth) {
        helper.expandArea(chartElements.svg, totalWidth - svgWidth, 0);
    }
    if (totalHeight > graphAreaHeight) {
        helper.expandArea(
            chartElements.graphArea,
            0,
            totalHeight - graphAreaHeight
        );
    }
    if (totalWidth > graphAreaWidth) {
        helper.expandArea(chartElements.svg, totalWidth - graphAreaWidth, 0);
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
