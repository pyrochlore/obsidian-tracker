# Test Calendar

``` tracker
searchType: tag
searchTarget: exercise-pushup
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
folder: diary
month:
    startWeekOn:
    threshold: 40
```

Gradient circle
``` tracker
searchType: tag
searchTarget: exercise-pushup
folder: diary
month:
    startWeekOn:
	useThreshold: false
    threshold: 40
    color: green
	headerMonthColor: orange
    dimNotInMonth: false
	todayRingColor: orange
	selectedRingColor: steelblue
	showSelectedValue: true
```

``` tracker
searchType: tag
searchTarget: exercise-pushup
summary:
    template: "minDate: {{minDate}}\nminValue: {{min}}\nmaxDate: {{maxDate}}\nmaxValue: {{max}}"
```

Please also check those search targets in markdown files under folder 'diary'.

