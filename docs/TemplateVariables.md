# Template Variables

When you choose 'summary' as the output type (by placing a key 'summary'), you can embed template variables into the value of the 'template' key. In this manner, the plugin will do calculations according to the collected dataset, and render the output with variables replaced by calculated results.

Here are all the predefined template variables available for now.
 
| Template variable | Description |
|:------------------:|:-----------:|
| {{min}} | Minimum value in dataset |
| {{max}} | Maximum value in dataset |
| {{sum}} | Summation of values in dataset |
| {{count}} | Total counts of not-null values |
| {{days}} | Days from startDate to endDate |
| {{maxStreak}} | Maximum streak between missing data |
| {{maxBreak}} | Maximum break from missing data |
| {{lastStreak}} | Last streak |
| {{average}} | Average value |
| {{median}} | Median value |
| {{variance}} | Variance value |

Notice when doing calculations like sum or average, the missing values are ignored. You can set those missing values to zero by setting the value of key 'penalty'  to zero. Moreover, if the key 'ignoreZeroValue' is assigned true, zero value will be ignored too. You can check these parameters [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)