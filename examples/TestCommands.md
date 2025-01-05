# Test Commands

``` tracker
searchType: tag
searchTarget: weight
folder: /
startDate:
endDate: 2021-01-31
line:
    title: "Line Chart"
    xAxisLabel: Date
    yAxisLabel: Value
```


``` tracker
searchType: tag
searchTarget: weight
folder: /
startDate:
endDate: 2021-01-31
bar:
    title: "Bar Chart"
    xAxisLabel: Date
    yAxisLabel: Value
```


``` tracker
searchType: tag
searchTarget: weight
folder: /
startDate:
endDate: 2021-01-31
summary:
    template: "Average value of tagName is {{average()}}"
    style: "color:white;"
```