# Test Table
Use first column as X dataset and others as Y values
``` tracker
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][1], data/Tables[0][2]
xDataset: 0
line:
	yAxisLocation: none, left, right
	lineColor: none, yellow, red
	showLegend: true
```

Use first column as X dataset. Second column posses multiple values in each cell.
``` tracker
searchType: table
searchTarget: data/Tables[1][0], data/Tables[1][1][0], data/Tables[1][1][1]
xDataset: 0
multipleValueSeparator: "@"
line:
	yAxisLocation: none, left, right
	lineColor: none, yellow, red
	showLegend: true
```