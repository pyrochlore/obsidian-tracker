# Template Variables

Currently, there are two places you can use template variables. First is the `template` parameter under output type `summary`. The second one is the `value` parameter under output type `bullet`. For each template variable, the plugin will do calculations based on the collected dataset refereed, and render the output with variables replaced by calculated results.

The following table shows all the template variables available for now. The "N" in the table is the ID (the order of a target in `searchTarget` parameter starting from zero) or the name (specified by the parameter `datasetName`) of a dataset. 

Examples using template variables could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md).

## List of Template Variables

| Template variable | Description |
|:------------------|:-----------|
| {{min}}<br>{{min(Dataset(N))}} | Minimum value of first dataset |
| {{max}}<br>{{max(Dataset(N))}} | Maximum value of first dataset |
| {{startDate}}<br>{{startDate(Dataset(N))}} | |
| {{endDate}}<br>{{endDate(Dataset(N))}} | |
| {{sum}}<br>{{sum(Dataset(N))}} | Summation of values of first dataset |
| {{numTargets}}<br>{{numTargets(Dataset(N))}} | Total counts of not-null values of specified dataset|
| {{numDays}}<br>{{numDays(Dataset(N))}} | Days from startDate to endDate of first dataset |
| {{numDaysHavingData}}<br>{{numDaysHavingData(Dataset(N))}} | |
| {{maxStreak}}<br>{{maxStreak(Dataset(N))}} | Maximum streak between missing data of first dataset |
| {{maxStreakStart}}<br>{{maxStreakStart(Dataset(N))}} |  |
| {{maxStreakEnd}}<br>{{maxStreakEnd(Dataset(N))}} |  |
| {{maxBreaks}}<br>{{maxBreaks(Dataset(N))}} | Maximum break from missing data of first dataset |
| {{maxBreaksStart}}<br>{{maxBreaksStart(Dataset(N))}} | Maximum break from missing data of specified dataset |
| {{maxBreaksEnd}}<br>{{maxBreaksEnd(Dataset(N))}} | Maximum break from missing data of specified dataset |
| {{currentStreak}}<br>{{currentStreak(Dataset(N))}} | Last streak of first dataset |
| {{currentStreakStart}}<br>{{currentStreakStart(Dataset(N))}} | Last streak of first dataset |
| {{currentStreakEnd}}<br>{{currentStreakEnd(Dataset(N))}} | Last streak of first dataset |
| {{currentBreaks}}<br>{{currentBreaks(Dataset(N))}} | Last breaks of first dataset |
| {{currentBreaksStart}}<br>{{currentBreaksStart(Dataset(N))}} | Last breaks of first dataset |
| {{currentBreaksEnd}}<br>{{currentBreaksEnd(Dataset(N))}} | Last breaks of first dataset |
| {{average}}<br>{{average(Dataset(N))}} | Average value of first dataset |
| {{median}}<br>{{median(Dataset(N))}} | Median value of first dataset |
| {{variance}}<br>{{variance(Dataset(N))}} | Variance value of first dataset |

## List of Deprecated Template Variables
| Template variable | Description |
|:------------------|:-----------|
| {{count}}<br>{{count(Dataset(N))}} | Use numTargets instead |
| {{days}}<br>{{days(Dataset(N))}} | Use numDays instead |
| {{lastStreak}}<br>{{lastStreak(Dataset(N))}} | Use currentSteak instead |

Notice when doing calculations like sum or average, the missing values are ignored. You can set those missing values to zero by setting the value of key `penalty`  to zero. Moreover, if the key `ignoreZeroValue` is assigned true, zero value will be ignored too. You can check these parameters [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)