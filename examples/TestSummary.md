# Test Summary

## Multiple Lines
Accept multitple lines by using a line break '\n' in between

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
    style: "font-size:32px;fill:none;stroke-width:0.5;stroke:yellow"
```

## Multiple Summaries

``` tracker
searchType: text
searchTarget: ⭐
folder: diary
summary:
    template: "I have {{sum()}} stars in total."
    style: "font-size:20px;color:yellow;margin-left: 50px;margin-top:00px;"
summary1:
    template: "I have {{sum()}} stars in total."
    style: "font-size:20px;color:yellow;margin-left: 50px;margin-top:00px;"
```

## Using Expressions

Please check [expression examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md) for more examples.