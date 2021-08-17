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

### dateFormat: YYYY-MM-DD_ddd
``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: 2021-01-01_Fri
endDate: 2021-01-05_Tue
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

## ISO-8601 Date Format

``` tracker
searchType: tag
searchTarget: weight
folder: diary
dateFormat: iso-8601
startDate: 2021-01-01T14:53:25+00:00
endDate: 2021-01-05T14:53:25+00:00
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

## Test Date Format Prefix and Suffix

The string provided in dateFormatPrefix and dateFormatSuffix will be removed before parsing dates.

### dateFormat: YYYYMMDD with prefix D-

``` tracker
searchType: tag
searchTarget: weight
folder: diary
dateFormat: YYYYMMDD
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
dateFormat: YYYYMMDD
dateFormatSuffix: -D
startDate: 20210101-D
endDate: 20210105-D
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

### Using prefix and suffix with regular expression

Examples of file name
- Jeffrey-20210101-Journal
- Jeffrey-20210102-Diary
- Lucas-2021-0103-Journal
- Lucas-2021-0104-Diary

Data from the same days will be summed up.
``` tracker
searchType: tag
searchTarget: exercise-pushup
folder: diary
dateFormat: YYYYMMDD
dateFormatPrefix: '(Jeffrey-|Lucas-)'
dateFormatSuffix: '(-Journal|-Diary)'
startDate: 20210101
endDate: 20210105
line:
    title: PushUp
    yAxisLabel: Count
    yAxisUnit: times
    lineColor: yellow
```

## Relative Date Input for startDate and endDate

The reference date of the relative date input is 'today' (The current date of your computer), So
- 0d ==> today
- -1d ==> yesterday
- -1w ==> last week
- -1M ==> last month
- -1y ==> last year

Notice!! 
- small 'm' represent 'minute'
- If the date range is less than 1 day, you will get the error message 'No valid date as X value found in notes'.

``` tracker
searchType: tag
searchTarget: weight
folder: diary
startDate: -1M
endDate: 0d
line:
    title: Weight Log
    yAxisLabel: Weight
    yAxisUnit: kg
    lineColor: yellow
```

Please also check those search targets in markdown files under folder 'diary'.
