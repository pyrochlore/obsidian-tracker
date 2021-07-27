# Test Bullet

## Manual Input Data

Manual input `value` as 12\.5
``` tracker
searchType: tag
searchTarget: clean-up
folder: diary
endDate: 2021-01-31
fixedScale: 1.1
bullet:
    title: "Clean Up"
    dataset: 0
    orientation: horizontal
    range: 10, 20, 40
    rangeColor: darkgray, silver, lightgray
    value: 12.5
    valueUnit: times
    valueColor: '#69b3a2'
    showMarker: true
    markerValue: 30
    markerColor: black
```

## Data from Notes

Horizontal bullet chart
value from expression function currentBreaks()
``` tracker
searchType: tag
searchTarget: clean-up
folder: diary
endDate: 2021-01-31
fixedScale: 1.1
bullet:
    title: "Clean Up"
    dataset: 0
    orientation: horizontal
    range: 10, 20, 40
    rangeColor: darkgray, silver, lightgray
    value: "{{currentBreaks()}}"
    valueUnit: times
    valueColor: '#69b3a2'
    showMarker: true
    markerValue: 24
    markerColor: black
```

Vertical bullet chart
value from expression function sum()
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
endDate: 2021-01-31
bullet:
    title: "Meditation"
    dataset: 0
    orientation: vertical
    range: 30, 60, 100
    rangeColor: darkgray, silver, lightgray
    value: "{{sum()}}"
    valueUnit: times
    valueColor: steelblue
    showMarker: true
    markerValue: 80
    markerColor: red
```

Please also check those search targets in markdown files under folder 'diary'.