# Test Multiple Targets and Multiple Values

## Multiple Targets
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

## Multiple Values in a Tag
Retrieve single value from multiple values tuple
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

Retrieve multiple values
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
    legendOrientation: vertical
```

## Multiple Values in Frontmatter
Values separated by slash (/)
``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Values separated by comma (,)
``` tracker
searchType: frontmatter
searchTarget: bloodpressure1[0], blood-pressure1[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Values from array
``` tracker
searchType: frontmatter
searchTarget: bloodpressure2[0], blood-pressure2[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

Values in nested parameters
``` tracker
searchType: frontmatter
searchTarget: blood-pressure[0], blood-pressure[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressure
    lineColor: yellow, red
    showLegend: true
```

## Multiple Values in Text



## Multiple Values in dvField (Dataview inline field)
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

Use custom multiple value separator
``` tracker
searchType: dvField
searchTarget: dataviewTarget2[0], dataviewTarget2[1]
multipleValueSeparator: '@'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
	lineColor: green, red
```