# Text Expansion

Here is the list of pre-defined template variables. They will be expanded according to the calculation of data.
 
| Template variable | Description |
|:------------------:|:-----------:|
| {{min}} | Minimum value |
| {{max}} | Maximum value |
| {{sum}} | Summation |
| {{count}} | Count of not-null values |
| {{days}} | Days from startDate to endDate |
| {{maxStreak}} | Maximum Streak |
| {{maxBreak}} | Maximum Break |
| {{average}} | Average value |
| {{median}} | Median value |
| {{variance}} | Variance value |

When doing the calculation, the missing value will be ignored. Also, if 'ignoreZeroValue' is assigned true, zero value will be ignored.