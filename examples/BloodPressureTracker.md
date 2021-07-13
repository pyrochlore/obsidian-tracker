

# Blood Pressure Tracker

``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
datasetName: systolic, diastolic
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressures
    yAxisLabel: BP
    yAxisUnit: mmHg
    lineColor: yellow, red
    showLegend: true
    legendPosition: bottom
```

``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
datasetName: systolic, diastolic
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
summary:
    template: "Average: {{average(dataset(0))}}/{{average(dataset(1))}}"
```

``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
datasetName: systolic, diastolic
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressures
    yAxisLabel: Systolic, Diastolic
    yAxisUnit: mmHg
    yMin: 150, 110
    yMax: 190, 125
    yAxisLocation: left, right
    yAxisColor: yellow, red
    yAxisLabelColor: yellow, red
    lineColor: yellow, red
    showLegend: true
    legendPosition: right
```

Please also check those search targets in markdown files under folder 'diary'.
