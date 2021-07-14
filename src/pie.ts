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
    OutputType,
    ValueType,
} from "./data";
import * as helper from "./helper";
import * as d3 from "d3";
import * as expr from "./expr";

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
    let outterRadius = radius * 0.8;
    let innerRadius = outterRadius * pieInfo.ratioInnerRadius;

    // values
    let values: Array<number> = [];
    for (let strExpr of pieInfo.data) {
        let retValue = expr.resolveValue(strExpr, renderInfo);
        if (typeof retValue === "string") {
            errorMessage = retValue;
            break;
        }
        values.push(retValue);
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

    // label elements
    let labelElements = sectorsGroup
        .selectAll("label")
        .data(pie(values))
        .enter()
        .append("text")
        .text(function (d: any, i: number) {
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
        .attr("class", "tracker-tick-label");

    function getMidAngle(arcObj: any) {
        return arcObj.startAngle + (arcObj.endAngle - arcObj.startAngle) / 2;
    }

    // external label elements
    let extLabelElements = sectorsGroup
        .selectAll("extLabel")
        .data(pieValues)
        .enter()
        .append("text")
        .text(function (d: any, i: number) {
            return extLabels[i];
        })
        .attr("transform", function (arcObj: any, i: number) {
            let posLabel = hiddenArc.centroid(arcObj);
            let midAngle = getMidAngle(arcObj);
            posLabel[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
            return "translate(" + posLabel[0] + "," + posLabel[1] + ")";
        })
        .style("text-anchor", function (arcObj: any) {
            let midAngle = getMidAngle(arcObj);
            return midAngle < Math.PI ? "start" : "end";
        })
        .attr("class", "tracker-tick-label");

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
            //PieArcDatum
            if (extLabels[i] !== "") {
                let posLabel = arc.centroid(arcObj); // line insertion in the slice
                let posMiddle = hiddenArc.centroid(arcObj); // line break: we use the other arc generator that has been built only for that
                let posExtLabel = hiddenArc.centroid(arcObj); // Label position = almost the same as posB
                let midAngle = getMidAngle(arcObj);
                posExtLabel[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posLabel, posMiddle, posExtLabel];
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

    renderTitle(canvas, chartElements, renderInfo, pieInfo);

    renderPie(canvas, chartElements, renderInfo, pieInfo);
}
