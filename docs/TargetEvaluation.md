# Target Evaluation

From the [input parameters](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md) you provided, the search targets dispersed in the notes will be counted or evaluated as a value. Tracker plugin supports eight kinds of `searchType`: `tag`, `frontmatter`, `wiki`, `text`, `table`, `dvField`, `task`, and `fileMeta`, dealing with different types of searching condition.

## Multiple Targets
You can provide multiple search targets in code block by entering an array of targets separated by a comma under parameter `searchType` and `searchTarget`. Each of the targets will be identified in order and then the  values in notes will be evaluated and form a dataset indexed by that order in the array (zero-based indexing).

```
searchTarget: target0, target1, target2, ...... 
searchType: type0, type1, type2, .....
datasetName: dataset0, dataset1, dataset2, ......
line:
    lineColor: red, blue, yellow
```

Above is an example of multiple targets searching. In the code block, multiple targets are provided and separated by a comma. If they have a different searchType, provide the same number of types in the same order. In this case, the second search target 'target1' with index 1 has type 'type1' and name 'dataset1'. 

Many other parameters that accept multiple values (e.g. lineColor) can also be provided and the value given will be applied to the corresponding dataset.

## Multiple Values

Multiple values under a target (value tuple) separated by a slash, e.g. #bloodpressure:180/120mmHg, are supported after version 1.3.0. To identify a specific value as a target, use an accessor with bracket notation where the value in the bracket is the index by the order of values. In this case, they are bloodpressure[0] and bloodpressure[1]. You can find the example of this [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md). You can also use a custom separator by using the parameter `separator`.

## Search Target in Detail

### searchType: tag

Simple tags in the format of '*#tagName*' in the file content are evaluated as a constant value (default value 1.0). You can override the value by assigning the key `constValue` in the code block. Use the tag name (the name after #) as the value of key `searchTarget` or use quoted tag (`#tagName`) to make it work.

For tags in frontmatter (e.g. tags: meditation), it works like simple tags and will be evaluated as a constant value. For example, 

\-\-\-<br>
tags: tagName1, tagName2<br>
......<br>
\-\-\-<br>

Set `searchTarget` to tagName1 or tagName2 will make the plugin do its work.

In your content, a value can be attached to the tag in the format of '*#tagName:value*'. Note the value should be appended right after your tag and an extra colon **without spaces**. If a value is attached this way, the obsidian-tracker will automatically use the provided value instead of the constant one. 

Nested tags with values attached could be useful for tracking children's data separately and also still see the overall merged data using parent tags.

If you don't want value-attached tags in your content, you can also put data in front matter and use `frontmatter` as your searchType.

### searchType: frontmatter

This search type is used to query the key-value pairs in the front matter. If you don't want these values been seen in your article, the front matter would be the best place to record. For example,

\-\-\-<br>
mood: 10<br>
......<br>
\-\-\-<br>

### searchType: wiki
This search type helps you count wiki links in articles. For example,
[[A]]
[[B|Link to B]]

### searchType: text
searchType `text` is the most powerful one among all. If you simply provide text like 'love', the number of occurrences of tags will be counted. You can provide a regular expression to search for a very complicated target by wrapping it in single quotes. If you want to retrieve a value from it, use the group name in the expression. To see more detail, see [this case](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestRegex.md).

Multiple values in text search can be achieved by separate regex by comma and wrap them all in single quotes as follows:

```
searchTarget: 'regex1, regex2'
......
```

### searchType: dvField

Tracker supports retrieving inline fields used with the dataview plugin. To get "targetName:: value" in your article, try the following tracker settings.

```
searchType: dvField
searchTarget: targetName
......
```

If you have multiple values in field, like "targetName:: 123 @ 456", use the following tracker settings.
<br>
```
searchType: dvField
searchTarget: targetName[0], targetName[1]
separator: '@'
......
```

More dvField example can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestMultipleTargesMultipleValues.md#multiple-values-in-dvfield-dataview-inline-field). 

### searchType: table

This search type is very much different from others because it does not search over files in the specified folder. Instead, it looks into a given file, finds the specified table, and retrieves data from specified columns. Here is an example,

```
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][1], data/Tables[0][2]
xDataset:
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
    showLegend: true
```

In this case, "data/Tables" is the path of the file of interest.  The number in the first brackets after the path ([0]) is the index of the table of interest in the file, starts from 0. And the number in the second brackets is the index of the column containing target data. If there are multiple values in table cells, you can provide a third index to identify them.

More table examples can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTable.md).

### searchType: fileMeta

With this search type, you can retrieve infomation of files. Currently, three kinds of data you can get.

- cDate: creation date of a file
- mDate: last modification date of a file
- size: file size in bytes
- numWords: number of words in a file
- numChars: number of characters in a file (including spaces)
- numSentences: number of setences in a file

`cData` and `mDate` can be used as X dataset and `size` can be used as Y dataset.

### searchType: task

You can retrieve infomation from tasks by using `searchType` `task`.
The provided `searchTarget` will limit the result with task's contents match the input.

Using type `task` or `task.all` will get you all tasks no matter it is done or not.
To get task done, use `task.done`. By contrast, use `task.notdone`.
