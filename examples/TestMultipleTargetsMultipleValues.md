# Test Multiple Targets and Multiple Values

## Data from Different Value-attached Tags
Put value-attached tag data of weight and exercise-push together
``` tracker
searchType: tag
searchTarget: weight, exercise-pushup
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
datasetName: Weight, Pushup
line:
    title: Multiple Targets
    lineColor: yellow, red
    yAxisLocation: left, right
    yAxisLabel: Weight, Count
    showLegend: true
```

## Multiple Values from a Single Multiple-values-attached Tag
Retrieve a single value from a multiple-values-attached tag
``` tracker
searchType: tag
searchTarget: sin[0]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow
    showLegend: false
```

Retrieve values from a multiple-values-attached tag
``` tracker
searchType: tag
searchTarget: sin[0], sin[1], sin[2], sin[3], sin[4], sin[5], sin[6], sin[7], sin[8]
folder: diary
datasetName: Sin1, Sin2, Sin3, Sin4, Sin5, Sin6, Sin7, Sin8, Sin9
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
    showPoint: false
    showLegend: true
    legendPosition: right
    legendOrientation: vertical
```

## Multiple Values from Frontmatter
Multiple values separated by slash (/)
``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
folder: diary
datasetName: systolic, diastolic
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Multiple values separated by comma (,)
``` tracker
searchType: frontmatter
searchTarget: bloodpressure1[0], bloodpressure1[1]
folder: diary
datasetName: systolic, diastolic
startDate: 2021-01-01
endDate: 2021-01-31
separator: comma
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Values from array
``` tracker
searchType: frontmatter
searchTarget: bloodpressure2[0], bloodpressure2[1]
folder: diary
datasetName: systolic, diastolic
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Values from nested keys
``` tracker
searchType: frontmatter
searchTarget: bp.systolic, bp.diastolic
folder: diary
datasetName: systolic, diastolic
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

## Multiple Values in Text
Use searchType 'dvField' with separators in the target instead
``` tracker
searchType: text
searchTarget: 'dataviewTarget2::\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)\s+@\s+([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+), dataviewTarget2::\s+([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)\s+@\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Dataview Data
    yAxisLabel: Count
    lineColor: red, yellow
    yMin: 0
```


## Multiple Values in dvField (Dataview inline field)
Extract the first value in dataview inline field
``` tracker
searchType: dvField
searchTarget: dataviewTarget1[0]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
```

Multiple Values in dataview inline field
``` tracker
searchType: dvField
searchTarget: dataviewTarget1[0], dataviewTarget1[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: green, red
```

Multiple values seprated by 'comma'
``` tracker
searchType: dvField
searchTarget: dataviewTarget3[0], dataviewTarget3[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
separator: comma
line:
    title: dvField
    lineColor: green, red
```

Use custom multiple value separator
``` tracker
searchType: dvField
searchTarget: dataviewTarget2[0], dataviewTarget2[1]
separator: '@'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: green, red
```

## Multiple Values in Table

Use first column as X dataset. Second column posses multiple values in each cell.
``` tracker
searchType: table
searchTarget: data/Tables[1][0], data/Tables[1][1][0], data/Tables[1][1][1]
xDataset: 0
separator: "@"
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
```

Please also check those search targets in markdown files under folder 'diary' and 'data'.
