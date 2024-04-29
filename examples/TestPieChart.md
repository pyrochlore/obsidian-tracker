# Test Pie Chart

Expressions could be used in parameter `data`, `label`, and `extLabel`.

## Manual Input Data

### Numbers as Data
Pie chart with labels showing percentages
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
pie:
    title: Pie Chart
    label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
    data: 2, 4, 6, 8, 10
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.0
```

### Arithmetic

Pie chart with labels showing percentages
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Arithmetic
    data: '{{1 + 1}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

### Legend

Use parameter `dataName` for the name on the legend
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Manual Input Data
    label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
    data: '2, 4, 6, 8, 10'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    dataName: Data1, Data2, Data3, Data4, Data5
    ratioInnerRadius: 0.5
    showLegend: true
    legendPosition: right
    legendOrientation: vertical	
```

### Default data colors
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
pie:
    title: Pie Chart
    label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
    data: 2, 4, 6, 8, 10
    ratioInnerRadius: 0.0
```

## Data from Notes

Using function dataset() to get Dataset then use function sum() to get the summation
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
datasetName: Done, NotDone
pie:
    title: Love is Action
    data: '{{sum(dataset(0))}},{{sum(dataset(1))}}'
    dataColor: '#4daf4a,#377eb8'
    label: Say👍,Not Say💔
    ratioInnerRadius: 0.3
```

Summary
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
summary:
    template: "How many days I said love: {{sum(dataset(0))::i}}\nHow many days I didn't say love: {{sum(dataset(1))::i}}"
```

## External Labels
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    label: '{{0.5/28.5*100}}%, {{4/28.5*100}}%, {{6/28.5*100}}%, {{8/28.5*100}}%, {{10/28.5*100}}%'
    extLabel: 'DataA {{0.5/28.5*100}}%, DataB, DataC, DataD, DataE'
    data: '0.5, 4, 6, 8, 10'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.6
```

1. Label for the first data was hidden because the fraction of it is too small (less than 0.03, 3%).
2. showExtLabelOnlyIfNoLabel was set to true, thus the external label of the first data was shown due to the hidden label.
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    label: '{{0.5/28.5*100}}%, B {{4/28.5*100}}%, C {{6/28.5*100}}%, D {{8/28.5*100}}%, E {{10/28.5*100}}%'
    extLabel:  'A {{0.5/28.5*100}}%, {{4/28.5*100}}%, {{6/28.5*100}}%, {{8/28.5*100}}%, {{10/28.5*100}}%'
    data: '0.5, 4, 6, 8, 10'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.4
    hideLabelLessThan: 0.03
    showExtLabelOnlyIfNoLabel: true
```

When there are multiple external labels, make sure they won't overlap with each other
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    label: '{{0.5/11*100}}%, B {{0.4/11*100}}%, C {{0.1/11*100}}%, D {{8/11*100}}%, E {{9.7/11*100}}%, F {{0.3/28.5*100}}'
    extLabel:  'A {{0.5/11*100}}%, B {{0.4/11*100}}%, C {{0.1/11*100}}%, D {{8/11*100}}%, E {{9.7/11*100}}, F {{0.3/11*100}}%'
    data: '0.5, 0.4, 0.1, 8, 9.7, 0.3'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c,#aaaaaa'
    ratioInnerRadius: 0.4
    hideLabelLessThan: 0.03
    showExtLabelOnlyIfNoLabel: true
```
