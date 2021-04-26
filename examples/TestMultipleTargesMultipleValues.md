# Test Multiple Targets and Multiple Values

``` tracker
searchType: tag
searchTarget: crazy-tag[0]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Crazy Tags
    yAxisLabel: Crazy Value
    lineColor: yellow
	showLegend: false
```

``` tracker
searchType: tag
searchTarget: crazy-tag[0], crazy-tag[1], crazy-tag[2], crazy-tag[3], crazy-tag[4], crazy-tag[5], crazy-tag[6], crazy-tag[7], crazy-tag[8]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Crazy Tags
    yAxisLabel: Crazy Value
    lineColor: yellow, blue, white, red, black, orange, purple, green
	showLegend: false
```