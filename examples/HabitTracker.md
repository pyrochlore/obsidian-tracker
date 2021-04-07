# Habit Tracker


``` tracker
searchType: tag
searchTarget: exercise-pushup
folder: diary
endDate: 2021-01-31
line:
	title: PushUp
	yAxisLabel: Count
	lineColor: "#d65d0e"
```

``` tracker
searchType: tag
searchTarget: exercise-plank
folder: diary
line:
	title: Plank
	yAxisLabel: Hold
	yAxisUnit: sec
	lineColor: "#458588"
	pointColor: red
```

``` tracker
searchType: tag
searchTarget: meditation
folder: diary
accum: true
penalty: -1
line:
	title: Meditation
	yAxisLabel: Count
```

## Summary
``` tracker
searchType: tag
searchTarget: meditation
folder: diary
summary:
    template: "Longest Streak: {{maxStreak}} day(s)\nLongest Break: {{maxBreak}} day(s)"
```

``` tracker
searchType: tag
searchTarget: work_log
folder: diary
accum: true
startDate: 2021-01-01
line:
	title: Work Log
	yAxisLabel: Count
	pointSize: 5
	pointColor: white
	pointBorderWidth: 2
	pointBorderColor: "#d65d0e"
```