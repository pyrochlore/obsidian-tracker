# Error Messages

## YAML
Error parsing caused by the escaping character YAMLParsError: Missing closing "quote"
``` tracker
searchType: tag
searchTarget: "\"
line:
```

'searchTypes' --> typo
'searchType' --> correct
``` tracker
searchTypes: tag
searchTarget: weight
line:
```

'searchTargets' --> typo
'searchTarget' --> correct
``` tracker
searchType: tag
searchTargets: weight
line:
```

'lines' --> typo
'line' --> correct
``` tracker
searchType: tag
searchTarget: weight
lines:
```

Missing tracker block identifier, no error message though.
```
searchType: tag
searchTarget: weight
line:
```

## searchTarget
Missing searchTarget
``` tracker
searchType: tag
searchTarget: 
line:
```

Invalid searchTarget, '#' is a special character to YAML, use single quotes to wrap it
``` tracker
searchType: tag
searchTarget: #weight 
line:
```

## Folder
Folder not exists
``` tracker
searchType: tag
searchTarget: weight
folder: abc
line:
```

## Files
No file in folder
``` tracker
searchType: tag
searchTarget: weight
folder: empty
line:
```

## Number of parameters
Two search targets provided, the number of search types shouldn't be more than two.
``` tracker
searchType: frontmatter, frontmatter, frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
line:
```

yAxisLabel allows only two inputs
``` tracker
searchType: frontmatter, frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
line:
    yAxisLabel: BP1, BP2, BP3
```

## startDate & endDate
The format of startDate or endDate does not match dateFormat in the plugin settings. Change the settings or Add a dateFormat parameter into YAML.
``` tracker
searchType: tag
searchTarget: weight
startDate: 2020-01-01_Fri
endDate: 2020-01-31_Mon
line:
```

We don't have thirty days in February
``` tracker
searchType: tag
searchTarget: weight
startDate: 2021-02-01
endDate: 2021-02-30
line:
```

## X Values (Dates)
No note found in the given date range
``` tracker
searchType: tag
searchTarget: weight
startDate: 2020-01-01
endDate: 2020-01-31
line:
```

No valid X values, add "xDataset: 0" to fix it
``` tracker
searchType: fileMeta, dvField
searchTarget: cDate, dataviewTarget
folder: data
line:
    fillGap: true
```

## Y Values
No valid Y values!!!!!
Use parameter `textValueMap` to map a text to a value.
``` tracker
searchType: frontmatter
searchTarget: randchar
folder: diary
line:
    fillGap: true
```

## Output
No output type provided, choose 'line', 'bar', or 'summary'.
``` tracker
searchType: tag
searchTarget: weight
``` 

## Line Chart
The Parameter 'lineColor' allows only one input for the single target
``` tracker
searchType: tag
searchTarget: weight
line:
    title: Line
    lineColor: red, yellow
``` 

The parameter name should be 'title', not 'titles'
``` tracker
searchType: frontmatter, frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
line:
    titles: "Blood Pressure"
``` 

## Table
All dates are invalid, leads to an error message
``` tracker
searchType: table
searchTarget: data/Tables[4][0], data/Tables[4][1]
xDataset: 0
line:
    lineColor: none, yellow
```


Please also check those search targets in markdown files under folder 'diary' and 'data'.

## Expression
Unknown function
``` tracker
searchType: task
searchTarget: Say I love you
summary:
    template: '{{unknown()}}'
```

Incomplete expression
``` tracker
searchType: task
searchTarget: Say I love you
summary:
    template: '{{1+}}'
```

No dataset found for id
``` tracker
searchType: task
searchTarget: Say I love you
summary:
    template: '{{sum(dataset(1))}}'
```

Divide by zero
``` tracker
searchType: task
searchTarget: Say I love you
summary:
    template: '{{sum()/0}}'
```

Invalid data range (data only contains 1 and null)
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
summary:
    template: '{{sum(normalize(dataset(0)))}}'
```

## Deprecated
### Deprecated template variables

Deprecated template variable
``` tracker
searchType: task
searchTarget: Say I love you
summary:
    template: '{{sum}}'
```

