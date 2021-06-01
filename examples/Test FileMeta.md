# Test FileMeta
Track the size variation of diaries 
``` tracker
searchType: fileMeta
searchTarget: size
folder: diary
endDate: 2021-01-31
line:
    title: File Size Variation
	yAxisLabel: Size
	yAxisUnit: bytes
```

Use file created dates (cDate) as x values
``` tracker
searchType: fileMeta, dvField
searchTarget: cDate, dataviewTarget
xDataset: 0
folder: data
line:
    fillGap: true
```

Use date variables from front matter
``` tracker
searchType: frontmatter, dvField
searchTarget: date, dataviewTarget
xDataset: 0
folder: data
line:
    title: Dataview Inline Field
```


