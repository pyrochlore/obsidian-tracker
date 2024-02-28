# Test Bar Chart

``` tracker
searchType: tag
searchTarget: weight
folder: examples/diary
startDate: 2021-01-01
endDate: 2021-01-05
bar:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    yMin: 0
    barColor: darkolivegreen
```

``` tracker
searchType: tag
searchTarget: weight
folder: examples/diary
startDate: 2021-01-01
endDate: 2021-01-31
bar:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    yMin: 0
    barColor: brown
```

``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2]
folder: examples/diary
startDate: 2021-01-10
endDate: 2021-01-21
bar:
    title: Sin Wave
    yAxisLabel: Value
    barColor: yellow, red, green
```

``` tracker
searchType: tag
searchTarget: sinsquare[0], sinsquare[1], sinsquare[2], sinsquare[3], sinsquare[4], sinsquare[5]
folder: examples/diary
startDate: 2021-01-01
endDate: 2021-01-05
bar:
    title: Sin Square Wave
    yAxisLabel: Value
    yMin: 0
    barColor: yellow, red, green, blue, orange, white
```

Please also check those search targets in markdown files under folder 'diary'.