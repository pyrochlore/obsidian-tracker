# Expressions

Expressions could help us create new and meaningful data from the original collected data by using operators and functions.

## !!! Breaking Changes !!!

From version 1.9.0, template variables, e.g. '{{sum}}', are deprecated. Instead, Tracker provide operators (+, -, *, /, %) and functions (dataset(), sum(), maxStreak(), ......etc) to help us do data processing. For users having code blocks from previous version, please replace '{{sum}}' by '{{sum()}}' or '{{sum(1)}}' by '{{sum(dataset(1))}}'.

## Where to Use 

Currently, we can only use expressions in some parameters. These includes `template` in `summary` output, `value` in `bullet` output, and `data` `label` `extLabel` in `pie` output. In future release, there will be more parameters using expressiones as input.

## How to Use

Expressions should be be wrapped in curly brackets. By using the combination of operators and funtions, Tracker can resolve the whole expression in brackets and then generate a number or a string according to what was requested. 

If the resolved output of an expression is a string, we can assign a format string to it. The format string should be placed after the expression in curly brackets following by two colons. For example, The expression '{{sum()::i}}' will force the output number represented as an integer (i for integer).  

For the number output, use '[Printf Format String](https://en.wikipedia.org/wiki/Printf_format_string)' for the format string. For the date output, use the date format string defined in [Moment.js](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/).

The following tables show all the operators and functions available for now. Please make sure the input type and output type when you are combining them together. Examples could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md). Requests for operators or functions are welcome.

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
- number + number --> number
- dataset + number --> dataset
- number + dataset -> dataset
- dataset + dataset --> dataset

## List of Functions

### Get Dataset by Index

| Function(InputType): OutputType | Description |
|:------------------|:-----------|
| dataset(number): Dataset | Get dataset from dataset id (the order in `searchTarget`) |

### Functions Accept Dataset and return a value

**If the input dataset is missing, it will use the first available Y dataset found.**

| Function(InputType): OutputType | Description |
|:------------------|:-----------|
| first(Dataset): number | First value of the dataset |
| last(Dataset): number | Last value of the dataset |
| min(Dataset): number | Minimum value of the dataset |
| minDate(Dataset): Date | Latest date of minimum value |
| max(Dataset): number | Maximum value of the dataset |
| maxDate(Dataset): Date | Latest date of maximum value |
| startDate(Dataset): Date | Start date of the dataset |
| endDate(Dataset): Date | End date of the dataset |
| sum(Dataset): number | Summation of values of the dataset |
| numTargets(Dataset): number | Total counts of targets |
| numDays(Dataset): number | Days from startDate to endDate |
| numDaysHavingData(Dataset): number | Number of days having data |
| maxStreak(Dataset): number | Maximum continuous days without breaks |
| maxStreakStart(Dataset): Date | Start date of the max streak |
| maxStreakEnd(Dataset): Date | End date of the max streak |
| maxBreaks(Dataset): number | Maximum break days |
| maxBreaksStart(Dataset): Date | Start date of the maximum break days |
| maxBreaksEnd(Dataset): Date | End date of the maximum break days |
| currentStreak(Dataset): number | Current continuous days |
| currentStreakStart(Dataset): Date | Start date of current streak |
| currentStreakEnd(Dataset): Date | End date of current streak |
| currentBreaks(Dataset): number | Current break days |
| currentBreaksStart(Dataset): Date | Start date of current breaks |
| currentBreaksEnd(Dataset): Date | End date of current breaks |
| average(Dataset): number | Average value of the dataset |
| median(Dataset): number | Median value of the dataset |
| variance(Dataset): number | Variance value of the dataset |

### Functions Accept Dataset and Return Dataset

| Function(InputType): OutputType | Description |
|:---------|:-----------|
| normalize(Dataset): Dataset | rescale the Y values to [0, 1] |
| setMissingValues(Dataset, number): Dataset | set the missing values |

## Missing Values

Notice that the missing values (null values) are ignored in function like sum or average. Moreover, a value plus a missing value will leads to null value (missing value). To avoid these, you can set those missing values to a value by using parameter `penalty` or use expression function `setMissingValues`.
