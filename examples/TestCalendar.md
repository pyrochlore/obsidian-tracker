# Test Calendar

## Month View

Use threshold
Circles shown on days with values larger than 40
``` tracker
searchType: tag
searchTarget: exercise-pushup
folder: diary
month:
    startWeekOn: Sun
    threshold: 40
    color: tomato
    headerMonthColor: orange
    dimNotInMonth: false
    todayRingColor: orange
    selectedRingColor: steelblue
    showSelectedValue: true
```

Default threshold = 0
Circles shown on days with values larger than zero 
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
month:
    startWeekOn: Sun
    color: steelblue
    headerMonthColor: green
    selectedRingColor: orange
```

Use default colors
Start week on Monday
``` tracker
searchType: tag
searchTarget: exercise-pushup
folder: diary
month:
    startWeekOn: Mon
    threshold: 40
```

Please also check those search targets in markdown files under folder 'diary'.

