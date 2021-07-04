# Test Template Variables

### {{min}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Minimum value: {{min}} <-- should be 12'
```

### {{minDate}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Latest date of minimum value: {{minDate}} <-- should be 2021-01-03'
```

### {{max}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Maximum value: {{max}} <-- should be 48'
```

### {{maxDate}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Latest date of maximum value: {{maxDate}} <-- should be 2021-01-01'
```

### {{startDate}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Start date: {{startDate}} <-- should be 2021-01-01'
```

### {{endDate}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'End date: {{endDate}} <-- should be 2021-01-03'
```

### {{sum}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Sum: {{sum}} <-- should be 3'
```

### {{numTargets}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of targets: {{numTargets}} <-- should be 3'
```

### {{numDays}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of days: {{numDays}} <-- should be 4'
```

### {{numDaysHavingData}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-04
summary:
    template: 'Number of days having data: {{numDaysHavingData}} <-- should be 3'
```

### {{maxStreak}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'Maximum streak: {{maxStreak}} <-- should be 5'
```

### {{maxStreakStart}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The start date of maximum streak: {{maxStreakStart}} <-- should be 2021-01-02'
```

### {{maxStreakEnd}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The end date of maximum streak: {{maxStreakEnd}} <-- should be 2021-01-06'
```

### {{maxBreaks}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'Maximum breaks: {{maxBreaks}} <-- should be 2'
```

### {{maxBreaksStart}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The start date of maximum breaks: {{maxBreaksStart}} <-- should be 2021-01-07'
```

### {{maxBreaksEnd}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-09
summary:
    template: 'The end date of maximum breaks: {{maxBreaksEnd}} <-- should be 2021-01-08'
```

### {{currentStreak}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'Latest streak: {{currentStreak}} <-- should be 1'
```

### {{currentStreakStart}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'The start date of current streak: {{currentStreakStart}} <-- should be 2021-01-24'
```

### {{currentStreakEnd}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-24
summary:
    template: 'The end date of current streak: {{currentStreakEnd}} <-- should be 2021-01-24'
```

### {{currentBreaks}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'Current breaks: {{currentBreaks}} <-- should be 1'
```

### {{currentBreaksStart}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'The start date of current breaks: {{currentBreaksStart}} <-- should be 2021-01-22'
```

### {{currentBreaksEnd}}
``` tracker
searchType: tag
searchTarget: meditation
folder: /diary
endDate: 2021-01-22
summary:
    template: 'The end date of current breaks: {{currentBreaksEnd}} <-- should be 2021-01-22'
```

### {{average}}
(48+25+12)/3 = 28.33
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Average value: {{average}} <-- should be 28.33'
```

### {{median}}
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Median value: {{median}} <-- should be 25'
```

### {{variance}}
https://mathworld.wolfram.com/SampleVariance.html
``` tracker
searchType: dvField
searchTarget: dataviewTarget
folder: /diary
endDate: 2021-01-03
summary:
    template: 'Variance value: {{variance}} <-- should be 332.33'
```
