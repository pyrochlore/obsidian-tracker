# Test Pie Chart

## Manual Input Data
### Numbers
To be fixed,
If numeric data not wrapped by single quotes
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
pie:
    title: Manual Input Data
    label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
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
datasetName: Done, NotDone
pie:
    title: Manual Input Data
    data: '{{1 + 1}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

### Legend
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Manual Input Data
	label: '{{2/30*100}}%, {{4/30*100}}%, {{6/30*100}}%, {{8/30*100}}%, {{10/30*100}}%'
    data: '2, 4, 6, 8, 10'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
	dataName: A, B, C, D, E
    ratioInnerRadius: 0.5
	showLegend: true
	legendPosition: right
	legendOrientation: vertical	
```

## Data from Notes
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
datasetName: Done, NotDone
pie:
    title: Task Done and Not Done
    data: '{{sum(dataset(0))}},{{sum(dataset(1))}}'
    dataColor: '#4daf4a,#377eb8'
    ratioInnerRadius: 0.5
```


``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
folder: diary
summary:
    template: "How many days I said love: {{sum(dataset(0))}}\nHow many days I didn't say love: {{sum(dataset(1))}}"
```

``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Task Done and Not Done
	label: '2%, 4%, 6%, 8%, 10%'
	extLabel: A, B, C, D
    data: '{{1 + 1}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

## External Labels
``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Task Done and Not Done
	label: '2%, 4%, 6%, 8%, 10%'
	extLabel: '2%, 4%, 6%, 8%, 10%'
    data: '{{0.5}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
```

``` tracker
searchType: task.done, task.notdone
searchTarget: Say I love you, Say I love you
datasetName: Done, NotDone
pie:
    title: Task Done and Not Done
	label: '2%, 4%, 6%, 8%, 10%'
	extLabel: '2%, 4%, 6%, 8%, 10%'
    data: '{{0.5}}, {{2 * 2}}, {{12/ 2}}, {{1+(2+3*2)-1}}, {{27%17}}'
    dataColor: '#4daf4a,#377eb8,#ff7f00,#984ea3,#e41a1c'
    ratioInnerRadius: 0.5
	showExtLabelOnlyIfNoLabel: true
```