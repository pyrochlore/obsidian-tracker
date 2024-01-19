# Test Summary

## Multiple Lines

``` tracker
searchType: tag
searchTarget: weight
folder: diary
summary:
    template: "Minimum: {{min()}}kg\nMaximum: {{max()}}kg\nMedian: {{median()}}kg\nAverage: {{average()}}kg"
```

## Styling

``` tracker
searchType: text
searchTarget: ⭐
folder: diary
summary:
    template: "I have {{sum()}} stars in total."
    style: "font-size:20px;color:yellow;margin-left: 50px;margin-top:00px;"
```

``` tracker
searchType: frontmatter
searchTarget: sleptwell
folder: diary
summary:
    template: "I once slept well for {{maxStreak()::i}} days in a row!"
```
## Using Expressions

Please check [expression examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md) for more examples.