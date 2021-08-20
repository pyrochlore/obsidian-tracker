import * as fs from "fs";
import * as path from "path";
import * as moment from "moment";

let root_folder = __dirname;
let subfolder = "diary";
let dateFormat = "YYYY-MM-DD";
let startDate = moment("2021-01-01", dateFormat);
let endDate = moment("2021-12-31", dateFormat);
let seed = 1;

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(random() * (max - min + 1) + min);
}

function randomFloatFromInterval(min: number, max: number) {
    return random() * (max - min + 1) + min;
}

// Check subfolder exists
let subfolderPath = path.join(root_folder, subfolder);
if (!fs.existsSync(subfolderPath)) {
    fs.mkdirSync(subfolderPath);
}

let dayCount = 0;
for (
    let curDate = startDate.clone();
    curDate <= endDate;
    curDate.add(1, "days")
) {
    dayCount++;
    let fileName = curDate.format(dateFormat);
    let filePath = path.join(subfolderPath, fileName + ".md");

    let fh = fs.openSync(filePath, "w+");

    let content: string = "";

    // fontmatter
    let frontmatter = "---\n";

    // front matter tags
    let weekday = curDate.weekday();
    if (weekday == 0 || weekday == 6) {
        frontmatter += "tags: " + "\n";
    } else {
        frontmatter += "tags: " + "work_log" + ", " + "work_log2" + "\n";
    }
    // frontmatter mood
    let moodSymbols = ["😀", "🙂", "😐", "🙁", "😞"];
    let indMood = randomIntFromInterval(0, 4);
    frontmatter += "mood: " + moodSymbols[indMood] + "\n";

    // blood pressure
    let progress = dayCount;
    if (progress > 100) {
        progress = 100;
    }
    let systolicStart = 180;
    let diastolicStart = 120;
    let systolicEnd = 120;
    let diastolicEnd = 100;
    let systolicDeviation = randomIntFromInterval(-5, 5);
    let diastolicDeviation = randomIntFromInterval(-2, 2);
    let systolic =
        ((systolicEnd - systolicStart) * dayCount) / 100 +
        systolicStart +
        systolicDeviation;
    let diastolic =
        ((diastolicEnd - diastolicStart) * dayCount) / 100 +
        diastolicStart +
        diastolicDeviation;
    frontmatter += "bloodpressure: " + systolic + "/" + diastolic + "\n";
    frontmatter += "bloodpressure1: " + systolic + ", " + diastolic + "\n";
    frontmatter +=
        "bloodpressure2: [" + systolic + ", " + diastolic + "]" + "\n";

    frontmatter += "bp:" + "\n";
    frontmatter += "    systolic: " + systolic + "\n";
    frontmatter += "    diastolic: " + diastolic + "\n";

    // clock-in clock-out, 24hr
    let time_clock_in =
        randomIntFromInterval(8, 10).toString() +
        ":" +
        randomIntFromInterval(0, 59).toString();
    let time_clock_out =
        randomIntFromInterval(16, 20).toString() +
        ":" +
        randomIntFromInterval(0, 59).toString();
    frontmatter += "clock-in: " + time_clock_in + "\n";
    frontmatter += "clock-out: " + time_clock_out + "\n";

    // sleep, 12hr + am/pm
    let time_in_bed =
        randomIntFromInterval(9, 11).toString() +
        ":" +
        randomIntFromInterval(0, 59).toString() +
        " pm";
    let time_out_of_bed =
        randomIntFromInterval(5, 7).toString() +
        ":" +
        randomIntFromInterval(0, 59).toString() +
        " am";
    frontmatter += "sleep: " + time_in_bed + "/" + time_out_of_bed + "\n";

    // deep value
    let deepValue = randomFloatFromInterval(0.0, 100.0);
    frontmatter += "deepValue: " + "\n";
    let indent = "    ";
    for (let ind = 0; ind < 5; ind++) {
        frontmatter += indent + "very: " + "\n";
        indent = indent + "    ";
    }
    frontmatter += indent + "deep: " + deepValue.toFixed(1) + "\n";

    // random character
    frontmatter += "randchar: " + String.fromCharCode(65+indMood) + "\n";

    frontmatter += "---\n";
    content += frontmatter;

    content += "\n";

    // weight
    let weight = randomFloatFromInterval(60.0, 80.0);
    let tagWeight = "#weight:" + weight.toFixed(1) + "kg";
    content += tagWeight + "\n";

    content += "\n";

    // excercise
    // pushup
    let numPushup = randomIntFromInterval(30, 50);
    let tagPushup = "#exercise-pushup:" + numPushup;
    content += tagPushup + "\n";
    //plank
    let numPlank = randomIntFromInterval(30, 120);
    let tagPlank = "#exercise-plank:" + numPlank + "sec";
    content += tagPlank + "\n";

    content += "\n";

    // meditation
    let tagMeditation = "#meditation";
    let missedMeditation = randomIntFromInterval(0, 1);
    if (!missedMeditation) {
        content += tagMeditation + "\n";
    }

    content += "\n";

    // star
    let textStar = "⭐";
    let numStar = randomIntFromInterval(0, 5);
    content += textStar.repeat(numStar) + "\n";

    content += "\n";

    // clean up
    let tagCleanUp = "#clean-up";
    let doCleanUp = randomIntFromInterval(0, 5);
    if (doCleanUp === 1) {
        content += tagCleanUp + "\n";
    }

    content += "\n";

    // finance
    let tagFinanceBank1 = "#finance/bank1";
    let tagFinanceBank2 = "#finance/bank2";

    let expense = randomFloatFromInterval(2.0, 3.0);
    content += tagFinanceBank1 + ":-" + expense.toFixed(1) + "USD" + "\n";

    if (dayCount % 30 == 0) {
        content += tagFinanceBank2 + ":" + "200USD" + "\n";
        content += tagFinanceBank2 + "/transfer:" + "-100USD" + "\n";
        content += tagFinanceBank1 + "/transfer:" + "100USD" + "\n";
    }

    content += "\n";

    // wiki links
    content += "[[todo_family|To-Do @Family]]" + "\n";
    content += "[[todo_work|To-Do @Work]]" + "\n";

    content += "\n";

    // searching text use regex
    let addEmail1 = randomIntFromInterval(0, 1);
    if (addEmail1) {
        content += "obsidian-tracker@gmail.com" + "\n";
    }
    let addEmail2 = randomIntFromInterval(0, 1);
    if (addEmail2) {
        content += "obsidian-tracker+1@gmail.com" + "\n";
    }
    let addEmail3 = randomIntFromInterval(0, 1);
    if (addEmail3) {
        content += "obsidian-tracker@yahoo.com" + "\n";
    }

    content += "\n";

    let countWeightLifting = randomIntFromInterval(10, 20);
    let addWeightLifting = randomIntFromInterval(0, 5);
    if (addWeightLifting > 0) {
        content += "weightlifting: " + countWeightLifting + "\n";
    }

    content += "\n";

    let dataviewValue = randomIntFromInterval(0, 100);
    let dataviewValue1 = randomIntFromInterval(0, 50);
    let dataviewValue2 = randomIntFromInterval(50, 100);
    content += "dataviewTarget:: " + dataviewValue + "\n";
    content += "- Make Progress:: " + dataviewValue1 + "\n";
    content += "- Make-Progress:: " + dataviewValue2 + "\n";
    content +=
        "dataviewTarget1:: " + dataviewValue + "/" + dataviewValue1 + "\n";
    content +=
        "dataviewTarget2:: " + dataviewValue1 + " @ " + dataviewValue2 + "\n";
    content +=
        "dataviewTarget3:: " + dataviewValue1 + ", " + dataviewValue2 + "\n";

    content += "\n";

    // clock-in clock-out in dvField
    let seconds = dataviewValue1;
    content += "clock-in:: " + time_clock_in + ":" + seconds + "\n";
    content += "clock-out:: " + time_clock_out + ":" + seconds +"\n";

    content += "\n";

    // sleep in dvField
    content += "sleep:: " + time_in_bed + "/" + time_out_of_bed + "\n";

    content += "\n";

    let amplitude = 1.0;
    let period = 30; // how many days to complete a sin period
    let numSinValues = 9;
    let initPhaseShift = -1.0;
    let shiftPhase = 1.0;
    let sinValues: Array<string> = [];
    for (let ind = 0; ind < numSinValues; ind++) {
        let shift = initPhaseShift + ind * shiftPhase;
        let sinValue =
            amplitude *
            Math.sin(((2.0 * Math.PI) / period) * (dayCount + shift));
        sinValues.push(sinValue.toFixed(5));
    }

    let tagSin = "#sin";

    content += tagSin + ":" + sinValues.join("/") + "\n";

    content += "\n";

    let sinSquareValues: Array<string> = [];
    for (let ind = 0; ind < numSinValues; ind++) {
        let shift = initPhaseShift + ind * shiftPhase;
        let sinSquareValue =
            (amplitude *
                Math.sin(((2.0 * Math.PI) / period) * (dayCount + shift))) **
            2;
        sinSquareValues.push(sinSquareValue.toFixed(5));
    }

    let tagSinSquare = "#sinsquare";
    content += tagSinSquare + ":" + sinSquareValues.join("/") + "\n";

    content += "\n";

    // Tasks
    let taskSayLove = "Say I love you";
    let missedSayLove = randomIntFromInterval(0, 1);
    if (!missedSayLove) {
        content += "- [x] " + taskSayLove + "\n";
    }
    else {
        content += "- [ ] " + taskSayLove + "\n";
    }

    content += "\n";

    fs.writeFileSync(fh, content);
    fs.closeSync(fh);
}
