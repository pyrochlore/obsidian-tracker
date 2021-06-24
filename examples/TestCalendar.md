# Test Calendar

## Single target
``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: PushUp
folder: diary
month:
    startWeekOn:
    threshold: 40
    color: tomato
    headerMonthColor: orange
    dimNotInMonth: false
    todayRingColor: orange
    selectedRingColor: steelblue
    showSelectedValue: true
```

``` tracker
searchType: tag
searchTarget: meditation
datasetName: Meditation
folder: diary
month:
    startWeekOn: 
    color: steelblue
    headerMonthColor: green
    selectedRingColor: orange
```

Use default colors
``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: PushUp
folder: diary
month:
    startWeekOn:
    threshold: 40
```

Gradient circle
``` tracker
searchType: tag
searchTarget: exercise-pushup
datasetName: PushUp
folder: diary
month:
    startWeekOn:
    threshold: 40
    color: green
    headerMonthColor: orange
    dimNotInMonth: false
    todayRingColor: orange
    selectedRingColor: steelblue
    circleColorByValue: true
    showSelectedValue: true
```

``` tracker
searchType: tag
searchTarget: exercise-pushup
summary:
    template: "minDate: {{minDate}}\nminValue: {{min}}\nmaxDate: {{maxDate}}\nmaxValue: {{max}}"
```

## Multiple targets
``` tracker
searchType: tag
searchTarget: exercise-pushup, meditation
datasetName: PushUp, Meditation
folder: diary
month:
    dataset: 0, 1
    startWeekOn: 'Sun'
    threshold: 40, 0
    color: green
    headerMonthColor: orange
    dimNotInMonth: false
    todayRingColor: orange
    selectedRingColor: steelblue
    circleColorByValue: true
    showSelectedValue: true
```

Please also check those search targets in markdown files under folder 'diary'.

