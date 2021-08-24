# Test dvField

Simple inline field
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: green
```

Field with a space
``` tracker
searchType: dvField
searchTarget: Make Progress
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: yellow
```

Field with a dash line
``` tracker
searchType: dvField
searchTarget: Make-Progress
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: red
```

Extract the first value from multiple values
``` tracker
searchType: dvField
searchTarget: dataviewTarget1[0]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: blue
```

Multiple values separated by '/' (default)
``` tracker
searchType: dvField
searchTarget: dataviewTarget1[0], dataviewTarget1[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: green, red
```

Multiple values seprated by 'comma'
``` tracker
searchType: dvField
searchTarget: dataviewTarget3[0], dataviewTarget3[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
separator: 'comma'
line:
    title: dvField
    lineColor: green, red
```

Multiple values seprated by '\,'
``` tracker
searchType: dvField
searchTarget: dataviewTarget3[0], dataviewTarget3[1]
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
separator: '\,'
line:
    title: dvField
    lineColor: green, red
```

Use custom multiple value separator
``` tracker
searchType: dvField
searchTarget: dataviewTarget2[0], dataviewTarget2[1]
separator: '@'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: dvField
    lineColor: green, red
```

Please also check those search targets in markdown files under folder 'diary'.