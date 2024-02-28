# Weight Tracker

``` tracker
searchType: tag
searchTarget: weight
folder: examples/diary
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
folder: examples/diary
summary:
    template: "Minimum: {{min()}}kg\nMaximum: {{max()}}kg\nMedian: {{median()}}kg\nAverage: {{average()}}kg"
```

``` tracker
searchType: tag
searchTarget: weight
folder: examples/diary
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    showPoint: false
    lineColor: "#b16286"
```

Please also check those search targets in markdown files under folder 'diary'.









