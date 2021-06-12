# Test Word Counting

``` tracker
searchType: fileMeta
searchTarget: numWords, numChars
folder: diary
startDate: 2021-01-01
endDate: 2021-01-03
line:
    title: Word Counting
	yAxisLocation: left, right
	yAxisLabel: Words, Characters
	lineColor: red, yellow
	yMin: 99, 850
```

``` tracker
searchType: fileMeta
searchTarget: numWords
folder: diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Total number of words: {{sum}}'
```

``` tracker
searchType: fileMeta
searchTarget: numChars
folder: diary
startDate: 2021-01-01
endDate: 2021-01-03
summary:
    template: 'Total number of characters: {{sum}}'
```