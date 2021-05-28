# Test Bullet
Horizontal bullet chart
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
endDate: 2021-01-31
fixedScale: 1
bullet:
    title: "Clean Up"
	dataset: 0
    orientation: horizontal
	range: 10, 20, 30
	rangeColor: '#ccc, #ddd, #eee'
	value: "{{lastBreaks}}"
	valueColor: steelblue
	showMark: false
	markerValue: 20
	markerColor: black
```

Vertical bullet chart
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
endDate: 2021-01-31
bullet:
    title: "Clean Up"
	dataset: 0
    orientation: vertical
	range: 10, 20, 30
	rangeColor: '#ccc, #ddd, #eee'
	value: "{{lastBreaks}}"
	valueColor: steelblue
	showMark: false
	markerValue: 20
	markerColor: black
```