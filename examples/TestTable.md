# Test Table

## Line Chart
Use first column as X dataset , and second and third columns as Y values
``` tracker
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][1], data/Tables[0][2]
xDataset: 0
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
    showLegend: true
```

Use first column as X dataset , and third and forth columns as Y values
``` tracker
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][2], data/Tables[0][3]
xDataset: 0
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
    showLegend: true
    legendPosition: right
```

Use first column as X dataset. Second column posses multiple values in each cell.
``` tracker
searchType: table
searchTarget: data/Tables[1][0], data/Tables[1][1][0], data/Tables[1][1][1]
xDataset: 0
separator: "@"
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
    showLegend: true
    legendPosition: right
```

### Tables with Defects
``` tracker
searchType: table
searchTarget: data/Tables[2][0], data/Tables[2][1]
xDataset: 0
line:
    lineColor: none, yellow
```

Wrong date format in Table
``` tracker
searchType: table
searchTarget: data/Tables[3][0], data/Tables[3][1]
xDataset: 0
line:
    lineColor: none, yellow
```

## Month View

``` tracker
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][1], data/Tables[0][2], data/Tables[0][3]
xDataset: 0
datasetName: null, Jeffrey, Lucas, Anne
month:
    startWeekOn: 'Sun'
    threshold: 0, 62.2, 20.8, 18.2
    color: green
    headerMonthColor: orange
    dimNotInMonth: false
    todayRingColor: orange
    selectedRingColor: steelblue
    circleColorByValue: true
    showSelectedValue: true
```

Please also check those search targets in markdown file /data/Tables.
