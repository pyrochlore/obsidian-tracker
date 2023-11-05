# Test X Dataset

Use file created dates (cDate) as x values
``` tracker
searchType: fileMeta, dvField
searchTarget: cDate, dataviewTarget
xDataset: 0
folder: data
line:
    fillGap: true
```

Use dates from front matter as x values
``` tracker
searchType: frontmatter, dvField
searchTarget: date, dataviewTarget
xDataset: 0
folder: data
line:
    title: Dataview Inline Field
    fillGap: true
```

Use dates from date-attached tags as x values
``` tracker
searchType: tag, dvField
searchTarget: date, dataviewTarget
xDataset: 0
folder: data
line:
    title: Dataview Inline Field
    fillGap: true
```

Use dates from Dataview inline fields as x values
``` tracker
searchType: dvField, dvField
searchTarget: date, dataviewTarget
xDataset: 0
folder: data
line:
    title: Dataview Inline Field
    fillGap: true
```

Use dates from formatted text as x values
``` tracker
searchType: text, dvField
searchTarget: 'Today\sis\s(?<value>([0-9]{4})-([0-9]{2})-([0-9]{2})), dataviewTarget'
xDataset: 0
folder: data
line:
    title: Dataview Inline Field
    fillGap: true
```

Please also check those search targets in markdown files under folder 'data'.
