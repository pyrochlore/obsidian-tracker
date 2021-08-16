# Test Word Counting


## Word counts of daily notes
``` tracker
searchType: fileMeta
searchTarget: numWords, numChars
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
datasetName: words, chars
line:
    title: Word Counting
    yAxisLocation: left, right
    yAxisLabel: Words, Characters
    lineColor: red, yellow
    showLegend: true
```

``` tracker
searchType: fileMeta
searchTarget: numWords
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
summary:
    template: 'Total number of words: {{sum()}}'
```

``` tracker
searchType: fileMeta
searchTarget: numChars
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
summary:
    template: 'Total number of characters: {{sum()}}'
```

## Word counts of all notes
Use file creation dates as x values then sum the counts up
``` tracker
searchType: fileMeta
searchTarget: cDate, numWords
xDataset: 0
folder: /
summary:
    template: "Total word count: {{sum(dataset(1))}}"
```

