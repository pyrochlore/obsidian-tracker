import { Moment } from "moment";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    MonthInfo,
    Dataset,
    Size,
    ThresholdType,
    Transform,
    ChartElements,
    GraphType,
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
    curStreakCount: number;
    annotation: string;
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

function toNextDataset(renderInfo: RenderInfo, monthInfo: MonthInfo): boolean {
    let datasetIds = monthInfo.dataset;
    if (datasetIds.length === 0) return false; // false if selected dataset not changed

    let dataset = null;
    if (monthInfo.selectedDataset === null) {
        for (let datasetId of datasetIds) {
            dataset = renderInfo.datasets.getDatasetById(datasetId);
            if (dataset && !dataset.getQuery().usedAsXDataset) break;
        }
        if (dataset) {
            monthInfo.selectedDataset = dataset.getId();
            return true; // true if selectec dataset changed
        }
    } else {
        let curDatasetId = monthInfo.selectedDataset;
        let curIndex = datasetIds.findIndex((id) => {
            return id === curDatasetId;
        });
        if (curIndex >= 0) {
            if (curIndex === monthInfo.dataset.length - 1) {
                // search from start
                for (let datasetId of datasetIds) {
                    dataset = renderInfo.datasets.getDatasetById(datasetId);
                    if (dataset && !dataset.getQuery().usedAsXDataset) break;
                }
                if (dataset) {
                    monthInfo.selectedDataset = dataset.getId();
                    return true; // true if selectec dataset changed
                } else {
                    return false;
                }
            } else {
                curIndex++;
                let datasetId = datasetIds[curIndex];
                dataset = renderInfo.datasets.getDatasetById(datasetId);
                monthInfo.selectedDataset = datasetId;
                if (dataset && !dataset.getQuery().usedAsXDataset) {
                    return true;
                } else {
                    toNextDataset(renderInfo, monthInfo);
                }
            }
        }
    }

    return false;
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
    curMonthDate: Moment
) {
    // console.log("renderMonthHeader")

    if (!renderInfo || !monthInfo) return;

    let curDatasetId = monthInfo.selectedDataset;
    if (curDatasetId === null) return;
    let dataset = renderInfo.datasets.getDatasetById(curDatasetId);
    if (!dataset) return;
    let datasetName = dataset.getName();

    let curMonth = curMonthDate.month(); // 0~11
    let curDaysInMonth = curMonthDate.daysInMonth(); // 28~31
    let curYear = curMonthDate.year();

    let maxDayTextSize = helper.measureTextSize("30", "tracker-month-label");
    let cellSize =
        Math.max(maxDayTextSize.width, maxDayTextSize.height) * ratioCellToText;
    let dotRadius = ((cellSize / ratioCellToText) * ratioDotToText) / 2.0;

    let headerYearText = curMonthDate.format("YYYY");
    let headerMonthText = curMonthDate.format("MMM");
    let headerYearSize = helper.measureTextSize(
        headerYearText,
        "tracker-month-header-year"
    );
    let headerMonthSize = helper.measureTextSize(
        headerMonthText,
        "tracker-month-header-month"
    );

    let headerHeight = 0;
    let ySpacing = 8;

    // Append header group
    let headerGroup = chartElements.graphArea.append("g");

    // haeder month
    let headerMonthColor = null;
    if (monthInfo.headerMonthColor) {
        headerMonthColor = monthInfo.headerMonthColor;
    } else {
        if (monthInfo.color) {
            headerMonthColor = monthInfo.color;
        }
    }
    let headerMonth = headerGroup
        .append("text")
        .text(headerMonthText) // pivot at center
        .attr("id", "titleMonth")
        .attr(
            "transform",
            "translate(" + cellSize / 4.0 + "," + headerMonthSize.height + ")"
        )
        .attr("class", "tracker-month-header-month")
        .style("cursor", "default")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });

    if (headerMonthColor) {
        headerMonth.style("fill", headerMonthColor);
    }
    headerHeight += headerMonthSize.height;

    // header year
    let headerYearColor = null;
    if (monthInfo.headerYearColor) {
        headerYearColor = monthInfo.headerYearColor;
    } else {
        if (monthInfo.color) {
            headerYearColor = monthInfo.color;
        }
    }
    let headerYear = headerGroup
        .append("text")
        .text(headerYearText) // pivot at center
        .attr("id", "titleYear")
        .attr(
            "transform",
            "translate(" +
                cellSize / 4.0 +
                "," +
                (headerHeight + headerYearSize.height) +
                ")"
        )
        .attr("class", "tracker-month-header-year")
        .style("cursor", "default")
        .attr("font-weight", "bold")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });

    if (headerYearColor) {
        headerYear.style("fill", headerYearColor);
    }

    headerHeight += headerYearSize.height;

    if (monthInfo.mode === "annotation" && monthInfo.showAnnotationOfAllTargets && monthInfo.dataset.length > 1) {
        datasetName = "All Targets"
    }

    // dataset rotator
    let datasetNameSize = helper.measureTextSize(
        datasetName,
        "tracker-month-title-rotator"
    );
    
    let datasetRotator = headerGroup
        .append("text")
        .text(datasetName)
        .attr(
            "transform",
            "translate(" +
                3.5 * cellSize +
                "," +
                datasetNameSize.height +
                ")"
        )
        .attr("class", "tracker-month-title-rotator")
        .style("cursor", "pointer");
    if (!monthInfo.showAnnotationOfAllTargets || monthInfo.mode !== "annotation") {
        datasetRotator.on("click", function (event: any) {
            // show next target
            if (toNextDataset(renderInfo, monthInfo)) {
                // clear circles
                clearSelection(chartElements, monthInfo);

                refresh(
                    canvas,
                    chartElements,
                    renderInfo,
                    monthInfo,
                    curMonthDate
                );
            }
        });
    }
    chartElements["rotator"] = datasetRotator;

    // value monitor
    let monitorTextSize = helper.measureTextSize(
        "0.0000",
        "tracker-month-title-monitor"
    );
    let monitor = headerGroup
        .append("text")
        .text("")
        .attr("id", "monitor")
        .attr("class", "tracker-month-title-monitor")
        .attr(
            "transform",
            "translate(" +
                3.5 * cellSize +
                "," +
                (datasetNameSize.height + monitorTextSize.height) +
                ")"
        )
        .style("cursor", "pointer")
        .style("fill", monthInfo.selectedRingColor);
    chartElements["monitor"] = monitor;

    // arrow left
    let arrowSize = helper.measureTextSize("<", "tracker-month-title-arrow");
    let arrowLeft = headerGroup
        .append("text")
        .text("<") // pivot at center
        .attr("id", "arrowLeft")
        .attr(
            "transform",
            "translate(" +
                5.5 * cellSize +
                "," +
                (headerHeight / 2 + arrowSize.height / 2) +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function (event: any) {
            // console.log("left arrow clicked");
            clearSelection(chartElements, monthInfo);
            monthInfo.selectedDate = "";
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
        .attr("id", "arrowRight")
        .attr(
            "transform",
            "translate(" +
                6.5 * cellSize +
                "," +
                (headerHeight / 2 + arrowSize.height / 2) +
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

    // arrow today
    let arrowToday = headerGroup
        .append("text")
        .text("◦") // pivot at center
        .attr("id", "arrowToday")
        .attr(
            "transform",
            "translate(" +
                6 * cellSize +
                "," +
                (headerHeight / 2 + arrowSize.height / 2) +
                ")"
        )
        .attr("class", "tracker-month-title-arrow")
        .on("click", function (event: any) {
            // console.log("today arrow clicked");
            clearSelection(chartElements, monthInfo);

            let todayDate = helper.getDateToday(renderInfo.dateFormat);
            refresh(canvas, chartElements, renderInfo, monthInfo, todayDate);
        })
        .style("cursor", "pointer");

    headerHeight += ySpacing;

    // week day names
    let weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (monthInfo.startWeekOn.toLowerCase() === "mon") {
        weekdayNames.push(weekdayNames.shift());
    }
    let weekdayNameSize = helper.measureTextSize(
        weekdayNames[0],
        "tracker-month-weekday"
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
                "translate(" +
                (i + 0.5) * cellSize +
                "," +
                (headerHeight + weekdayNameSize.height) +
                ")";
            return strTranslate;
        })
        .attr("class", "tracker-month-weekday")
        .attr("text-anchor", "middle")
        .style("cursor", "default")
        .on("click", function (event: any) {
            clearSelection(chartElements, monthInfo);
        });
    headerHeight += weekdayNameSize.height + ySpacing;

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
    curMonthDate: Moment
) {
    // console.log("renderMonthDays");
    // console.log(renderInfo);
    // console.log(monthInfo);
    if (!renderInfo || !monthInfo) return;

    let mode = monthInfo.mode;
    if (mode !== "circle" && mode !== "annotation") {
        return "Unknown month view mode";
    }

    let curDatasetId = monthInfo.selectedDataset;
    if (curDatasetId === null) return;
    let dataset = renderInfo.datasets.getDatasetById(curDatasetId);
    if (!dataset) return;
    // console.log(dataset);

    let curDatasetIndex = monthInfo.dataset.findIndex((id) => {
        return id === curDatasetId;
    });
    if (curDatasetId < 0) curDatasetIndex = 0;
    let threshold = monthInfo.threshold[curDatasetIndex];
    let thresholdType = monthInfo.thresholdType[curDatasetIndex];

    if(logToConsole){
        console.log(`threshold: ${threshold}, thresholdType: ${thresholdType}`);
    }
    
    let curMonth = curMonthDate.month(); // 0~11
    let curDaysInMonth = curMonthDate.daysInMonth(); // 28~31

    let maxDayTextSize = helper.measureTextSize("30", "tracker-month-label");
    let cellSize =
        Math.max(maxDayTextSize.width, maxDayTextSize.height) * ratioCellToText;
    let dotRadius = ((cellSize / ratioCellToText) * ratioDotToText) / 2.0;
    let streakWidth = (cellSize - dotRadius * 2.0) / 2.0;
    let streakHeight = 3;

    // Get min and max
    let yMin = d3.min(dataset.getValues());
    if (monthInfo.yMin[curDatasetIndex] !== null) {
        yMin = monthInfo.yMin[curDatasetIndex];
    }
    let yMax = d3.max(dataset.getValues());
    if (monthInfo.yMax[curDatasetIndex] !== null) {
        yMax = monthInfo.yMax[curDatasetIndex];
    }
    // console.log(`yMin:${yMin}, yMax:${yMax}`);
    let allowScaledValue = true;
    if (yMax === null || yMin === null || yMax <= yMin) {
        // scaledValue can not be calculated, do not use gradient color
        allowScaledValue = false;
        // console.log("scaledValue not allowed");
    }

    // Start and end
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
    const dataStartDate = dataset.getStartDate();
    const dataEndDate = dataset.getEndDate();
    // console.log(monthStartDate.format("YYYY-MM-DD"));
    // console.log(startDate.format("YYYY-MM-DD"));

    // annotations
    let showAnnotation = monthInfo.showAnnotation;
    let annotations = monthInfo.annotation;
    let curAnnotation = annotations[curDatasetIndex];
    let showAnnotationOfAllTargets = monthInfo.showAnnotationOfAllTargets;

    // Prepare data for graph
    let daysInMonthView: Array<DayInfo> = [];
    let indCol = 0;
    let indRow = 0;
    let ind = 0;
    let curStreakCount = 0;
    
    let streakStartDate = startDate.clone().subtract(1, "days");
    while(curStreakCount < 28) {
        let curValue = dataset.getValue(streakStartDate);
        if(curValue != null && ((thresholdType === ThresholdType.LessThan && curValue < threshold) 
            || (thresholdType === ThresholdType.GreaterThan && curValue > threshold))) {
            curStreakCount++;
            streakStartDate = streakStartDate.subtract(1, "days");
        } else {
            break;
        }
    }
    
    for (
        let curDate = startDate.clone();
        curDate <= endDate;
        curDate.add(1, "days")
    ) {
        // not sure why we need to do this to stablize the date
        // sometimes, curValue is wrong without doing this
        curDate = helper.strToDate(
            helper.dateToStr(curDate, renderInfo.dateFormat),
            renderInfo.dateFormat
        );
        if (curDate.format("YYYY-MM-DD") === "2021-09-13") {
            logToConsole = false; // Change this to do dubugging
        }

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
        let isOutOfDataRange = true;
        if (
            dataStartDate &&
            dataEndDate &&
            curDate.diff(dataStartDate) >= 0 &&
            curDate.diff(dataEndDate) <= 0
        ) {
            isOutOfDataRange = false;
        }

        const curValue = dataset.getValue(curDate);
        if (logToConsole) {
            console.log(dataset);
            console.log(helper.dateToStr(curDate, renderInfo.dateFormat));
            console.log(curValue);
        }


        let showCircle = curValue != null;

        if(thresholdType === ThresholdType.LessThan){
            showCircle = showCircle && (curValue < threshold);
        } else {
            showCircle = showCircle && (curValue > threshold);
        }
       
        // scaledValue
        let scaledValue = null;
        if (monthInfo.circleColorByValue) {
            if (allowScaledValue && curValue !== null) {
                scaledValue = (curValue - yMin) / (yMax - yMin);
            }
        }
        if (logToConsole) {
            console.log(yMin);
            console.log(yMax);
            console.log(scaledValue);
        }

        // streakIn and streakOut
        let nextValue = dataset.getValue(curDate, 1);
        let prevValue = dataset.getValue(curDate, -1);
        let streakIn = false;
        if (showCircle) {
            if (prevValue !== null && ((thresholdType === ThresholdType.LessThan && prevValue
                < threshold) || (thresholdType === ThresholdType.GreaterThan && prevValue > threshold))) {
                streakIn = true;
            } 
        }

        if(showCircle) {
            curStreakCount != 28? curStreakCount++: curStreakCount;
        }
        else {
            curStreakCount = 0;
        }
       
        let streakOut = false;
        if (showCircle) {
            if (nextValue !== null && ((thresholdType === ThresholdType.LessThan && nextValue 
                < threshold) ||  (thresholdType === ThresholdType.GreaterThan && nextValue > threshold))) {
                streakOut = true;
            }
        }
        if (logToConsole) {
            console.log(
                `preValue: ${prevValue}, curValue: ${curValue}, nextValue: ${nextValue}`
            );
            console.log(monthInfo.threshold);
            console.log(`streakIn: ${streakIn}, streakOut: ${streakOut}`);
        }

        let textAnnotation = "";
        if (showAnnotation) {
            if (!showAnnotationOfAllTargets) {
                if (showCircle) {
                    textAnnotation = curAnnotation;
                }
            } else {
                for (let datasetId of monthInfo.dataset) {
                    let datasetIndex = monthInfo.dataset.findIndex((id) => {
                        return id === datasetId;
                    });
                    if (datasetIndex >= 0) {
                        let v = renderInfo.datasets
                            .getDatasetById(datasetId)
                            .getValue(curDate);
                        
                        let ttype = monthInfo.thresholdType[datasetIndex];
                        let t = monthInfo.threshold[datasetIndex];
                        if (v !== null && ((ttype === ThresholdType.LessThan && v < t) || 
                            (ttype == ThresholdType.GreaterThan && v > t))) {
                            textAnnotation += annotations[datasetIndex];
                        }
                    }
                }
            }
        }

        daysInMonthView.push({
            date: helper.dateToStr(curDate, renderInfo.dateFormat),
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
            curStreakCount: curStreakCount,
            annotation: textAnnotation,
        });

        ind++;

        // Disable logging starts at the beginning of each loop
        if (logToConsole) {
            logToConsole = false;
        }
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
    if (mode === "circle" && monthInfo.showCircle && monthInfo.showStreak) {
        let streakColor = "#69b3a2";
        if (monthInfo.circleColor) {
            streakColor = monthInfo.circleColor;
        } else if (monthInfo.color) {
            streakColor = monthInfo.color;
        }
        // console.log(streakColor);

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
                    if (!(monthInfo.circleColorByValue || monthInfo.circleColorByStreak)) {
                        return streakColor;
                    }
                    if (monthInfo.circleColorByValue && d.scaledValue !== null) {
                        return d3.interpolateLab(
                            "white",
                            streakColor
                        )(d.scaledValue * 0.8 + 0.2);
                    } else if(monthInfo.circleColorByStreak && d.curStreakCount > 0){
                        return d3.interpolateLab( "white", streakColor)(
                            Math.log10(d.curStreakCount)/Math.log10(28) * 0.6 + 0.4
                          );
                    } else {
                        return "none";
                    }
                }
                return "none";
            })
            .style("opacity", function (d: DayInfo) {
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
                    if (!(monthInfo.circleColorByValue || monthInfo.circleColorByStreak)) {
                        return streakColor;
                    }
                    if (monthInfo.circleColorByValue && d.scaledValue !== null) {
                        return d3.interpolateLab(
                            "white",
                            streakColor
                        )(d.scaledValue * 0.8 + 0.2);
                    } else if(monthInfo.circleColorByStreak && d.curStreakCount > 0){
                        return d3.interpolateLab("white", streakColor)(
                            Math.log10(d.curStreakCount)/Math.log10(28) * 0.6 + 0.4
                        );    
                    } else {
                        return "none";
                    }
                }
                return "none";
            })
            .style("opacity", function (d: DayInfo) {
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
    if (mode === "circle" && monthInfo.showCircle) {
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
                    if (!(monthInfo.circleColorByValue || monthInfo.circleColorByStreak)) {
                        return circleColor;
                    }
                    if (monthInfo.circleColorByValue && d.scaledValue !== null) {
                        return d3.interpolateLab(
                            "white",
                            circleColor
                        )(d.scaledValue * 0.8 + 0.2);  
                    } else if(monthInfo.circleColorByStreak && d.curStreakCount > 0){
                        return d3.interpolateLab( "white", circleColor)(
                            Math.log10(d.curStreakCount)/Math.log10(28) * 0.6 + 0.4
                        );
                    } else {
                        return "none";
                    }
                }
                return "none";
            })
            .style("opacity", function (d: DayInfo) {
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
    let today = helper.dateToStr(window.moment(), renderInfo.dateFormat);
    if (mode === "circle" && monthInfo.showTodayRing) {
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
    if (mode === "circle" && monthInfo.showSelectedRing) {
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
            let transX = scale(d.col);
            let transY = scale(d.row) + maxDayTextSize.height / 4;
            let strTranslate = "translate(" + transX + "," + transY + ")";

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
        .attr("class", "tracker-month-label")
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

    // annotation
    if (mode === "annotation" && showAnnotation) {
        let dayAnnotation = chartElements.dataArea
            .selectAll("dayAnnotation")
            .data(daysInMonthView)
            .enter()
            .append("text")
            .text(function (d: DayInfo) {
                return d.annotation;
            })
            .attr("transform", function (d: DayInfo) {
                let transX = scale(d.col);
                let transY = scale(d.row) + maxDayTextSize.height / 4;
                if (d.annotation) {
                    transY += dotRadius;
                }
                let strTranslate = "translate(" + transX + "," + transY + ")";

                return strTranslate;
            })
            .attr("class", "tracker-month-annotation");
    }

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

    // render
    renderMonthHeader(
        canvas,
        chartElements,
        renderInfo,
        monthInfo,
        curMonthDate
    );

    renderMonthDays(canvas, chartElements, renderInfo, monthInfo, curMonthDate);

    setChartScale(canvas, chartElements, renderInfo);
}

export function renderMonth(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    monthInfo: MonthInfo
) {
    // console.log("renderMonth");
    // console.log(renderInfo);
    // console.log(monthInfo);
    if (!renderInfo || !renderMonth) return;

    // dataset
    let datasetIds = monthInfo.dataset;
    let numAvailableDataset = 0;
    for (let dataset of renderInfo.datasets) {
        if (!dataset.getQuery().usedAsXDataset) {
            numAvailableDataset++;
        }
    }
    if (numAvailableDataset === 0) {
        return "No available dataset found";
    }
    toNextDataset(renderInfo, monthInfo);
    if (monthInfo.selectedDataset === null) {
        return "No available dataset found";
    }

    let chartElements: ChartElements = {};
    chartElements = createAreas(chartElements, canvas, renderInfo, monthInfo);

    let monthDate: Moment = null;
    if (monthInfo.initMonth) {
        monthDate = helper.getDateByDurationToToday(
            monthInfo.initMonth,
            renderInfo.dateFormat
        );
        if (!monthDate) {
            let initMonth = window.moment(monthInfo.initMonth, "YYYY-MM", true);
            // console.log(initMonth);
            if (initMonth.isValid()) {
                monthDate = initMonth;
            } else {
                return "Invalid initMonth";
            }
        }
    } else {
        monthDate = renderInfo.datasets.getDates().last();
    }
    if (!monthDate) return;

    renderMonthHeader(canvas, chartElements, renderInfo, monthInfo, monthDate);

    renderMonthDays(canvas, chartElements, renderInfo, monthInfo, monthDate);

    setChartScale(canvas, chartElements, renderInfo);
}
