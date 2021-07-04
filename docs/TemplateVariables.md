# Template Variables

Currently, there are two places you can use template variables. First is the `template` parameter under output type `summary`. The second one is the `value` parameter under output type `bullet`. For each template variable, the plugin will do calculations based on the collected dataset refereed, and render the output with variables replaced by calculated results.

The following table shows all the template variables available for now. The "N" in the table is the ID (the order of a target in `searchTarget` parameter starting from zero) or the name (specified by the parameter `datasetName`) of a dataset. 

Examples using template variables could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md).

## List of Template Variables

| Template variable | Description |
|:------------------|:-----------|
| {{min}}<br>{{min(Dataset(N))}} | Minimum value of the dataset |
| {{minDate}}<br>{{minDate(Dataset(N))}} | Latest date of minimum value |
| {{max}}<br>{{max(Dataset(N))}} | Maximum value of the dataset |
| {{maxDate}}<br>{{maxDate(Dataset(N))}} | Latest date of maximum value |
| {{startDate}}<br>{{startDate(Dataset(N))}} | Start date of the dataset |
| {{endDate}}<br>{{endDate(Dataset(N))}} | End date of the dataset |
| {{sum}}<br>{{sum(Dataset(N))}} | Summation of values of the dataset |
| {{numTargets}}<br>{{numTargets(Dataset(N))}} | Total counts of targets |
| {{numDays}}<br>{{numDays(Dataset(N))}} | Days from startDate to endDate |
| {{numDaysHavingData}}<br>{{numDaysHavingData(Dataset(N))}} | Number of days having data |
| {{maxStreak}}<br>{{maxStreak(Dataset(N))}} | Maximum continuous days without breaks |
| {{maxStreakStart}}<br>{{maxStreakStart(Dataset(N))}} | Start date of the max streak |
| {{maxStreakEnd}}<br>{{maxStreakEnd(Dataset(N))}} | End date of the max streak |
| {{maxBreaks}}<br>{{maxBreaks(Dataset(N))}} | Maximum break days |
| {{maxBreaksStart}}<br>{{maxBreaksStart(Dataset(N))}} | Start date of the maximum break days |
| {{maxBreaksEnd}}<br>{{maxBreaksEnd(Dataset(N))}} | End date of the maximum break days |
| {{currentStreak}}<br>{{currentStreak(Dataset(N))}} | Current continuous days |
| {{currentStreakStart}}<br>{{currentStreakStart(Dataset(N))}} | Start date of current streak |
| {{currentStreakEnd}}<br>{{currentStreakEnd(Dataset(N))}} | End date of current streak |
| {{currentBreaks}}<br>{{currentBreaks(Dataset(N))}} | Current break days |
| {{currentBreaksStart}}<br>{{currentBreaksStart(Dataset(N))}} | Start date of current breaks |
| {{currentBreaksEnd}}<br>{{currentBreaksEnd(Dataset(N))}} | End date of current breaks |
| {{average}}<br>{{average(Dataset(N))}} | Average value of the dataset |
| {{median}}<br>{{median(Dataset(N))}} | Median value of the dataset |
| {{variance}}<br>{{variance(Dataset(N))}} | Variance value of the dataset |

## List of Deprecated Template Variables
| Template variable | Description |
|:------------------|:-----------|
| {{count}}<br>{{count(Dataset(N))}} | Use numTargets instead |
| {{days}}<br>{{days(Dataset(N))}} | Use numDays instead |
| {{lastStreak}}<br>{{lastStreak(Dataset(N))}} | Use currentSteak instead |

Notice when doing calculations like sum or average, the missing values are ignored. You can set those missing values to zero by setting the value of key `penalty`  to zero. Moreover, if the key `ignoreZeroValue` is assigned true, zero value will be ignored too. You can check these parameters [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)