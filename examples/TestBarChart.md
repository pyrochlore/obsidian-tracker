# Test Bar Chart

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
bar:
    title: Weight Log
    yAxisLabel: Weight
    xAxisPadding: 12h
    yAxisUnit: kg
    yMin: 0
    barColor: darkolivegreen
```

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
bar:
    title: Weight Log
    yAxisLabel: Weight
    xAxisPadding: 12h
    yAxisUnit: kg
    yMin: 0
    barColor: brown
```

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2]
folder: diary
startDate: 2021-01-10
endDate: 2021-01-21
bar:
    title: Sin Wave
    yAxisLabel: Value
    xAxisPadding: 12h
    barColor: yellow, red, green
```

``` tracker
searchType: tag
searchTarget: sinsquare[0], sinsquare[1], sinsquare[2], sinsquare[3], sinsquare[4], sinsquare[5]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
bar:
    title: Sin Square Wave
    yAxisLabel: Value
    xAxisPadding: 12h
    yMin: 0
    barColor: yellow, red, green, blue, orange, white
```


``` tracker
searchType: tag
searchTarget: sinsquare[0], sinsquare[1], sinsquare[2], sinsquare[3], sinsquare[4], sinsquare[5]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
stack: true
bar:
    title: Sin Square Wave (Stacked)
    yAxisLabel: Value
    xAxisPadding: 12h
    yMin: 0
    barColor: yellow, red, green, blue, orange, black
```
Please also check those search targets in markdown files under folder 'diary'.