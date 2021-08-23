import * as d3 from "d3";
import { RenderInfo, SummaryInfo } from "./data";
import * as expr from "./expr";

function checkSummaryTemplateValid(summaryTemplate: string): boolean {
    return true;
}

export function renderSummary(
    svgCanvas: any,
    renderInfo: RenderInfo,
    summaryInfo: SummaryInfo
) {
    // console.log("renderSummary");
    // console.log(renderInfo);
    if (!renderInfo || !summaryInfo) return;

    // console.log(summaryInfo.template);
    let outputSummary = "";
    if (checkSummaryTemplateValid(summaryInfo.template)) {
        outputSummary = summaryInfo.template;
    } else {
        return "Invalid summary template";
    }

    let retResolvedTemplate = expr.resolveTemplate(outputSummary, renderInfo);
    // console.log(retResolvedTemplate);
    if (retResolvedTemplate.startsWith("Error:")) {
        return retResolvedTemplate;
    }
    outputSummary = retResolvedTemplate;

    if (outputSummary !== "") {
        let svg = svgCanvas
            .append("svg")
            .attr("id", "svg")
            .attr("width", 200)
            .attr("height", 200);

        let textBlock = svg.append("text")
            .attr("x", 0)
            .attr("y", 0);
        if (outputSummary.includes("\n") || outputSummary.includes("\\n")) {
            let outputLines = outputSummary.split(/(\n|\\n)/);
            // console.log(outputLines);
            for (let outputLine of outputLines) {
                if (outputLine !== "\n" && outputLine !== "\\n") {
                    let line = textBlock.append("tspan").text(outputLine);
                    line.attr("x", 0)
                        .attr("dy", "1.5em")
                        .attr("class", "tracker-summary-text");
                    
                    if (summaryInfo.style !== "") {
                        line.attr("style", summaryInfo.style);
                    }
                }
            }
        } else {
            let line = textBlock.text(outputSummary);
            line.attr("x", 0)
                .attr("dy", "1.5em")
                .attr("class", "tracker-summary-text");

            if (summaryInfo.style !== "") {
                line.attr("style", summaryInfo.style);
            }
        }
        

    }
}
