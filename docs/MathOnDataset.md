# Template Variables

## Importat!!! Changed!!!
Currently, there are two places you can use template variables. First is the `template` parameter under output type `summary`. The second one is the `value` parameter under output type `bullet`. For each template variable, the plugin will do calculations based on the collected dataset refereed, and render the output with variables replaced by calculated results.

The following table shows all the template variables available for now. The "N" in the table is the ID (the order of a target in `searchTarget` parameter starting from zero) or the name (specified by the parameter `datasetName`) of a dataset. 

Examples using template variables could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md).

## List of Dataset Related Functions

| Function | Description |
|:------------------|:-----------|
| dataset(id: number): Dataset | |
| min(dataset: Dataset): number | Minimum value of the dataset |
| minDate(dataset: Dataset): Date | Latest date of minimum value |
| max(dataset: Dataset): number | Maximum value of the dataset |
| maxDate(dataset: Dataset): Date | Latest date of maximum value |
| startDate(dataset: Dataset): Date | Start date of the dataset |
| endDate(dataset: Dataset): Date | End date of the dataset |
| sum(dataset: Dataset): number | Summation of values of the dataset |
| numTargets(dataset: Dataset): number | Total counts of targets |
| numDays(dataset: Dataset): number | Days from startDate to endDate |
| numDaysHavingData(dataset: Dataset): number | Number of days having data |
| maxStreak(dataset: Dataset): number | Maximum continuous days without breaks |
| maxStreakStart(dataset: Dataset): Date | Start date of the max streak |
| maxStreakEnd(dataset: Dataset): Date | End date of the max streak |
| maxBreaks(dataset: Dataset): number | Maximum break days |
| maxBreaksStart(dataset: Dataset): Date | Start date of the maximum break days |
| maxBreaksEnd(dataset: Dataset): Date | End date of the maximum break days |
| currentStreak(dataset: Dataset): number | Current continuous days |
| currentStreakStart(dataset: Dataset): Date | Start date of current streak |
| currentStreakEnd(dataset: Dataset): Date | End date of current streak |
| currentBreaks(dataset: Dataset): number | Current break days |
| currentBreaksStart(dataset: Dataset): Date | Start date of current breaks |
| currentBreaksEnd(dataset: Dataset): Date | End date of current breaks |
| average(dataset: Dataset): number | Average value of the dataset |
| median(dataset: Dataset): number | Median value of the dataset |
| variance(dataset: Dataset): number | Variance value of the dataset |

## List of Binary Operation
| Function | Description |
|:------------------|:-----------|
| + | |
| - | |
| * | |
| / | |
| % | |

## List of Deprecated Template Variables
| Template variable | Description |
|:------------------|:-----------|
| count | Use numTargets instead |
| days | Use numDays instead |
| lastStreak | Use currentSteak instead |

Notice when doing calculations like sum or average, the missing values are ignored. You can set those missing values to zero by setting the value of key `penalty`  to zero. Moreover, if the key `ignoreZeroValue` is assigned true, zero value will be ignored too. You can check these parameters [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)