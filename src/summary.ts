import * as d3 from "d3";
import { RenderInfo } from "./data";
import * as expr from "./expr";

function checkSummaryTemplateValid(summaryTemplate: string): boolean {
    return true;
}

export function renderSummary(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderSummary");
    // console.log(renderInfo);
    if (renderInfo.summary === null) return;

    let outputSummary = "";
    if (checkSummaryTemplateValid(renderInfo.summary.template)) {
        outputSummary = renderInfo.summary.template;
    } else {
        return "Invalid summary template";
    }

    outputSummary = expr.resolveTemplate(outputSummary, renderInfo);
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
