# Test Axis Interval and Tick Label Format

## Y Axis Interval

Numeric Y values
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
    yAxisTickInterval: 5
    yMin: 55
```

Y values in time
``` tracker
searchType: frontmatter
searchTarget: clock-in, clock-out
endDate: 2021-01-15
folder: diary
datasetName: Clock-In, Clock-Out
line:
    title: "Working Hours"
    yAxisLabel: "Time (24h)"
    reverseYAxis: true
    lineColor: yellow, red
    showPoint: true
    yAxisTickInterval: 1h
    yMin: 06:00
    yMax: 23:00
```

## Y Axis Tick Label Format
Float numbers with precision of 1 decimal digits
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
    yAxisTickInterval: 5
    yAxisTickLabelFormat: .2f
    yMin: 55
```

Y values in time
``` tracker
searchType: frontmatter
searchTarget: clock-in, clock-out
endDate: 2021-01-15
folder: diary
datasetName: Clock-In, Clock-Out
line:
    title: "Working Hours"
    yAxisLabel: "Time (24h)"
    reverseYAxis: true
    lineColor: yellow, red
    showPoint: true
    yMin: 05:00
    yMax: 22:00
    yAxisTickInterval: 50m
    yAxisTickLabelFormat: H---m
```

## X Axis Interval
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
    xAxisTickInterval: 1w
```

## X Axis Tick Label Format
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
    xAxisTickInterval: 7d
    xAxisTickLabelFormat: M-DD
```