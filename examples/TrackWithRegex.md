# Track Text with Regular Expression

**Important**!!
Use single quotes to wrap the regular expression, or use double quotes with all back slashes (escape characters) duplicated

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
```

## Count Values
### Weightlifting Tracker 
Track text in format "weightlifting: 10".
[Regex for searching value-attached texts](https://regex101.com/r/eCWpgS/2)
``` tracker
searchType: text
searchTarget: 'weightlifting: (?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
	title: Weight Lifting
	yAxisLabel: Count
	lineColor: yellow
```