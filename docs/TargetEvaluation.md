# Target Evaluation

According to the [input parameters](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md) you provided, the search target will be counted or evaluated as a value. Obsidian-tracker supports four kinds of searchType: 'tag', 'frontmatter', 'wiki', and 'text', dealing with different types of searching condition.

## tag

Simple tags in the format of '*#tagName*' in the file content are evaluated as a constant value (default value 1.0). You can override the value by assigning the key '**constValue**' in the code block. Use the tag name (the name after #) as the value of key '**searchTarget**' or use quoted tag ('**#tagName**') to make it work.

For tags in frontmatter (e.g. tags: meditation), it works like simple tags and will be evaluated as a constant value. For example, 
---
tags: tagName1, tagName2
---
Set '**searchTarget**' to tagName1 or tagName2 will make the plugin do his work.

In your content, a value can be attached to the tag in the format of '*#tagName:value*'. Note the value should be appended right after your tag and an extra colon without spaces. If a value is attached this way, the obsidian-tracker will automatically use the provided value instead of the constant one. 

Nested tags with values attached could be useful for tracking children's data separately and also still see the overall merged data using parent tags.

If you don't want value-attached tags in your content, you can use the '**frontmatter**' as your searchType.

## frontmatter
This search type is used to query the key-value pairs in the front matter. If you don't want these values been seen in your article, the front matter would be the best place to record. For example,
---
mood: 10
---

## wiki
This search type helps you count wiki links in articles. For example,
[[A]]
[[B|Link to B]]

## text
searchType 'text' is the most powerful one among all. If you simply provide text like 'love', the number of occurrences of tags will be counted. You can provide a regular expression to search for a very complicated target by wrapping it in single quotes. If you want to retrieve a value from it, use the group name in the expression. To see more detail, see [this case](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TrackUsingRegex.md).

Multiple values in text search can be achieved by separate regex by comma and wrap them all in single quotes as follows:
\`\`\` tracker
searchTarget: 'regex1, regex2'
\`\`\`

## dvField
From version 1.5.0, the plugin supports retrieving inline fields used with the dataview plugin. To get "targetName:: value" in your article, try the following tracker settings.
\`\`\` tracker
searchType: dvField
searchTarget: targetName
......
\`\`\`

If you have multiple values in field, like "targetName:: 123 @ 456", use the following tracker settings.
\`\`\` tracker
searchType: dvField
searchTarget: targetName[0], targetName[1]
separator: '@'
......
\`\`\`

More dvField example can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestMultipleTargetsMultipleValues.md#multiple-values-in-text). 

## table
This search type is a special one because it does not search over files in the specified folder. Instead, it looks into a given file, finds the specified table, and retrieves data from specified columns. Here is an example,

\`\`\` tracker
searchType: table
searchTarget: data/Tables[0][0], data/Tables[0][1], data/Tables[0][2]
xDataset: 0
line:
    yAxisLocation: none, left, right
    lineColor: none, yellow, red
    showLegend: true
\`\`\`

In this case, "data/Tables" is the path of the file of interest.  The number in the first brackets after the path ([0]) is the index of the table of interest in the file, starts from 0. And the number in the second brackets is the index of the column containing target data. If there are multiple values in table cells, you can provide a third index to identify them.

More table examples can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTable.md).