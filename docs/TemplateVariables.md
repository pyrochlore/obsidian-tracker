# Template Variables

When you choose 'summary' as the output type (by placing a key 'summary'), you can embed template variables into the 'template' parameter. If you do so, the plugin will do calculations based on the collected dataset refereed, and render the output with variables replaced by calculated results.

The following table shows all the predefined template variables available for now. The "N" in the table could be the ID (the order of a target in '**searchTarget**' parameter starting from zero) or the name (specified by the parameter '**datasetName**') of a dataset. Examples could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md).
 
| Template variable | Description |
|:------------------|:-----------|
| {{min}} | Minimum value of first dataset |
| {{min(Dataset(N))}} | Minimum value of specified dataset |
| {{max}} | Maximum value of first dataset |
| {{max(Dataset(N))}} | Maximum value of specified dataset |
| {{sum}} | Summation of values of first dataset |
| {{sum(Dataset(N))}} | Summation of values of specified dataset |
| {{count}} | Total counts of not-null values of first dataset |
| {{count(Dataset(N))}} | Total counts of not-null values of specified dataset|
| {{days}} | Days from startDate to endDate of first dataset |
| {{days(Dataset(N))}} | Days from startDate to endDate of specified dataset |
| {{maxStreak}} | Maximum streak between missing data of first dataset |
| {{maxStreak(Dataset(N))}} | Maximum streak between missing data of specified dataset |
| {{maxBreak}} | Maximum break from missing data of first dataset |
| {{maxBreak(Dataset(N))}} | Maximum break from missing data of specified dataset |
| {{lastStreak}} | Last streak of first dataset |
| {{lastStreak(Dataset(N))}} | Last streak of specified dataset |
| {{average}} | Average value of first dataset |
| {{average(Dataset(N))}} | Average value of specified dataset |
| {{median}} | Median value of first dataset |
| {{median(Dataset(N))}} | Median value of specified dataset |
| {{variance}} | Variance value of first dataset |
| {{variance(Dataset(N))}} | Variance value of specified dataset |

Notice when doing calculations like sum or average, the missing values are ignored. You can set those missing values to zero by setting the value of key 'penalty'  to zero. Moreover, if the key 'ignoreZeroValue' is assigned true, zero value will be ignored too. You can check these parameters [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)