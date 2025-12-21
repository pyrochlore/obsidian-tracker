# Test Frontmatter

## Deep Values
deepValue:
    very:
        very:
            very:
                very: 
                    very:
                        deep: 27.4
``` tracker
searchType: frontmatter
searchTarget: deepValue.very.very.very.very.very.deep
folder: diary
endDate: 2021-01-31
line:
    title: Deep Values
```

## Multiple Values
bloodpressure: 184.4/118.8
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

## Multiple Tags in Front Matter
Extract data of one tag from multiple tags
The default separator in front matter tags is comma (,)
``` tracker
searchType: tag
searchTarget: work_log
folder: diary
accum: true
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Work Log
    yAxisLabel: Count
    pointSize: 5
    pointColor: white
    pointBorderWidth: 2
    pointBorderColor: "#d65d0e"
```

Use the data of two tags
The default separator in front matter tags is comma (,)
``` tracker
searchType: tag
searchTarget: work_log, work_log2
folder: diary
datasetName: Work1, Work2
month:
    initMonth: 2021-01
```

## Track Field Existence (frontmatter.exists)

Track days when a frontmatter field exists and is non-empty, regardless of the value. This is useful for habit tracking where you just need to know if something happened.

``` tracker
searchType: frontmatter.exists
searchTarget: meditation
datasetName: Meditation Days
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    mode: circle
```

This will count each day where the `meditation` field exists in the frontmatter, whether it's `meditation: yes`, `meditation: completed`, `meditation: true`, or any other non-empty value.

Please also check those search targets in markdown files under folder 'diary'.