# Target Evaluation
If the assigned '**searchType**' is '**tag**', tags in your daily notes will be counted and evaluated. You should use the tag name (the name after #) as the value of key '**searchTarget**' or use quoted tag ('**#tagName**') to make it work.

A simple tag is a tag in the format of '*#tagName*'. They will be evaluated as a constant value (default value 1.0). You can change the value by assigning the key '**constValue**' in the code block.

The unique feature in the obsidian-tracker is to identify the value-attached tag. Users can attach a value after the tag in the format of '*#tagName:value*'. Note the value should be appended right after your tag and an extra colon without spaces. If a value is attached this way, the obsidian-tracker will use the provided value instead of the constant one. 

Nested tags are also supported. One can use them to track parent-tag and children-tags separately. It's worth noting that frontmatter tags are also included but can only be treated as simple tags. Currently, Obsidian will treat tags with different values as different tags.

If the assigned '**searchType**' is '**text**', texts will be counted and simply evaluated by occurrence.