import { CachedMetadata, TFile, normalizePath } from "obsidian";
import {
    DataMap,
    Query,
    RenderInfo,
    XValueMap,
    QueryValuePair,
    TableData,
    SearchType,
    ValueType,
} from "./data";
import * as helper from "./helper";

let timeFormat = [
    "HH:mm",
    "HH:m",
    "H:mm",
    "H:m",
    "hh:mm A",
    "hh:mm a",
    "hh:m A",
    "hh:m a",
    "h:mm A",
    "h:mm a",
    "h:m A",
    "h:m a",
];

function addToDataMap(
    dataMap: DataMap,
    date: string,
    query: Query,
    value: number | null
) {
    if (!dataMap.has(date)) {
        let queryValuePairs = new Array<QueryValuePair>();
        queryValuePairs.push({ query: query, value: value });
        dataMap.set(date, queryValuePairs);
    } else {
        let targetValuePairs = dataMap.get(date);
        targetValuePairs.push({ query: query, value: value });
    }
}

export function collectDataFromFrontmatterTag(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    // console.log("collectDataFromFrontmatterTag");
    // console.log(query);
    // console.log(dataMap);
    // console.log(xValueMap);
    let frontMatter = fileCache.frontmatter;
    let frontMatterTags: string[] = [];
    if (frontMatter && frontMatter.tags) {
        // console.log(frontMatter.tags);
        let tagMeasure = 0.0;
        let tagExist = false;
        if (Array.isArray(frontMatter.tags)) {
            frontMatterTags = frontMatterTags.concat(frontMatter.tags);
        } else {
            frontMatterTags.push(frontMatter.tags);
        }

        for (let tag of frontMatterTags) {
            if (tag === query.getTarget()) {
                // simple tag
                tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
                tagExist = true;
            } else if (tag.startsWith(query.getTarget() + "/")) {
                // nested tag
                tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
                tagExist = true;
            } else {
                continue;
            }

            // valued-tag in frontmatter is not supported
            // because the "tag:value" in frontmatter will be consider as a new tag for different values

            let value = null;
            if (tagExist) {
                value = tagMeasure;
            }
            addToDataMap(dataMap, xValueMap.get(-1), query, value);
        }
    }
}

export function collectDataFromFrontmatterKey(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    let frontMatter = fileCache.frontmatter;
    if (frontMatter) {
        if (frontMatter[query.getTarget()]) {
            // console.log("single value");
            // console.log(frontMatter[query.getTarget()]);
            let value = null;
            let toParse = frontMatter[query.getTarget()];
            if (typeof toParse === "string") {
                if (toParse.includes(":")) {
                    // time value
                    let timeValue = window.moment(toParse, timeFormat, true);
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        value = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                    }
                } else {
                    value = parseFloat(toParse);
                }
            } else {
                value = parseFloat(toParse);
            }
            if (Number.isNumber(value)) {
                addToDataMap(dataMap, xValueMap.get(-1), query, value);
            }
        } else if (
            query.getParentTarget() &&
            frontMatter[query.getParentTarget()]
        ) {
            // console.log("multiple values");
            // console.log(query.getTarget());
            // console.log(query.getParentTarget());
            // console.log(query.getSubId());
            // console.log(
            //     frontMatter[query.getParentTarget()]
            // );
            let toParse = frontMatter[query.getParentTarget()];
            let splitted = null;
            if (Array.isArray(toParse)) {
                splitted = toParse.map((p) => {
                    return p.toString();
                });
            } else if (typeof toParse === "string") {
                splitted = toParse.split(query.getSeparator());
            }
            if (
                splitted &&
                splitted.length > query.getAccessor() &&
                query.getAccessor() >= 0
            ) {
                // TODO: it's not efficent to retrieve one value at a time, enhance this
                let value = null;
                let splittedPart = splitted[query.getAccessor()].trim();
                if (toParse.includes(":")) {
                    // time value
                    let timeValue = window.moment(
                        splittedPart,
                        timeFormat,
                        true
                    );
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        value = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                    }
                } else {
                    value = parseFloat(splittedPart);
                }

                if (Number.isNumber(value)) {
                    addToDataMap(dataMap, xValueMap.get(-1), query, value);
                }
            }
        }
    }
}

export function collectDataFromWiki(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    let links = fileCache.links;

    let linkMeasure = 0.0;
    let linkExist = false;
    for (let link of links) {
        if (link.link === query.getTarget()) {
            linkExist = true;
            linkMeasure = linkMeasure + renderInfo.constValue[query.getId()];
        }
    }

    let linkValue = null;
    if (linkExist) {
        linkValue = linkMeasure;
    }
    addToDataMap(dataMap, xValueMap.get(-1), query, linkValue);
}

export function collectDataFromInlineTag(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    // console.log(content);
    // Test this in Regex101
    // (^|\s)#tagName(\/[\w-]+)*(:(?<values>[\d\.\/-]*)[a-zA-Z]*)?([\\.!,\\?;~-]*)?(\s|$)
    let tagName = query.getTarget();
    if (query.getParentTarget()) {
        tagName = query.getParentTarget(); // use parent tag name for multiple values
    }
    let strHashtagRegex =
        "(^|\\s)#" +
        tagName +
        "(\\/[\\w-]+)*(:(?<values>[\\d\\.\\/-]*)[a-zA-Z]*)?([\\.!,\\?;~-]*)?(\\s|$)";
    // console.log(strHashtagRegex);
    let hashTagRegex = new RegExp(strHashtagRegex, "gm");
    let match;
    let tagMeasure = 0.0;
    let tagExist = false;
    while ((match = hashTagRegex.exec(content))) {
        // console.log(match);
        if (
            !renderInfo.ignoreAttachedValue[query.getId()] &&
            typeof match.groups !== "undefined" &&
            typeof match.groups.values !== "undefined"
        ) {
            // console.log("value-attached tag");
            let values = match.groups.values;
            let splitted = values.split(query.getSeparator());
            if (!splitted) continue;
            if (splitted.length === 1) {
                // console.log("single-value");
                let toParse = splitted[0].trim();
                if (toParse.includes(":")) {
                    let timeValue = window.moment(toParse, timeFormat, true);
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        tagMeasure = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                        tagExist = true;
                    }
                } else {
                    let value = parseFloat(toParse);
                    // console.log(value);
                    if (!Number.isNaN(value)) {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            value !== 0
                        ) {
                            tagMeasure += value;
                            tagExist = true;
                        }
                    }
                }
            } else if (
                splitted.length > query.getAccessor() &&
                query.getAccessor() >= 0
            ) {
                // TODO: it's not efficent to retrieve one value at a time, enhance this
                // console.log("multiple-values");
                let toParse = splitted[query.getAccessor()].trim();
                if (toParse.includes(":")) {
                    let timeValue = window.moment(toParse, timeFormat, true);
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        tagMeasure = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                        tagExist = true;
                    }
                } else {
                    let value = parseFloat(toParse);
                    if (Number.isNumber(value)) {
                        tagMeasure += value;
                        tagExist = true;
                    }
                }
            }
        } else {
            // console.log("simple-tag");
            tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
            tagExist = true;
        }
    }

    let value = null;
    if (tagExist) {
        value = tagMeasure;
    }
    addToDataMap(dataMap, xValueMap.get(-1), query, value);
}

export function collectDataFromText(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    let strTextRegex = query.getTarget();
    // console.log(strTextRegex);
    let textRegex = new RegExp(strTextRegex, "gm");
    let match;
    let textMeasure = 0.0;
    let textExist = false;
    while ((match = textRegex.exec(content))) {
        // console.log(match);
        if (
            !renderInfo.ignoreAttachedValue[query.getId()] &&
            typeof match.groups !== "undefined"
        ) {
            // match[0] whole match
            // console.log("valued-text");
            if (typeof match.groups.value !== "undefined") {
                // set as null for missing value if it is valued-tag
                let value = parseFloat(match.groups.value);
                // console.log(value);
                if (!Number.isNaN(value)) {
                    if (
                        !renderInfo.ignoreZeroValue[query.getId()] ||
                        value !== 0
                    ) {
                        textMeasure += value;
                        textExist = true;
                    }
                }
            }
        } else {
            // console.log("simple-text");
            textMeasure = textMeasure + renderInfo.constValue[query.getId()];
            textExist = true;
        }
    }

    if (textExist) {
        addToDataMap(dataMap, xValueMap.get(-1), query, textMeasure);
    }
}

export function collectDataFromDvField(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
) {
    let dvTarget = query.getTarget();
    if (query.getParentTarget()) {
        dvTarget = query.getParentTarget(); // use parent tag name for multiple values
    }
    // Test this in Regex101
    // (^|\s)\*{0,2}dvTarget\*{0,2}(::\s*(?<values>[\d\.\/\-\w,@;\s]*))(\s|$)
    let strHashtagRegex =
        "(^|\\s)\\*{0,2}" +
        dvTarget +
        "\\*{0,2}(::\\s*(?<values>[\\d\\.\\/\\-\\w,@;\\s]*))(\\s|$)";
    // console.log(strHashtagRegex);
    let hashTagRegex = new RegExp(strHashtagRegex, "gm");
    let match;
    let tagMeasure = 0.0;
    let tagExist = false;
    while ((match = hashTagRegex.exec(content))) {
        // console.log(match);
        if (
            typeof match.groups !== "undefined" &&
            typeof match.groups.values !== "undefined"
        ) {
            let values = match.groups.values.trim();
            // console.log(values);
            // console.log(query.getSeparator());
            let splitted = values.split(query.getSeparator());
            // console.log(splitted);
            if (!splitted) continue;
            if (splitted.length === 1) {
                // console.log("single-value");
                let toParse = splitted[0];
                if (toParse.includes(":")) {
                    let timeValue = window.moment(toParse, timeFormat, true);
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        tagMeasure = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                        tagExist = true;
                    }
                } else {
                    let value = parseFloat(toParse);
                    // console.log(value);
                    if (!Number.isNaN(value)) {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            value !== 0
                        ) {
                            tagMeasure += value;
                            tagExist = true;
                        }
                    }
                }
            } else if (
                splitted.length > query.getAccessor() &&
                query.getAccessor() >= 0
            ) {
                // TODO: it's not efficent to retrieve one value at a time, enhance this
                // console.log("multiple-values");
                let toParse = splitted[query.getAccessor()].trim();
                if (toParse.includes(":")) {
                    let timeValue = window.moment(toParse, timeFormat, true);
                    if (timeValue.isValid()) {
                        query.valueType = ValueType.Time;
                        tagMeasure = timeValue.diff(
                            window.moment("00:00", "HH:mm", true),
                            "seconds"
                        );
                        tagExist = true;
                    }
                } else {
                    let value = parseFloat(toParse);
                    if (Number.isNumber(value)) {
                        tagMeasure += value;
                        tagExist = true;
                    }
                }
            }
        } else {
            // console.log("simple-tag");
            tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
            tagExist = true;
        }
    }

    let value = null;
    if (tagExist) {
        value = tagMeasure;
    }
    addToDataMap(dataMap, xValueMap.get(-1), query, value);
}
