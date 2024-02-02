# Test Expression

All examples here using the output type `summary`.
To see examples of `bullet` and `pie`, please check [bullet examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestBullet.md) and [pie examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestPieChart.md).

## Operators

### number and number

number \+ number --> number
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{10 + 10::i}} <-- should be 20'
```

### Dataset and number

Dataset \+ number --> Dataset
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max() + 10::i}} <-- should be 48 + 10'
```

Dataset \- number --> Dataset
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max() - 2::i}} <-- should be 48 - 2'
```

Dataset \* number --> Dataset
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max() * 2::i}} <-- should be 48 * 2'
```

Dataset / number --> Dataset
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max() / 2::i}} <-- should be 48 / 2'
```

Dataset % number --> Dataset
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max() % 5::i}} <-- should be 48 % 5'
```

### Dataset and Dataset

Dataset1 \+ Dataset2 --> Dataset
==> Dataset[i] = Dataset1[i] + Dataset2[i]
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max(dataset(0) + dataset(0))::i}} <-- should be 48 + 48'
```

## Functions

**If the input dataset is missing, it will use the first available Y dataset found.**

### Functions Accept Dataset and Return a Value

min(Dataset): number
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Minimum value: {{min()::i}} <-- should be 12'
```

minDate(Dataset): Date
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Latest date of minimum value: {{minDate()}} <-- should be 2021-01-03'
```

max(Dataset): number
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max()::i}} <-- should be 48'
```

maxDate(Dataset): Date
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Latest date of maximum value: {{maxDate()}} <-- should be 2021-01-01'
```

startDate(Dataset): Date
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Start date: {{startDate()}} <-- should be 2021-01-01'
```

endDate(Dataset): Date
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'End date: {{endDate()}} <-- should be 2021-01-03'
```

sum(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Sum: {{sum()::i}} <-- should be 3'
```

numTargets(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of targets: {{numTargets()::i}} <-- should be 3'
```

numDays(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of days: {{numDays()::i}} <-- should be 4'
```

numDaysHavingData(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of days having data: {{numDaysHavingData()::i}} <-- should be 3'
```

maxStreak(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'Maximum streak: {{maxStreak()::i}} <-- should be 5'
```

maxStreakStart(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The start date of maximum streak: {{maxStreakStart()}} <-- should be 2021-01-02'
```

maxStreakEnd(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The end date of maximum streak: {{maxStreakEnd()}} <-- should be 2021-01-06'
```

maxBreaks(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'Maximum breaks: {{maxBreaks()::i}} <-- should be 2'
```

maxBreaksStart(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The start date of maximum breaks: {{maxBreaksStart()}} <-- should be 2021-01-07'
```

maxBreaksEnd(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The end date of maximum breaks: {{maxBreaksEnd()}} <-- should be 2021-01-08'
```

currentStreak(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'Latest streak: {{currentStreak()::i}} <-- should be 1'
```

currentStreakStart(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'The start date of current streak: {{currentStreakStart()}} <-- should be 2021-01-24'
```

currentStreakEnd(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'The end date of current streak: {{currentStreakEnd()}} <-- should be 2021-01-24'
```

currentBreaks(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'Current breaks: {{currentBreaks()::i}} <-- should be 1'
```

currentBreaksStart(Dataset): number
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'The start date of current breaks: {{currentBreaksStart()}} <-- should be 2021-01-22'
```

currentBreaksEnd(Dataset): Date
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'The end date of current breaks: {{currentBreaksEnd()}} <-- should be 2021-01-22'
```

average(Dataset): number
(48+25+12)/3 = 28.33
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Average value: {{average()::.2f}} <-- should be 28.33'
```

median(Dataset): number
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Median value: {{median()::i}} <-- should be 25'
```

variance(Dataset): number
https://mathworld.wolfram.com/SampleVariance.html
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Variance value: {{variance()::.2f}} <-- should be 332.33'
```

### Functions Accept Dataset and Return a Dataset

normalize(Dataset): Dataset
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Set missing values to -1, do normalization then do summation: {{sum( normalize( setMissingValues(dataset(0), -1) ) )::i}} <-- should be 3'
```

setMissingValues(Dataset): Dataset
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Set missing values to -1 then do summation: {{sum( setMissingValues( dataset(0), -1 ) )::i}} <-- should be 2'
```

