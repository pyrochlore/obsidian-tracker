import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';

let root_folder = __dirname;
let subfolder = "diary";
let dateFormat = "YYYY-MM-DD";
let startDate = moment("2021-01-01", dateFormat);
let endDate = moment("2021-12-31", dateFormat);

function randomIntFromInterval(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomFloatFromInterval(min: number, max: number) {
    return Math.random() * (max - min + 1) + min;
}

// Check subfolder exists
let subfolderPath = path.join(root_folder, subfolder)
if (!fs.existsSync(subfolderPath)) {
    fs.mkdirSync(subfolderPath);
}

let dayCount = 0;
for (let curDate = startDate.clone(); curDate <= endDate; curDate.add(1, 'days')) {
    dayCount++;
    let fileName = curDate.format(dateFormat);
    let filePath = path.join(subfolderPath, fileName + ".md");

    let fh = fs.openSync(filePath, "w+");

    let content:string = "";

    // fontmatter
    let frontmatter = "---\n";
    let weekday = curDate.weekday();
    // front matter tags
    if (weekday == 0 || weekday == 6) {
        frontmatter += "tags: " + "\n";
    }
    else {
        frontmatter += "tags: " + "work_log" + "\n";
    }
    // frontmatter mood
    let mood = randomIntFromInterval(1, 10);
    frontmatter += "mood: " + mood + "\n";
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
    let missed = randomIntFromInterval(0, 1);
    if (!missed) {
        content += tagMeditation + "\n";
    }

    content += "\n";

    // star
    let textStar = "⭐";
    let numStar = randomIntFromInterval(0, 5);
    content += textStar.repeat(numStar) + "\n";

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

    fs.writeFileSync(fh, content);
    fs.closeSync(fh);
}

