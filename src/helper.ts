

export function trimByChar(str: string, char: string) {
    const arr = Array.from(str);
    const first = arr.findIndex((c) => c !== char);
    const last = arr.reverse().findIndex((c) => c !== char);
    return first === -1 && last === -1
        ? str
        : str.substring(first, str.length - last);
}

// export function parseValues(toParse: string) {
//     if (typeof toParse === "string") {
//         let splitted = toParse.split(
//             query.getSeparator()
//         );
//         if (
//             splitted.length > query.getArg() &&
//             query.getArg() >= 0
//         ) {
//             // TODO: it's not efficent to retrieve one value at a time, enhance this
//             let value = null;
//             let splittedPart =
//                 splitted[query.getArg()].trim();
//             if (toParse.includes(":")) {
//                 // time value
//                 let timeValue = window.moment(
//                     splittedPart,
//                     timeFormat,
//                     true
//                 );
//                 if (timeValue.isValid()) {
//                     query.setUsingTimeValue();
//                     value = timeValue.diff(
//                         window.moment(
//                             "00:00",
//                             "HH:mm",
//                             true
//                         ),
//                         "seconds"
//                     );
//                 }
//             } else {
//                 value = parseFloat(splittedPart);
//             }

//             if (Number.isNumber(value)) {
//                 this.addToDataMap(
//                     dataMap,
//                     fileDate.format(
//                         renderInfo.dateFormat
//                     ),
//                     query,
//                     value
//                 );
//             }
//         }
//     }
// }
