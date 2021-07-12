# Test Pie Chart

``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
summary:
    template: "How many days I said love: {{sum(dataset(0))}}\nHow many days I didn't say love: {{sum(dataset(0) + dataset(0))}}"
```

<!--
## Manual Input Data
### Numbers
To be fixed,
If numeric data not wrapped by single quotes
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
pie:
    title: Pie
    data: '2, 4, 6, 8, 10'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

### Expression
To be fixed,
If numeric data not wrapped by single quotes
2,4,6,8,10
????? errro?????
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
pie:
    title: Pie
    data: '{{1 + 1}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

## Data from Notes
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
pie:
    title: Pie
    data: '{{sum(0)}},{{sum(1)}}'
    dataColor: '#4daf4a,#377eb8'
    ratioInnerRadius: 0.5
```


``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
summary:
    template: "How many days I said love: {{sum(0)}}\nHow many days I didn't say love: {{sum(1)}}"
```



