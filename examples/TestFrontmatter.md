# Test Frontmatter

## Deep Values
deepValue:
    very:
	    very:
		    very:
			    very: 
				    very:
					    deep: 27.4
``` tracker
searchType: frontmatter
searchTarget: deepValue.very.very.very.very.very.deep
folder: diary
endDate: 2021-01-31
line:
    title: Deep Values
```

## Multiple Values
bloodpressure: 184.4/118.8
``` tracker
searchType: frontmatter
searchTarget: bloodpressure[0], bloodpressure[1]
datasetName: systolic, diastolic
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
line:
    title: Blood Pressures
    yAxisLabel: BP
    yAxisUnit: mmHg
    lineColor: yellow, red
    showLegend: true
    legendPosition: bottom
```

Please also check those search targets in markdown files under folder 'diary'.