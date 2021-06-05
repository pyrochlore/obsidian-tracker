# YAML Related Issues

## Special characters

YAML special characters (e.g. #, [, ], ...) are not allowed for input values in code blocks. You need to wrap the whole input up by single quotes.

### Example 1 - Tag Search
If we have a bunch of tags (say #tagName) to track.
This will leads to 'Error parsing YAML' because of the # charactter.
```
searchType: tag
searchTarget: #tagName
```

Instead, wrapping the input by single quotes will do the work.
```
searchType: tag
searchTarget: '#tagName'
```

or simply
```
searchType: tag
searchTarget: tagName
```

### Example 2 - Hex Color Codes

Hex color codes must be wrapped in single quotes.
```
searchType: tag
searchTarget: weight
line:
    lineColor: '#F08080'
```

Wrap the whole input by single quotes.
```
searchType: tag
searchTarget: weight, push-up
line:
    lineColor: '#F08080, #008080'
```

### Example 3 - Text Search with Regex

If we want to track value-attached tags not matched the standard format of Tracker, for example, weightlifting: 20.5kg. We can use search type `text` with regular expression in `searchTarget`.
```
searchType: text
searchTarget: 'weightlifting:\s(?<value>[\-]?[0-9]+[\.][0-9]+|[\-]?[0-9]+)'
```
The whole input should be wrapped in single quotes because of the special characters.

## Array input
Tracker accepts two types of array input.

- YAML Array

A YAML array input can be represented as: ['value1', 'value2', 'value3']. 

- Value Separated by Comma

Use values separated by comma: value1, value2, value3
Or single quoted string: 'value1, value2, value3'

