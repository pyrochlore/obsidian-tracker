# Test Multiple Targets and Multiple Values

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
	showLegend: false
```