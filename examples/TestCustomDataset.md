# Test Custom Dataset

## Normalize
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
dataset1:
    name: A
    xData: 1, 2
	yData: 3, 4
dataset2:
    name: B
    xData: 5, 6
	yData: 7, 8
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

<!--
## Moving Average

## Manual Input
Custom dataset only (no searchType and searchTarget)
``` tracker

```

Dataset and custom dataset
``` tracker

```



``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
summary:
    template: "How many days I said love: {{sum(dataset(0))}}\nHow many days I didn't say love: {{sum( dataset(0) + dataset(0) + 1)}}"
```

