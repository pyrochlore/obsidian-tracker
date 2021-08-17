# Test Specified Files

## Collect Data from the Specified Files Only
``` tracker
searchType: frontmatter, dvField
searchTarget: date, dataviewTarget
xDataset: 0
file: data/data1, data/data2, data/data3
specifiedFilesOnly: true
line:
```

## Collect Data from the Linked Files Only
Count the MTG mana cost in linked files
``` tracker
searchType: fileMeta, text
searchTarget: 'cDate, {R}, {G}, {B}'
fileContainsLinkedFiles: data/MTG-Deck-1
specifiedFilesOnly: true
xDataset: 0
pie:
    label: '{{sum(dataset(1))::i}},{{sum(dataset(2))::i}}, {{sum(dataset(3))::i}}'
    data: '{{sum(dataset(1))}},{{sum(dataset(2))}}, {{sum(dataset(3))}}'
	dataColor: red, green, blue
```