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
import { Moment } from "moment";

export function getDateFromFilename(
    file: TFile,
    renderInfo: RenderInfo
): Moment {
    // console.log(`getDateFromFilename: ${file.name}`);
    let fileBaseName = file.basename;

    let dateString = helper.getDateStringFromInputString(
        fileBaseName,
        renderInfo.dateFormatPrefix,
        renderInfo.dateFormatSuffix
    );
    // console.log(dateString);

    let fileDate = helper.strToDate(dateString, renderInfo.dateFormat);
    // console.log(fileDate);

    return fileDate;
}

// Not support multiple targets
// May merge with collectDataFromFrontmatterKey
export function getDateFromFrontmatter(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo
): Moment {
    // console.log("getDateFromFrontmatter");

    let date = window.moment("");

    let frontMatter = fileCache.frontmatter;
    if (frontMatter) {
        if (helper.deepValue(frontMatter, query.getTarget())) {
            let strDate = helper.deepValue(frontMatter, query.getTarget());

            // We only support single value for now
            if (typeof strDate === "string") {
                strDate = helper.getDateStringFromInputString(
                    strDate,
                    renderInfo.dateFormatPrefix,
                    renderInfo.dateFormatSuffix
                );

                date = helper.strToDate(strDate, renderInfo.dateFormat);
                // console.log(date);
            }
        }
    }

    return date;
}

// Inline tags only
// Not support multiple targets
// May merge with collectDataFromInlineTag
export function getDateFromTag(
    content: string,
    query: Query,
    renderInfo: RenderInfo
): Moment {
    // console.log("getDateFromTag");

    let date = window.moment("");

    let tagName = query.getTarget();
    if (query.getParentTarget()) {
        tagName = query.getParentTarget(); // use parent tag name for multiple values
    }
    // console.log(tagName);
    let strHashtagRegex =
        "(^|\\s)#" +
        tagName +
        "(\\/[\\w-]+)*(:(?<values>[\\d\\.\\/-]*)[a-zA-Z]*)?([\\.!,\\?;~-]*)?(\\s|$)";
    // console.log(strHashtagRegex);
    let hashTagRegex = new RegExp(strHashtagRegex, "gm");
    let match;
    while ((match = hashTagRegex.exec(content))) {
        // console.log(match);
        if (
            typeof match.groups !== "undefined" &&
            typeof match.groups.values !== "undefined"
        ) {
            let strDate = match.groups.values;

            strDate = helper.getDateStringFromInputString(
                strDate,
                renderInfo.dateFormatPrefix,
                renderInfo.dateFormatSuffix
            );

            date = helper.strToDate(strDate, renderInfo.dateFormat);
            if (date.isValid()) {
                break;
            }
        }
    }
    // console.log(date);
    return date;
}

// Not support multiple targets
// May merge with colllectDataFromText
export function getDateFromText(
    content: string,
    query: Query,
    renderInfo: RenderInfo
) {
    // console.log("getDateFromText");

    let date = window.moment("");

    let strTextRegex = query.getTarget();
    // console.log(strTextRegex);
    let textRegex = new RegExp(strTextRegex, "gm");
    let match;
    while ((match = textRegex.exec(content))) {
        // console.log(match);
        if (
            typeof match.groups !== "undefined" &&
            typeof match.groups.value !== "undefined"
        ) {
            let strDate = match.groups.value.trim();
            // console.log(strDate);

            strDate = helper.getDateStringFromInputString(
                strDate,
                renderInfo.dateFormatPrefix,
                renderInfo.dateFormatSuffix
            );

            date = helper.strToDate(strDate, renderInfo.dateFormat);
            if (date.isValid()) {
                break;
            }
        }
    }
    // console.log(date);
    return date;
}

// Not support multiple targets
// May merge with colllectDataFromDvField
export function getDateFromDvField(
    content: string,
    query: Query,
    renderInfo: RenderInfo
) {
    // console.log("getDateFromDvField");

    let date = window.moment("");

    let dvTarget = query.getTarget();
    if (query.getParentTarget()) {
        dvTarget = query.getParentTarget(); // use parent tag name for multiple values
    }
    // Dataview ask user to add dashes for spaces as search target
    // So a dash may stands for a real dash or a space
    dvTarget = dvTarget.replace("-", "[\\s\\-]");

    // Test this in Regex101
    // remember '\s' includes new line
    // (^| |\t)\*{0,2}dvTarget\*{0,2}(::[ |\t]*(?<values>[\d\.\/\-\w,@; \t:]*))(\r?\n|\r|$)
    let strHashtagRegex =
        "(^| |\\t)\\*{0,2}" +
        dvTarget +
        "\\*{0,2}(::[ |\\t]*(?<values>[\\d\\.\\/\\-\\w,@; \\t:]*))(\\r\\?\\n|\\r|$)";
    // console.log(strHashtagRegex);
    let hashTagRegex = new RegExp(strHashtagRegex, "gm");
    let match;
    while ((match = hashTagRegex.exec(content))) {
        // console.log(match);
        if (
            typeof match.groups !== "undefined" &&
            typeof match.groups.values !== "undefined"
        ) {
            let strDate = match.groups.values.trim();

            strDate = helper.getDateStringFromInputString(
                strDate,
                renderInfo.dateFormatPrefix,
                renderInfo.dateFormatSuffix
            );

            date = helper.strToDate(strDate, renderInfo.dateFormat);
            if (date.isValid()) {
                break;
            }
        }
    }
    // console.log(date);
    return date;
}

// Not support multiple targets
// May merge with colllectDataFromFileMeta
export function getDateFromFileMeta(
    file: TFile,
    query: Query,
    renderInfo: RenderInfo
) {
    // console.log("getDateFromFileMeta");

    let date = window.moment("");

    if (file && file instanceof TFile) {
        // console.log(file.stat);

        let target = query.getTarget();
        if (target === "cDate") {
            let ctime = file.stat.ctime;
            date = helper.getDateFromUnixTime(ctime, renderInfo.dateFormat);
        } else if (target === "mDate") {
            let mtime = file.stat.mtime;
            date = helper.getDateFromUnixTime(mtime, renderInfo.dateFormat);
        } else if (target === "name") {
            date = getDateFromFilename(file, renderInfo);
        }
    }

    // console.log(date);
    return date;
}

// Not support multiple targets
// May merge with colllectDataFromTask
export function getDateFromTask(
    content: string,
    query: Query,
    renderInfo: RenderInfo
) {
    // console.log("getDateFromTask");

    let date = window.moment("");
    let searchType = query.getType();
    // console.log(searchType);

    let strTextRegex = query.getTarget();
    if (searchType === SearchType.Task) {
        strTextRegex = "\\[[\\sx]\\]\\s" + strTextRegex;
    } else if (searchType === SearchType.TaskDone) {
        strTextRegex = "\\[x\\]\\s" + strTextRegex;
    } else if (searchType === SearchType.TaskNotDone) {
        strTextRegex = "\\[\\s\\]\\s" + strTextRegex;
    } else {
        strTextRegex = "\\[[\\sx]\\]\\s" + strTextRegex;
    }
    // console.log(strTextRegex);

    let textRegex = new RegExp(strTextRegex, "gm");
    let match;
    while ((match = textRegex.exec(content))) {
        // console.log(match);
        if (
            typeof match.groups !== "undefined" &&
            typeof match.groups.value !== "undefined"
        ) {
            let strDate = match.groups.value.trim();
            // console.log(strDate);

            strDate = helper.getDateStringFromInputString(
                strDate,
                renderInfo.dateFormatPrefix,
                renderInfo.dateFormatSuffix
            );

            date = helper.strToDate(strDate, renderInfo.dateFormat);
            if (date.isValid()) {
                break;
            }
        }
    }
    // console.log(date);
    return date;
}

export function addToDataMap(
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
): boolean {
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
                query.addNumTargets();
            } else if (tag.startsWith(query.getTarget() + "/")) {
                // nested tag
                tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
                tagExist = true;
                query.addNumTargets();
            } else {
                continue;
            }

            // valued-tag in frontmatter is not supported
            // because the "tag:value" in frontmatter will be consider as a new tag for different values

            let value = null;
            if (tagExist) {
                value = tagMeasure;
            }
            let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
            addToDataMap(dataMap, xValue, query, value);
            return true;
        }
    }

    return false;
}

export function collectDataFromFrontmatterKey(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    // console.log("collectDataFromFrontmatterKey");

    let frontMatter = fileCache.frontmatter;
    if (frontMatter) {
        if (helper.deepValue(frontMatter, query.getTarget())) {
            let toParse = helper.deepValue(frontMatter, query.getTarget());
            let retParse = helper.parseFloatFromAny(
                toParse,
                renderInfo.textValueMap
            );
            if (retParse.value !== null) {
                if (retParse.type === ValueType.Time) {
                    query.valueType = ValueType.Time;
                }
                query.addNumTargets();
                let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
                addToDataMap(dataMap, xValue, query, retParse.value);
                return true;
            }
        } else if (
            query.getParentTarget() &&
            helper.deepValue(frontMatter, query.getParentTarget())
        ) {
            // console.log("multiple values");
            // console.log(query.getTarget());
            // console.log(query.getParentTarget());
            // console.log(query.getSubId());
            // console.log(
            //     frontMatter[query.getParentTarget()]
            // );
            let toParse = helper.deepValue(
                frontMatter,
                query.getParentTarget()
            );
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
                let splittedPart = splitted[query.getAccessor()].trim();
                let retParse = helper.parseFloatFromAny(
                    splittedPart,
                    renderInfo.textValueMap
                );
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        query.valueType = ValueType.Time;
                    }
                    query.addNumTargets();
                    let xValue = xValueMap.get(
                        renderInfo.xDataset[query.getId()]
                    );
                    addToDataMap(dataMap, xValue, query, retParse.value);
                    return true;
                }
            }
        }
    }

    return false;
}

export function collectDataFromWiki(
    fileCache: CachedMetadata,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    let links = fileCache.links;
    if (!links) return;

    let linkMeasure = 0.0;
    let linkExist = false;
    for (let link of links) {
        if (link.link === query.getTarget()) {
            linkExist = true;
            linkMeasure = linkMeasure + renderInfo.constValue[query.getId()];
            query.addNumTargets();
        }
    }

    let linkValue = null;
    if (linkExist) {
        linkValue = linkMeasure;
    }

    if (linkValue !== null) {
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
        addToDataMap(dataMap, xValue, query, linkValue);
        return true;
    }

    return false;
}

export function collectDataFromInlineTag(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    // console.log(content);
    // Test this in Regex101
    // (^|\s)#tagName(\/[\w-]+)*(:(?<values>[\d\.\/-]*)[a-zA-Z]*)?([\\.!,\\?;~-]*)?(\s|$)
    let tagName = query.getTarget();
    if (query.getParentTarget()) {
        tagName = query.getParentTarget(); // use parent tag name for multiple values
    }
    if (tagName.length > 1 && tagName.startsWith("#")) {
        tagName = tagName.substring(1);
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
                let retParse = helper.parseFloatFromAny(
                    toParse,
                    renderInfo.textValueMap
                );
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        tagMeasure = retParse.value;
                        tagExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            retParse.value !== 0
                        ) {
                            tagMeasure += retParse.value;
                            tagExist = true;
                            query.addNumTargets();
                        }
                    }
                }
            } else if (
                splitted.length > query.getAccessor() &&
                query.getAccessor() >= 0
            ) {
                let toParse = splitted[query.getAccessor()].trim();
                let retParse = helper.parseFloatFromAny(
                    toParse,
                    renderInfo.textValueMap
                );
                //console.log(retParse);
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        tagMeasure = retParse.value;
                        tagExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        tagMeasure += retParse.value;
                        tagExist = true;
                        query.addNumTargets();
                    }
                }
            }
        } else {
            // console.log("simple-tag");
            tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
            tagExist = true;
            query.addNumTargets();
        }
    }

    let value = null;
    if (tagExist) {
        value = tagMeasure;
    }
    if (value !== null) {
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
        addToDataMap(dataMap, xValue, query, value);
        return true;
    }

    return false;
}

export function collectDataFromText(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
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
                let retParse = helper.parseFloatFromAny(
                    match.groups.value,
                    renderInfo.textValueMap
                );
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        textMeasure = retParse.value;
                        textExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            retParse.value !== 0
                        ) {
                            textMeasure += retParse.value;
                            textExist = true;
                            query.addNumTargets();
                        }
                    }
                }
            }
        } else {
            // console.log("simple-text");
            textMeasure = textMeasure + renderInfo.constValue[query.getId()];
            textExist = true;
            query.addNumTargets();
        }
    }

    if (textExist) {
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
        addToDataMap(dataMap, xValue, query, textMeasure);
        return true;
    }

    return false;
}

export function collectDataFromFileMeta(
    file: TFile,
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    // console.log("collectDataFromFileMeta");

    if (file && file instanceof TFile) {
        // console.log(file.stat);

        let target = query.getTarget();
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);

        if (target === "cDate") {
            let ctime = file.stat.ctime; // number in seconds
            query.valueType = ValueType.Date;
            query.addNumTargets();
            addToDataMap(dataMap, xValue, query, ctime);
            return true;
        } else if (target === "mDate") {
            let mtime = file.stat.mtime; // number in seconds
            query.valueType = ValueType.Date;
            query.addNumTargets();
            addToDataMap(dataMap, xValue, query, mtime);
            return true;
        } else if (target === "size") {
            let size = file.stat.size; // number in
            query.addNumTargets();
            addToDataMap(dataMap, xValue, query, size);
            return true;
        } else if (target === "numWords") {
            let numWords = helper.getWordCount(content);
            addToDataMap(dataMap, xValue, query, numWords);
            return true;
        } else if (target === "numChars") {
            let numChars = helper.getCharacterCount(content);
            query.addNumTargets();
            addToDataMap(dataMap, xValue, query, numChars);
            return true;
        } else if (target === "numSentences") {
            let numSentences = helper.getSentenceCount(content);
            query.addNumTargets();
            addToDataMap(dataMap, xValue, query, numSentences);
            return true;
        } else if (target === "name") {
            let targetMeasure = 0.0;
            let targetExist = false;
            let retParse = helper.parseFloatFromAny(
                file.basename,
                renderInfo.textValueMap
            );
            if (retParse.value !== null) {
                if (retParse.type === ValueType.Time) {
                    targetMeasure = retParse.value;
                    targetExist = true;
                    query.valueType = ValueType.Time;
                    query.addNumTargets();
                } else {
                    if (
                        !renderInfo.ignoreZeroValue[query.getId()] ||
                        retParse.value !== 0
                    ) {
                        targetMeasure += retParse.value;
                        targetExist = true;
                        query.addNumTargets();
                    }
                }
            }

            let value = null;
            if (targetExist) {
                value = targetMeasure;
            }
            if (value !== null) {
                addToDataMap(dataMap, xValue, query, value);
                return true;
            }
        }
    }

    return false;
}

export function collectDataFromDvField(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    let dvTarget = query.getTarget();
    if (query.getParentTarget()) {
        dvTarget = query.getParentTarget(); // use parent tag name for multiple values
    }
    // Dataview ask user to add dashes for spaces as search target
    // So a dash may stands for a real dash or a space
    dvTarget = dvTarget.replace("-", "[\\s\\-]");

    // Test this in Regex101
    // remember '\s' includes new line
    // (^| |\t)\*{0,2}dvTarget\*{0,2}(::[ |\t]*(?<values>[\d\.\/\-\w,@; \t:]*))(\r?\n|\r|$)
    let strHashtagRegex =
        "(^| |\\t)\\*{0,2}" +
        dvTarget +
        "\\*{0,2}(::[ |\\t]*(?<values>[\\d\\.\\/\\-\\w,@; \\t:]*))(\\r\\?\\n|\\r|$)";
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
                // console.log(toParse);
                let retParse = helper.parseFloatFromAny(
                    toParse,
                    renderInfo.textValueMap
                );
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        tagMeasure = retParse.value;
                        tagExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            retParse.value !== 0
                        ) {
                            tagMeasure += retParse.value;
                            tagExist = true;
                            query.addNumTargets();
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
                let retParse = helper.parseFloatFromAny(
                    toParse,
                    renderInfo.textValueMap
                );
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        tagMeasure = retParse.value;
                        tagExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        tagMeasure += retParse.value;
                        tagExist = true;
                        query.addNumTargets();
                    }
                }
            }
        } else {
            // console.log("simple-tag");
            tagMeasure = tagMeasure + renderInfo.constValue[query.getId()];
            tagExist = true;
            query.addNumTargets();
        }
    }

    let value = null;
    if (tagExist) {
        value = tagMeasure;
    }
    if (value !== null) {
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
        addToDataMap(dataMap, xValue, query, value);
        return true;
    }

    return false;
}

export function collectDataFromTask(
    content: string,
    query: Query,
    renderInfo: RenderInfo,
    dataMap: DataMap,
    xValueMap: XValueMap
): boolean {
    // console.log("collectDataFromTask");
    let searchType = query.getType();
    // console.log(searchType);

    let strTextRegex = query.getTarget();
    if (searchType === SearchType.Task) {
        strTextRegex = "\\[[\\sx]\\]\\s" + strTextRegex;
    } else if (searchType === SearchType.TaskDone) {
        strTextRegex = "\\[x\\]\\s" + strTextRegex;
    } else if (searchType === SearchType.TaskNotDone) {
        strTextRegex = "\\[\\s\\]\\s" + strTextRegex;
    } else {
        // all
        strTextRegex = "\\[[\\sx]\\]\\s" + strTextRegex;
    }
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
                let retParse = helper.parseFloatFromAny(
                    match.groups.value,
                    renderInfo.textValueMap
                );
                // console.log(value);
                if (retParse.value !== null) {
                    if (retParse.type === ValueType.Time) {
                        textMeasure = retParse.value;
                        textExist = true;
                        query.valueType = ValueType.Time;
                        query.addNumTargets();
                    } else {
                        if (
                            !renderInfo.ignoreZeroValue[query.getId()] ||
                            retParse.value !== 0
                        ) {
                            textMeasure += retParse.value;
                            textExist = true;
                            query.addNumTargets();
                        }
                    }
                }
            }
        } else {
            // console.log("simple-text");
            textMeasure = textMeasure + renderInfo.constValue[query.getId()];
            textExist = true;
            query.addNumTargets();
        }
    }

    if (textExist) {
        let xValue = xValueMap.get(renderInfo.xDataset[query.getId()]);
        addToDataMap(dataMap, xValue, query, textMeasure);
        return true;
    }

    return false;
}
