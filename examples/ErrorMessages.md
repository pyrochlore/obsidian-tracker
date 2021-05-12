# Error Messages
## YAML
Error from escaping character
``` tracker
searchType: tag
searchTarget: "\"
line:
```

Typo for keys
``` tracker
searchTypes: tag
searchTarget: weight
line:
```

``` tracker
searchType: tag
searchTargets: weight
line:
```

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

## Target
Missing target
``` tracker
searchType: tag
searchTarget: 
line:
```

Invalid target, '#' is not allowed
``` tracker
searchType: tag
searchTarget: #weight 
```

## Folder
Invalid folder
``` tracker
searchType: tag
searchTarget: weight
folder: abc
```

## Date
startDate or endDate not match to the dateFormat
``` tracker
searchType: tag
searchTarget: weight
startDate: 2020-01-01
endDate: 2020-01-31
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

No notes found in given range
``` tracker
searchType: tag
searchTarget: weight
startDate: 2020-01-01
endDate: 2020-01-31
line:
```

## Number of parameters
Two search targets provided, number of search types should not more than two.
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

## Output
No output type provided, choose line, bar, or summary
``` tracker
searchType: tag
searchTarget: weight
``` 

## Line Chart
The Parameter lineColor allows only one input for the single target
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

