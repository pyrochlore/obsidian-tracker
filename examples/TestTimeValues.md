# Test Time Values

## From frontmatter
Clock-In & Clock-Out from front matter
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
    showLegend: true
```

Sleep time separated by / from front matter
``` tracker
searchType: frontmatter
searchTarget: sleep[0], sleep[1]
endDate: 2021-01-15
folder: diary
valueShift: -24:00, 00:00
datasetName: Sleep, WakeUp
line:
    title: "Sleep"
    yAxisLabel: "Time (24h)"
    lineColor: yellow, red
    showPoint: true
    showLegend: true
```

## From dvField
Clock-In & Clock-Out from dvField
time granularity to one second
``` tracker
searchType: dvField
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
    showLegend: true
```

Sleep time separated by / from dvField
``` tracker
searchType: dvField
searchTarget: sleep[0], sleep[1]
endDate: 2021-01-15
folder: diary
valueShift: -24:00, 00:00
datasetName: Sleep, WakeUp
line:
    title: "Sleep"
    yAxisLabel: "Time (24h)"
    lineColor: yellow, red
    showPoint: true
    showLegend: true
```

Please also check those search targets in markdown files under folder 'diary'.