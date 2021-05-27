import {
    Datasets,
    DataPoint,
    RenderInfo,
    Dataset,
    Size,
    Transform,
    ChartElements,
    OutputType,
    ValueType,
} from "./data";

function renderTitle() {
    // title
}

function renderBackPanel() {
    // quantitative range, poor/average/good/...
    //
}

function renderBarAndMark() {
    // bar for actual value
    // mark line for target value
}

function renderAxis() {
    // ticks
    // tick labels
    // unit
}

// Bullet graph https://en.wikipedia.org/wiki/Bullet_graph
export function renderBullet(canvas: HTMLElement, renderInfo: RenderInfo) {
    // console.log("renderBullet");
    // console.log(renderInfo);
    // if (renderInfo.bullet === null) return;

    // let chartElements = createAreas(canvas, renderInfo);

    renderTitle();

    renderBackPanel();

    renderBarAndMark();

    renderAxis();
}
