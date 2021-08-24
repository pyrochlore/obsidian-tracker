# Search Text using Regular Expression

**Important**!!
1. Use single quotes to wrap the regular expression, or use double quotes with all back slashes (escape characters) duplicated.
2. You can make your own expression, or find a suitable one from website like [regex101](https://regex101.com).
3. Use a named group "(?\<value\>XXXXXX)" in your expression if you need values be retrieved from text.

## Count Occurencies (No Value)
### Occurencies of Email
[Regex for searching simple emails](https://regex101.com/library/mF3pK7)
``` tracker
searchType: text
searchTarget: '.+\@.+\..+'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Email Occurencies
    yAxisLabel: Count
    lineColor: yellow
    yAxisTickInterval: 1.0
    yAxisTickLabelFormat: i
    yMin: 0
    yMax: 5
```

``` tracker
searchType: text
searchTarget: '.+\@.+\..+'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
summary:
    template: "Total number of emails found: {{sum()::i}}"
    style: "font-size:20px;color:red;margin-left: 50px;margin-top:00px;"
```

## Count Values
### Weightlifting Tracker 
Track text in format "weightlifting: 10".
[Regex for searching value-attached texts](https://regex101.com/r/eCWpgS/2)
``` tracker
searchType: text
searchTarget: 'weightlifting:\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Weight Lifting
    yAxisLabel: Count
    lineColor: yellow
```

### Dataview Compatible Tracker
Use searchType 'dvField' instead
``` tracker
searchType: text
searchTarget: 'dataviewTarget::\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Dataview Data
    yAxisLabel: Count
    lineColor: red
    yMin: 0
```

Use searchType 'dvField' with separators in the target instead
``` tracker
searchType: text
searchTarget: 'dataviewTarget2::\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)\s+@\s+([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+), dataviewTarget2::\s+([\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)\s+@\s+(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Dataview Data
    yAxisLabel: Count
    lineColor: red, yellow
    yMin: 0
```


Please also check those search targets in markdown files under folder 'diary'.
