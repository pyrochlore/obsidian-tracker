import { Moment } from "moment";
import {
    Datasets,
    DataPoint,
    RenderInfo,
    PieInfo,
    MonthInfo,
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
import { pie } from "d3";

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
    chartElements: ChartElements,
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
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

function renderTitle(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderTitle");
    // under graphArea

    if (!renderInfo || !pieInfo) return;

    if (!pieInfo.title) return;
    let titleSize = helper.measureTextSize(pieInfo.title, "tracker-title");

    // Append title
    let title = chartElements.graphArea
        .append("text")
        .text(pieInfo.title) // pivot at center
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

function renderLegend(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderLegend");
    // console.log(piInfo.legendPosition);
    // console.log(piInfo.legendOrientation);

    // Get chart elements
    let svg = chartElements.svg;
    let graphArea = chartElements.graphArea;
    let dataArea = chartElements.dataArea;
    let title = chartElements.title;

    // Get element width and height
    let titleHeight = 0.0;
    if (title) {
        titleHeight = parseFloat(title.attr("height"));
    }

    // Get names and their dimension
    let names = pieInfo.dataName;
    let nameSizes = names.map(function (n) {
        return helper.measureTextSize(n, "tracker-legend-label");
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
    if (pieInfo.legendOrientation === "vertical") {
        legendWidth = xSpacing * 3 + markerWidth + maxNameWidth;
        legendHeight = (numNames + 1) * ySpacing;
    } else if (pieInfo.legendOrientation === "horizontal") {
        legendWidth =
            (2 * xSpacing + markerWidth) * numNames +
            xSpacing +
            d3.sum(nameSizes, function (s, i) {
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
    if (pieInfo.legendPosition === "top") {
        // below title
        legendX = renderInfo.dataAreaSize.width / 2.0 - legendWidth / 2.0;
        legendY = titleHeight;
        // Expand svg
        helper.expandArea(svg, 0, legendHeight + ySpacing);
        // Move dataArea down
        helper.moveArea(dataArea, 0, legendHeight + ySpacing);
    } else if (pieInfo.legendPosition === "bottom") {
        // bellow x-axis label
        legendX = renderInfo.dataAreaSize.width / 2.0 - legendWidth / 2.0;
        legendY = titleHeight + renderInfo.dataAreaSize.height + ySpacing;
        // Expand svg
        helper.expandArea(svg, 0, legendHeight + ySpacing);
    } else if (pieInfo.legendPosition === "left") {
        legendX = 0;
        legendY =
            titleHeight +
            renderInfo.dataAreaSize.height / 2.0 -
            legendHeight / 2.0;
        // Expand svg
        helper.expandArea(svg, legendWidth + xSpacing, 0);
        // Move dataArea right
        helper.moveArea(dataArea, legendWidth + xSpacing, 0);
    } else if (pieInfo.legendPosition === "right") {
        legendX = renderInfo.dataAreaSize.width + xSpacing;
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
    if (pieInfo.legendBgColor) {
        legendBg.style("fill", pieInfo.legendBgColor);
    }
    if (pieInfo.legendBorderColor) {
        legendBg.style("stroke", pieInfo.legendBorderColor);
    }

    let markerRadius = 5.0;
    let firstMarkerX = xSpacing;
    let firstMarkerY = nameHeight;
    let firstLabelX = firstMarkerX + xSpacing + markerWidth; // xSpacing + 2 * xSpaing
    let firstLabelY = firstMarkerY;

    if (pieInfo.legendOrientation === "vertical") {
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
                return markerRadius;
            })
            .style("fill", function (name: string, i: number) {
                return pieInfo.dataColor[i];
            });

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
            .text(function (name: string, i: number) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        nameLabels.style("fill", function (name: string, i: number) {
            return pieInfo.dataColor[i];
        });
    } else if (pieInfo.legendOrientation === "horizontal") {
        let currRenderPosX = 0.0;
        let currRenderPosX2 = 0.0;

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
                return markerRadius;
            })
            .style("fill", function (name: string, i: number) {
                return pieInfo.dataColor[i];
            });

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
            .text(function (name: string, i: number) {
                return name;
            })
            .style("alignment-baseline", "middle")
            .attr("class", "tracker-legend-label");

        nameLabels.style("fill", function (name: string, i: number) {
            return pieInfo.dataColor[i];
        });
    }
}

function renderPie(
    canvas: HTMLElement,
    chartElements: ChartElements,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderPie");
    // console.log(renderInfo);
    let errorMessage = "";

    let radius = renderInfo.dataAreaSize.width * 0.5;
    let outterRadius = radius * 0.7;
    let innerRadius = outterRadius * pieInfo.ratioInnerRadius;

    // values
    let values: Array<number> = [];
    for (let strExpr of pieInfo.data) {
        let retValue = expr.resolveValue(strExpr, renderInfo);
        if (typeof retValue === "string") {
            errorMessage = retValue;
            break;
        } else if (typeof retValue === "number") {
            values.push(retValue);
        }
    }
    if (errorMessage !== "") {
        return errorMessage;
    }
    // console.log(values);

    // labels
    let labels: Array<string> = [];
    for (let strExpr of pieInfo.label) {
        let retLabel = expr.resolveTemplate(strExpr, renderInfo);
        // console.log(retLabel);
        if (retLabel.startsWith("Error")) {
            errorMessage = retLabel;
            break;
        }
        labels.push(retLabel);
    }
    if (errorMessage !== "") {
        return errorMessage;
    }
    // console.log(labels);

    // hideLabelLessThan
    let hideLabelLessThan = pieInfo.hideLabelLessThan;

    // label sizes
    let labelSizes = labels.map(function (n) {
        return helper.measureTextSize(n, "tracker-tick-label");
    });

    // extLabel
    let extLabels: Array<string> = [];
    for (let strExpr of pieInfo.extLabel) {
        let retExtLabel = expr.resolveTemplate(strExpr, renderInfo);
        if (retExtLabel.startsWith("Error")) {
            errorMessage = retExtLabel;
            break;
        }
        extLabels.push(retExtLabel);
    }
    if (errorMessage !== "") {
        return errorMessage;
    }
    // console.log(extLabels);

    // extLabel sizes
    let extLabelSizes = extLabels.map(function (n) {
        return helper.measureTextSize(n, "tracker-pie-label");
    });
    // console.log(extLabelSizes);

    let showExtLabelOnlyIfNoLabel = pieInfo.showExtLabelOnlyIfNoLabel;

    // scale
    let colorScale = d3.scaleOrdinal().range(pieInfo.dataColor);

    let sectorsGroup = chartElements.dataArea.append("g");
    sectorsGroup.attr("transform", function () {
        let strTranslate =
            "translate(" +
            renderInfo.dataAreaSize.width * 0.5 +
            "," +
            renderInfo.dataAreaSize.height * 0.5 +
            ")";

        return strTranslate;
    });

    let pie = d3.pie();
    let pieValues = pie(values);
    pieValues.forEach(function (value: any, i: number) {value.input_index = i})

    let sectors = sectorsGroup
        .selectAll("sector")
        .data(pieValues)
        .enter()
        .append("g")
        .attr("class", "sector");

    let arc = d3.arc().innerRadius(innerRadius).outerRadius(outterRadius);

    var hiddenArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    let sectorPaths = sectors
        .append("path")
        .attr("fill", function (d: any, i: number) {
            return colorScale(i.toString());
        })
        .attr("d", arc);

    function isLabelHidden(arcObj: any) {
        // console.log(`start/end: ${arcObj.startAngle}/${arcObj.endAngle}`);
        let fraction = (arcObj.endAngle - arcObj.startAngle) / (2.0 * Math.PI);
        if (fraction < hideLabelLessThan) {
            return true;
        }
        return false;
    }

    // label elements
    let labelElements = sectorsGroup
        .selectAll("label")
        .data(pie(values))
        .enter()
        .append("text")
        .text(function (arcObj: any, i: number) {
            if (isLabelHidden(arcObj)) {
                return "";
            }
            return labels[i];
        })
        .attr("transform", function (d: any) {
            return (
                "translate(" +
                arc.centroid(d)[0] +
                "," +
                arc.centroid(d)[1] +
                ")"
            );
        })
        .style("text-anchor", "middle")
        .attr("class", "tracker-pie-label");

    function getMidAngle(arcObj: any) {
        return arcObj.startAngle + (arcObj.endAngle - arcObj.startAngle) / 2;
    }

    function externalLabelText(arcObj: any, i: number) {
        if (showExtLabelOnlyIfNoLabel) {
            if (labels[i] === "" || isLabelHidden(arcObj)) {
                return extLabels[i];
            }
            return "";
        } else {
            return extLabels[i];
        }
    }

    // external label elements
    let prevBB : DOMRect = null;
    let extlabelPos : any = {};
    let extLabelElements = sectorsGroup
        .selectAll("extLabel")
        .data(pieValues)
        .enter()
        .append("text")
        // Sort external labels based on y value such that we can move down overlapping labels
        .sort(function (arcObj1: any, arcObj2: any) {
            return Math.cos(getMidAngle(arcObj2)) - Math.cos(getMidAngle(arcObj1));
        })
        .text(function (arcObj: any, i: number) {
            i = arcObj.input_index;
            return externalLabelText(arcObj, i)
        })
        .attr("transform", function (arcObj: any, i: number) {
            i = arcObj.input_index;
            // If external label is empty, directly return.
            if (externalLabelText(arcObj, i).length == 0) {
                return;
            }
            let posLabel = hiddenArc.centroid(arcObj);
            let midAngle = getMidAngle(arcObj);

            posLabel[0] =
                (radius * 0.99 - extLabelSizes[i].width) *
                (midAngle < Math.PI ? 1 : -1);
            
            var yshift = 0;
            let thisBB = new DOMRect(posLabel[0], posLabel[1], extLabelSizes[i].width, extLabelSizes[i].height);
            
            if (prevBB !== null) {
                // Check whether there are overlaps
                if (!(thisBB.right < prevBB.left || prevBB.right < thisBB.left
                    || prevBB.bottom < thisBB.top)) {
                    // Since y is sorted from low to high, we expect to shift this item further down
                    yshift = prevBB.bottom - thisBB.top;
                    // console.log("has overlap", yshift);
                }
            }
            if (yshift != 0) {
                thisBB = new DOMRect(posLabel[0], posLabel[1] + yshift, extLabelSizes[i].width, extLabelSizes[i].height);
            }
            prevBB = thisBB;
            // Save external label position for connection line plotting
            extlabelPos[i] = [posLabel[0], posLabel[1] + yshift]
            return "translate(" + posLabel[0] + "," + (posLabel[1] + yshift) + ")";
        })
        .style("text-anchor", function (arcObj: any) {
            let midAngle = getMidAngle(arcObj);
            return midAngle < Math.PI ? "start" : "end";
        })
        .attr("class", "tracker-pie-label");
    

    function getPointsForConnectionLines(arcObj: any, i: number) {
        let labelWidth = labelSizes[i].width;
        let extLabelWidth = extLabelSizes[i].width;
        let labelHidden = isLabelHidden(arcObj);
        let midAngle = getMidAngle(arcObj);

        let posLabel = arc.centroid(arcObj); // line insertion in the slice
        let posMiddle = hiddenArc.centroid(arcObj); // line break: we use the other arc generator that has been built only for that
        let posExtLabel = extlabelPos[i] || hiddenArc.centroid(arcObj); // Label position = almost the same as posB
        posMiddle[1] = posExtLabel[1];
        // console.log(labels[i]);
        // console.log(`label/middle/extLabel: ${posLabel}/${posMiddle}/${posExtLabel}`);

        let distMiddleToLabel = Math.sqrt(
            (posMiddle[0] - posLabel[0]) ** 2 +
                (posMiddle[1] - posLabel[1]) ** 2
        );

        if (labels[i] !== "" && !labelHidden) {
            // shift posLabel, toward the middle point
            posLabel[0] =
                posLabel[0] +
                ((posMiddle[0] - posLabel[0]) * labelWidth) / distMiddleToLabel;
            posLabel[1] =
                posLabel[1] +
                ((posMiddle[1] - posLabel[1]) * labelWidth) / distMiddleToLabel;

            // shift posExtLabel
            posExtLabel[0] =posExtLabel[0] + (- 3) *
                (midAngle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        }

        distMiddleToLabel = Math.sqrt(
            (posMiddle[0] - posLabel[0]) ** 2 +
                (posMiddle[1] - posLabel[1]) ** 2
        );

        let distExtLabelToLabel = Math.sqrt(
            (posExtLabel[0] - posLabel[0]) ** 2 +
                (posExtLabel[1] - posLabel[1]) ** 2
        );

        if (distMiddleToLabel > distExtLabelToLabel) {
            // console.log("two points");
            return [posLabel, posExtLabel];
        }
        return [posLabel, posMiddle, posExtLabel];
    }

    // Add lines between sectors and external labels
    let lines = sectorsGroup
        .selectAll("line")
        .data(pieValues)
        .enter()
        .append("polyline")
        .attr("stroke", "black")
        .style("fill", "none")
        .attr("stroke-width", 1)
        .attr("points", function (arcObj: any, i: number) {
            if (showExtLabelOnlyIfNoLabel) {
                if (labels[i] === "" || isLabelHidden(arcObj)) {
                    if (extLabels[i] !== "") {
                        return getPointsForConnectionLines(arcObj, i);
                    }
                }
            } else {
                if (extLabels[i] !== "") {
                    return getPointsForConnectionLines(arcObj, i);
                }
            }
        })
        .attr("class", "tracker-axis");
}

export function renderPieChart(
    canvas: HTMLElement,
    renderInfo: RenderInfo,
    pieInfo: PieInfo
) {
    // console.log("renderPieChart");
    // console.log(renderInfo);
    if (!renderInfo || !pieInfo) return;

    // return "Under construction";

    let chartElements: ChartElements = {};
    chartElements = createAreas(chartElements, canvas, renderInfo, pieInfo);

    // Set default dataColor if no dataColor provided
    let defaultDataColor = d3.schemeSpectral[pieInfo.dataColor.length];
    for (let i = 0; i < pieInfo.dataColor.length; i++) {
        if (pieInfo.dataColor[i] === null) {
            pieInfo.dataColor[i] = defaultDataColor[i];
        }
    }

    renderTitle(canvas, chartElements, renderInfo, pieInfo);

    renderPie(canvas, chartElements, renderInfo, pieInfo);

    if (pieInfo.showLegend) {
        renderLegend(canvas, chartElements, renderInfo, pieInfo);
    }

    setChartScale(canvas, chartElements, renderInfo);
}
