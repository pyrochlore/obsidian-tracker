import * as d3 from 'd3';
import moment from 'moment';

export class DataPoint {
	date: moment.Moment;
	value: number | null;
}

class DataInfo {
    min: number | null;
    max: number | null;
    sum: number | null;
    count: number;
    maxStreak: number;
    maxBreak: number;

    constructor () {
        this.min = null;
        this.max = null;
        this.sum = null;
        this.count = 0;
        this.maxStreak = 0;
        this.maxBreak = 0;
    }
}

export class GraphInfo {
	// Input
	searchType: string;
	searchTarget: string;
	folder: string;
	dateFormat: string;
	startDate: moment.Moment;
	endDate: moment.Moment;
	constValue: number;
	ignoreAttchedValue: boolean;
	accum: boolean;
	penalty: number;

    output: string;
	line: LineInfo | null;
    text: TextInfo | null;

	// Inner data
	data: DataPoint[];
    dataInfo: DataInfo;

	constructor (searchType: string, searchTarget: string) {
		this.searchType = searchType;
		this.searchTarget = searchTarget;
		this.folder = "";
		this.dateFormat = "";
		this.startDate = moment("");
		this.endDate = moment("");
		this.constValue = 1.0;
		this.ignoreAttchedValue = false;
		this.accum = false;
		this.penalty = 0.0;

        this.output = "";
		this.line = new LineInfo();
        this.text = null;

		this.data = [];
        this.dataInfo = new DataInfo();
	}
}

export class LineInfo {
	title: string;
	xAxisLabel: string;
	yAxisLabel: string;
	labelColor: string;
	yAxisUnit: string;
	yMin: number | null;
	yMax: number | null;
	axisColor: string;
	lineColor: string;
	lineWidth: number;
	showLine: boolean;
	showPoint: boolean;
	pointColor: string;
	pointBorderColor: string;
	pointBorderWidth: number;
	pointSize: number;
	allowInspectData: boolean;
	fillGap: boolean;

	constructor () {
		this.title = "";
		this.xAxisLabel = "Date";
		this.yAxisLabel = "Value";
		this.labelColor = "";
		this.yAxisUnit = "";
		this.yMin = null;
		this.yMax = null;
		this.axisColor = "";
		this.lineColor = "";
		this.lineWidth = 1.5;
		this.showLine = true;
		this.showPoint = true;
		this.pointColor = "#69b3a2";
		this.pointBorderColor = "#69b3a2";
		this.pointBorderWidth = 0.0;
		this.pointSize = 3.0;
		this.allowInspectData = true;
		this.fillGap = false;
	}
}

export class TextInfo {
    template: string;
    style: string;

    constructor () {
        this.template = "";
        this.style = "";
    }
}

function getTickInterval(days: number) {

    let tickInterval;

    if (days <= 15) {// number of ticks: 0-15
        tickInterval = d3.timeDay;
    }
    else if (days <= 4 * 15) {// number of ticks: 4-15
        tickInterval = d3.timeDay.every(4);
    }
    else if (days <= 7 * 15) {// number of ticks: 8-15
        tickInterval = d3.timeWeek;
    }
    else if (days <= 15 * 30) {// number of ticks: 4-15
        tickInterval = d3.timeMonth;
    }
    else if (days <= 15 * 60) {// number of ticks: 8-15
        tickInterval = d3.timeMonth.every(2);
    }
    else {
        tickInterval = d3.timeYear;
    }

    return tickInterval;
}

function getTickFormat(days: number) {

    let tickFormat;

    if (days <= 15) {// number of ticks: 0-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    }
    else if (days <= 4 * 15) {// number of ticks: 4-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    }
    else if (days <= 7 * 15) {// number of ticks: 8-15
        tickFormat = d3.timeFormat("%y-%m-%d");
    }
    else if (days <= 15 * 30) {// number of ticks: 4-15
        tickFormat = d3.timeFormat("%y %b");
    }
    else if (days <= 15 * 60) {// number of ticks: 8-15
        tickFormat = d3.timeFormat("%y %b");
    }
    else {
        tickFormat = d3.timeFormat("%Y");
    }

    return tickFormat;
}

export function renderLine(canvas: HTMLElement, graphInfo: GraphInfo) {
    // console.log("renderLine");

    // Data preprocessing
    let tagMeasureAccum = 0.0;
    for (let dataPoint of graphInfo.data) {
        if (graphInfo.penalty !== 0.0) {
            if (dataPoint.value === null) {
                dataPoint.value = graphInfo.penalty;
            }
        }
        if (graphInfo.accum) {
            if (dataPoint.value !== null) {
                tagMeasureAccum += dataPoint.value;
                dataPoint.value = tagMeasureAccum;
            }
        }
    }
    
    // Draw line chart
    let margin = {top: 10, right: 30, bottom: 70, left: 70};
    let width = 460 - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;
    let tooltipSize = { width: 90, height: 45};

    if (graphInfo.line.title) {
        margin.top += 20;
    }

    let svg = d3.select(canvas).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    let graphArea = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add graph title
    if (graphInfo.line.title) {
        graphArea.append("text")
            .text(graphInfo.line.title)
            .attr("transform", "translate(" + width/2 + "," + margin.top/4 + ")")
            .attr("class", "tracker-title");
    }

    // Add X axis
    let xDomain = d3.extent(graphInfo.data, function(p) { return p.date; });
    let xScale = d3.scaleTime()
        .domain(xDomain)
        .range([ 0, width ]);

    let tickInterval = getTickInterval(graphInfo.data.length);
    let tickFormat = getTickFormat(graphInfo.data.length);

    let xAxisGen = d3.axisBottom(xScale).ticks(tickInterval).tickFormat(tickFormat);
    let xAxis = graphArea.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisGen)
        .attr("class", "tracker-axis");
    if (graphInfo.line.axisColor) {
        xAxis.style("stroke", graphInfo.line.axisColor);
    }

    let xAxisTickLabels = xAxis.selectAll("text")
        .attr("x", -9)
        .attr("y", 0)
        .attr("transform", "rotate(-65)")
        .style("text-anchor", "end")
        .attr("class", "tracker-tick-label");
    if (graphInfo.line.labelColor) {
        xAxisTickLabels.style("fill", graphInfo.line.labelColor);
    }

    let xAxisLabel = xAxis.append("text")
        .text(graphInfo.line.xAxisLabel)
        .attr("transform", "translate(" + (width / 2) + " ," + margin.bottom + ")")
        .attr("class", "tracker-axis-label");
    if (graphInfo.line.labelColor) {
        xAxisLabel.style("fill", graphInfo.line.labelColor);
    }

    // Add Y axis
    let yMin = graphInfo.line.yMin;
    if (typeof yMin !== "number") {
        yMin = d3.min(graphInfo.data, function(p) { return p.value; });
    }
    let yMax = graphInfo.line.yMax;
    if (typeof yMax !== "number") {
        yMax = d3.max(graphInfo.data, function(p) { return p.value; });
    }
    if (yMax < yMin) {
        let yTmp = yMin;
        yMin = yMax;
        yMax = yTmp;
    }
    let yExtent = yMax - yMin;

    let yScale = d3.scaleLinear();
    if ((yMin >= 0 && yMin > yMax * 0.8) || (yMin >= 0 && graphInfo.accum)) {
        yScale.domain([0, yMax * 1.2]).range([ height, 0 ]);
    }
    else {
        yScale.domain([yMin - yExtent * 0.2, yMax + yExtent * 0.2]).range([ height, 0 ]);
    }

    let yAxisGen = d3.axisLeft(yScale);
    let yAxis = graphArea.append("g")
        .call(yAxisGen)
        .attr("class", "tracker-axis");
    if (graphInfo.line.axisColor) {
        yAxis.style("stroke", graphInfo.line.axisColor);
    }

    let yAxisTickLabels = yAxis.selectAll("text")
        .attr("class", "tracker-tick-label");
    if (graphInfo.line.labelColor) {
        yAxisTickLabels.style("fill", graphInfo.line.labelColor);
    }

    let yAxisLabelText = graphInfo.line.yAxisLabel;
    if (graphInfo.line.yAxisUnit) {
        yAxisLabelText += " (" + graphInfo.line.yAxisUnit + ")";
    }
    let yAxisLabel = yAxis.append("text")
        .text(yAxisLabelText)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left / 2))
        .attr("x", 0 - (height / 2))
        .attr("class", "tracker-axis-label");	
    if (graphInfo.line.labelColor) {
        yAxisLabel.style("fill", graphInfo.line.labelColor);
    }
    
    let dataArea = graphArea.append("g");

    // Add line
    if (graphInfo.line.showLine) {
        let lineGen = d3.line<DataPoint>()
            .defined(function(p) { return p.value !== null; })
            .x(function(p) { return xScale(p.date); })
            .y(function(p) { return yScale(p.value); });

        let line = dataArea.append("path")
            .attr("class", "tracker-line")
            .style("stroke-width", graphInfo.line.lineWidth);
            
        if (graphInfo.line.fillGap) {
            line.datum(graphInfo.data.filter(function (p) {
                return p.value !== null;
            })).attr("d", lineGen as any);
        }
        else {
            line.datum(graphInfo.data).attr("d", lineGen as any);
        }
        
        if (graphInfo.line.lineColor) {
            line.style("stroke", graphInfo.line.lineColor);
        }
    }

    // Add dots
    if (graphInfo.line.showPoint) {
        let dots = dataArea.selectAll("dot")
            .data(graphInfo.data.filter(function(p) { return p.value != null; }))
            .enter().append("circle")
            .attr("r", graphInfo.line.pointSize)
            .attr("cx", function(p) { return xScale(p.date); })
            .attr("cy", function(p) { return yScale(p.value); })
            .attr("date", function(p) { return d3.timeFormat("%y-%m-%d")(p.date as any); })
            .attr("value", function(p) { return p.value.toFixed(2); })
            .attr("class", "tracker-dot");
        if (graphInfo.line.pointColor) {
            dots.style("fill", graphInfo.line.pointColor);

            if (graphInfo.line.pointBorderColor && graphInfo.line.pointBorderWidth > 0.0) {
                dots.style("stroke", graphInfo.line.pointBorderColor);
                dots.style("stroke-width", graphInfo.line.pointBorderWidth);
            }
        }

        if (graphInfo.line.allowInspectData) {
            let tooltip = svg.append("g").style("opacity", 0);
            let tooltipBg = tooltip.append("rect")
                .attr("width", tooltipSize.width)
                .attr("height", tooltipSize.height)
                .attr("class", "tracker-tooltip");
            let tooltipLabel = tooltip.append("text")
                .attr("width", tooltipSize.width)
                .attr("height", tooltipSize.height)
                .attr("class", "tracker-tooltip-label");
            let tooltipLabelDate = tooltipLabel.append("tspan")
                .attr("x", 4)
                .attr("y", tooltipSize.height/5 * 2);
            let tooltipLabelValue = tooltipLabel.append("tspan")
                .attr("x", 4)
                .attr("y", tooltipSize.height/5 * 4);

            dots
                .on("mouseenter", function(event) {
                    tooltipLabelDate.text("date:" + d3.select(this).attr("date"));
                    tooltipLabelValue.text("value:" + d3.select(this).attr("value"));

                    const [x, y] = d3.pointer(event);
                    if (x < width/2) {
                        tooltip.attr('transform', "translate(" + (x + tooltipSize.width * 1.3) + "," + (y - tooltipSize.height * 1.0) + ")");
                    }
                    else {
                        tooltip.attr('transform', "translate(" + (x - tooltipSize.width * 0.0) + "," + (y - tooltipSize.height * 1.0) + ")");
                    }
                    

                    tooltip.transition().duration(200).style("opacity", 1);
                })
                .on("mouseleave", function() {
                    tooltip.transition().duration(500).style("opacity", 0);
                });
        }
    }
}

function checkTextTemplateValid(textTemplate: string): boolean {
    return true;
}

let fnSet = {
    "{{min}}": function(graphInfo: GraphInfo) {
        return graphInfo.dataInfo.min;
    },
    "{{max}}": function(graphInfo: GraphInfo) {
        return graphInfo.dataInfo.max;
    },
    "{{sum}}": function(graphInfo: GraphInfo) {
        return graphInfo.dataInfo.sum;
    },
    "{{count}}": function(graphInfo: GraphInfo) {
        return graphInfo.dataInfo.count;
    },
    "{{days}}": function(graphInfo: GraphInfo) {
        let result = graphInfo.data.length;
        return result;
    },
    "{{maxStreak}}": function(graphInfo: GraphInfo) {
        graphInfo.dataInfo.maxStreak;
    },
    "{{maxBreak}}": function(graphInfo: GraphInfo) {
        return graphInfo.dataInfo.maxBreak;
    },
    "{{average}}": function(graphInfo: GraphInfo) {
        let avg = 0.0;
        if (graphInfo.data.length !== 0) {
            avg = graphInfo.dataInfo.sum / graphInfo.data.length;
        } 
        return avg;
    },
    "{{median}}": function(graphInfo: GraphInfo) {
        let result = d3.median(
            graphInfo.data,
            function(p) { 
                return (p.value || 0.0) });
        return result;
    },
    "{{variance}}": function(graphInfo: GraphInfo) {
        let result = d3.variance(
            graphInfo.data,
            function(p) { 
                return (p.value || 0.0) });
        return result;
    }
}

export function renderText(canvas: HTMLElement, graphInfo: GraphInfo) {
    // console.log("renderText");

    // Notice graphInfo.text may be null
    if (graphInfo.text === null) {
        return "No defined 'text' key in YAML";
    }
    
    let outputText = "";
    if (checkTextTemplateValid(graphInfo.text.template)) {
        outputText = graphInfo.text.template;
    }
    else {
        return "Invalid text template";
    }

    // Loop over fnSet
    Object.entries(fnSet).forEach(
        ([strRegex, fn]) => {
            let regex = new RegExp(strRegex, "gm");
            if (regex.test(outputText)) {
                // console.log("Found " + strRegex + " in text template")
                let result = fn(graphInfo);
                if (result) {
                    outputText = outputText.replace(regex, result.toString());
                }
            }
        }
    );

    if (outputText !== "") {
        let textBlock = d3.select(canvas).append("div");
        textBlock.text(outputText);
        
        if (graphInfo.text.style !== "") {
            textBlock.attr("style", graphInfo.text.style);
        }
    }
}