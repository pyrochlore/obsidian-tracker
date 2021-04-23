# Target Evaluation

According to the [input parameters](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md), the provided search target will be counted or evaluated as a value. Obsidian-tracker supports four kinds of searchType: 'tag', 'frontmatter', 'wiki', and 'text', dealing with different types of searching condition.

## tag

Simple tags in the format of '*#tagName*' in the file content are evaluated as a constant value (default value 1.0). You can override the value by assigning the key '**constValue**' in the code block. Use the tag name (the name after #) as the value of key '**searchTarget**' or use quoted tag ('**#tagName**') to make it work.

For tags in frontmatter (e.g. tags: meditation), it works like simple tags and will be evaluated as a constant value. For example, 
```
tags: tagName1, tagName2
```
Set '**searchTarget**' to tagName1 or tagName2 will make the plugin do his work.

In your content, a value can be attached to the tag in the format of '*#tagName:value*'. Note the value should be appended right after your tag and an extra colon without spaces. If a value is attached this way, the obsidian-tracker will automatically use the provided value instead of the constant one. 

Nested tags with values attached could be useful for tracking children's data separately and also still see the overall merged data using parent tags.

If you don't want value-attached tags in your content, you can use the '**frontmatter**' target.

## frontmatter
This search type is used to query the key-value pairs in the front matter. If you don't want these values been seen in your article, the front matter would be the best place to record. For example,
```
mood: 10
```

## wiki
This search type helps you count wiki links in articles.

## text
searchType 'text' is the most powerful one among all. If you simply provide text like 'love', the number of occurrences of tags will be counted. You can provide a regular expression to search for a very complicated target by wrapping it in single quotes. If you want to retrieve a value from it, use the group name in the expression. To see more detail, see [this case](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TrackUsingRegex.md).