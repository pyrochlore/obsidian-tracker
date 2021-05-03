# Test Date Formats


## Test Default Date Formats

Change the default dateFomat on Tracker settings panel and then check the following trackers in the preview mode. Only the one fit dateFomat settings will get rendered.

### dateFomat: YYYY-MM-DD

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01
endDate: 2021-01-05
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### dateFormat: D-YYYYMMDD

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 1-20210101
endDate: 5-20210105
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### dateFormat: YYYY-MM-DD-dddd

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01-Friday
endDate: 2021-01-05-Tuesday
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### dateFormat: DD-MM-YYYY

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 01-01-2021
endDate: 05-01-2021
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### dateFormat: DD.MM.YYYY

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 01.01.2021
endDate: 05.01.2021
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

## Test Date Format Prefix and Suffix

### dateFormat: YYYYMMDD with prefix D-

``` tracker
searchType: tag
searchTarget: weight
folder: diary
dateFormatPrefix: D-
startDate: D-20210101
endDate: D-20210105
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### dateFormat: YYYYMMDD with suffix -D

``` tracker
searchType: tag
searchTarget: weight
folder: diary
dateFormatSuffix: -D
startDate: 20210101-D
endDate: 20210105-D
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

