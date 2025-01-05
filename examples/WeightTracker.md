# Weight Tracker

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
aspectRatio: 20:9
fitPanelWidth: 1
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

## Summary
``` tracker
searchType: tag
searchTarget: weight
folder: diary
summary:
    template: "First: {{first()}}kg\nLast: {{last()}}kg\nMinimum: {{min()}}kg\nMaximum: {{max()}}kg\nMedian: {{median()}}kg\nAverage: {{average()}}kg"
```

``` tracker
searchType: tag
searchTarget: weight
folder: diary
endDate: 2021-01-31
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    showPoint: false
    lineColor: "#b16286"
```

Please also check those search targets in markdown files under folder 'diary'.









