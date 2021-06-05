# Test Legends

## Position and Orientation

- Default legendPosition ==> bottom
- Default legendOrientation ==> horizontal

### Right

- legendPosition: right
- Default legendOrientation ==> vertical

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: right
```

- legendPosition: right
- legendOrientation: horizontal

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: right
    legendOrientation: horizontal
```

### Left

- legendPosition: left
- Default legendOrientation ==> vertical

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: left
```

- legendPosition: left
- legendOrientation: horizontal

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: left
    legendOrientation: horizontal
```

### Top

- legendPosition: top
- Default legendOrientation ==> horizontal

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: top
```

- legendPosition: top
- legendOrientation: vertical
``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: top
    legendOrientation: vertical
```

### Bottom

- Default legendPosition ==> bottom
- Default legendOrientation ==> horizontal

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
```

- Default legendPosition ==> bottom
- legendOrientation: vertical

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendOrientation: vertical
    legendBorderColor: gold
```

## Lines, Points, and Bars

``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: weight
folder: diary
endDate: 2021-01-31
line:
    title: PushUp
    yAxisLabel: Count
    lineColor: "#d65d0e"
    showLegend: true
```

``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: weight
folder: diary
endDate: 2021-01-31
bar:
    title: PushUp
    yAxisLabel: Count
    barColor: "#458588"
    showLegend: true
```

``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: weight
folder: diary
endDate: 2021-01-31
bar:
    title: PushUp
    yAxisLabel: Count
    barColor: "#458588"
    showLegend: true
    legendPosition: right
```

Please also check those search targets in markdown files under folder 'diary'.