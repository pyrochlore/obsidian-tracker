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

for (let curDate = startDate.clone(); curDate <= endDate; curDate.add(1, 'days')) {
    let fileName = curDate.format(dateFormat);
    let filePath = path.join(subfolderPath, fileName + ".md");

    let fh = fs.openSync(filePath, "w+");


    // weight
    let weight = randomFloatFromInterval(60.0, 80.0);
    let tagWeight = "#weight:" + weight.toString() + "kg";
    fs.writeFileSync(fh, tagWeight + "\n");

    // meditation
    let tagMeditation = "#meditation";
    fs.writeFileSync(fh, tagMeditation + "\n");

    // star
    let textStar = "⭐";
    let numStar = randomIntFromInterval(0, 5);
    fs.writeFileSync(fh, textStar + "\n");

    // expense
    let tagExpense = "#finance/"


    fs.closeSync(fh);
}

