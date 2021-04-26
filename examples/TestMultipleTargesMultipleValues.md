# Test Multiple Targets and Multiple Values

``` tracker
searchType: tag
searchTarget: sin-tag[0]
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
searchTarget: sin-tag[0], sin-tag[1], sin-tag[2], sin-tag[3], sin-tag[4], sin-tag[5], sin-tag[6], sin-tag[7], sin-tag[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Sin Wave
    lineColor: yellow, blue, white, red, black, orange, purple, green, cyan
	showPoint: false
	showLegend: false
```