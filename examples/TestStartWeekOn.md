# Test: startWeekOn Parameter

This example demonstrates the `startWeekOn` parameter which allows you to start the week on any day.

## All Days Supported

The `startWeekOn` parameter now accepts any day of the week:
- Abbreviations: `Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`
- Full names: `Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`
- Case-insensitive: `FRIDAY`, `friday`, `Fri` all work

## Sunday (Default)

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Sun
    mode: circle
```

## Monday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Mon
    mode: circle
```

## Tuesday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Tue
    mode: circle
```

## Wednesday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Wed
    mode: circle
```

## Thursday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Thu
    mode: circle
```

## Friday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Fri
    mode: circle
```

## Saturday

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Sat
    mode: circle
```

## Case Insensitivity

All of these are equivalent:

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: FRIDAY
    mode: circle
```

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: friday
    mode: circle
```

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Friday
    mode: circle
```

## Full Day Names

You can also use full day names:

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: Sunday
    mode: circle
```

## Error Handling

Invalid values will show a clear error message:

```tracker
searchType: tag
searchTarget: test
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
month:
    startWeekOn: InvalidDay
    mode: circle
```

**Expected Error:** "Invalid startWeekOn value: 'InvalidDay'. Must be one of: Sun, Mon, Tue, Wed, Thu, Fri, Sat (or full day names like Sunday, Monday, etc.)"
