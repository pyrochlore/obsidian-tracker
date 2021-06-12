# Test Word Counting

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
    template: 'Total number of words: {{sum}}'
```

``` tracker
searchType: fileMeta
searchTarget: numChars
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
summary:
    template: 'Total number of characters: {{sum}}'
```