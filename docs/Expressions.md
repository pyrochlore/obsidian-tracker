# Expressions

Expressions could help us create new and meaningful data from the original collected data by using operators and functions.

## !!! Breaking Changes !!!

From version 1.9.0, template variables, e.g. '{{sum}}', are deprecated. Instead, Tracker provide operators (+, -, *, /, %) and functions (dataset(), sum(), maxStreak(), ......etc) to help us do data processing. For users having code blocks from previous version, please replace '{{sum}}' by '{{sum()}}' or '{{sum(1)}}' by '{{sum(dataset(1))}}'.

## Where to Use 

Currently, we can only use expressions in some parameters. These includes `template` in `summary` output, `value` in `bullet` output, and `data` `label` `extLabel` in `pie` output. In future release, we might add a parameter `dataset` accepting expressions to be used with other output type.

## How to Use

Expressions should be be wrapped in curly brackets. By Using the combination of operatora and funtions listed beloew, Tracker will try to resolve the whole expression in brackets and then generate a number or a string according to what was requested. 

If the resolved expreasion is a string, we can optionally provide a format string by adding it right after the expression and two extra colons.

The following tables show all the operators and functions available for now. Please make sure the input type and output type when you are combining them together. Examples could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md)).  

## List of Operators

### Uniry Operators

| Function | Description | Operant | Output | 
|:---------|:------------|:--------|:------|
| + | positive | number or dataset | number or dataset |
| - | negative | number or dataset | number or dataset |

### Binary Operators

| Function | Description | Left Operant | Right Operant | Output | 
|:---------|:------------|:-----|:------|:-------|
| + | plus | number or dataset | number or dataset | number or dataset |
| - | minus | number or dataset | number or dataset | number or dataset |
| * | multiply | number or dataset | number or dataset | number or dataset |
| / | divide | number or dataset | number or dataset | number or dataset |
| % | modulo | number or dataset | number or dataset | number or dataset |

e.g.
number + number --> number
dataset + number --> dataset
number + dataset -> dataset
dataset + dataset --> dataset

## List of Functions

### Get dataset from index

| Function(Input Args): Output | Description |
|:------------------|:-----------|
| dataset(id: number): Dataset | Get dataset from dataset id (the order in `searchTarget` |

### Functions Accept Dataset and return a value

If the input dataset is missing, it will use the first available Y dataset found.

| Function(Input Args): Output | Description |
|:------------------|:-----------|
| min(dataset: Dataset): number | Minimum value of the dataset |
| minDate(dataset: Dataset): Date | Latest date of minimum value |
| max(dataset: Dataset): number | Maximum value of the dataset |
| maxDate(dataset: Dataset): Date | Latest date of maximum value |
| startDate(dataset: Dataset): Date | Start date of the dataset |
| endDate(dataset: Dataset): Date | End date of the dataset |
| sum(dataset: Dataset): number | Summation of values of the dataset |
| numTargets(dataset: Dataset): number | Total counts of targets |
| numDays(dataset: Dataset): number | Days from startDate to endDate |
| numDaysHavingData(dataset: Dataset): number | Number of days having data |
| maxStreak(dataset: Dataset): number | Maximum continuous days without breaks |
| maxStreakStart(dataset: Dataset): Date | Start date of the max streak |
| maxStreakEnd(dataset: Dataset): Date | End date of the max streak |
| maxBreaks(dataset: Dataset): number | Maximum break days |
| maxBreaksStart(dataset: Dataset): Date | Start date of the maximum break days |
| maxBreaksEnd(dataset: Dataset): Date | End date of the maximum break days |
| currentStreak(dataset: Dataset): number | Current continuous days |
| currentStreakStart(dataset: Dataset): Date | Start date of current streak |
| currentStreakEnd(dataset: Dataset): Date | End date of current streak |
| currentBreaks(dataset: Dataset): number | Current break days |
| currentBreaksStart(dataset: Dataset): Date | Start date of current breaks |
| currentBreaksEnd(dataset: Dataset): Date | End date of current breaks |
| average(dataset: Dataset): number | Average value of the dataset |
| median(dataset: Dataset): number | Median value of the dataset |
| variance(dataset: Dataset): number | Variance value of the dataset |

### Functions Accept Dataset and Return Dataset

| Function | Description |
|:---------|:-----------|
| normalize(dataset: Dataset): Dataset | rescale the Y values to [0, 1] |
| setMissingValues(dataset: Dataset, missingValue: number): Dataset | set the missing values |

## Missing Values

Notice that the missing values (null values) are ignored in function like sum or average. Moreover, a value plus a missing value will leads to null value (missing value). To avoid these, you can set those missing values to a value by using parameter `penalty` or use expression function `setMissingValues`.
