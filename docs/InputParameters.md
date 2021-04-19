# Input Parameters
Obsidian-tracker receives key-value pairs in YAML format as input parameters. Here is a complete list of these parameters.

## Root Parameters
These key-value pairs are placed under the YAML root. They were used for collecting data, evaluating targets, and preprocessing data.

| Key | Default | Description |
|:--------:|:-------:|:-----------:|
| **searchType** | Empty string | The type of searchTarget |
| **searchTarget** | Empty string | [The target to search](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md) |
| **folder** | Root of this vault | The folder path of your daily notes |
| **dateFormat** | "YYYY-MM-DD" | The date format of your daily note title |
| **startDate** | Min date found | The start date for collecting data |
| **endDate** | Max date found | The end date for collecting data |
| **constValue** | 1.0 | The constant value of a target if no value attached |
| **ignoreAttachedValue** | false | Use constant value even if the target has a value attached on |
| **ignoreZeroValue** | false | Treat zero value as missing value |
| **accum** | false | Accumulatively sum the values over time |
| **penalty** | null | The value to use if search target is missing on the day |
| **line** | | All line-chart related keys should be placed under this key |
| **summary** | | All summary keys should be placed under this key |

## Line Chart Related Parameters
These key-value pairs should be placed under the key '**line**'.

| Key | Default | Description |
|:--------:|:-----------:|:-----------:|
| **title** | empty string | The title of this line chart|
| **xAxisLabel** | 'Date' | X axis label |
| **yAxisLabel** | 'Value' | Y axis label |
| **labelColor** | 'white'('black'<sup>*</sup>) | The color of labels |
| **yAxisUnit** | empty string | The unit displayed aside y axis label |
| **yMin** | Minimum Y value found | The minimum value shown on Y axis |
| **yMax** | Maximum Y value found | The maximum value shown on Y axis |
| **axisColor** | 'white'('black'<sup>*</sup>) | The color of axes |
| **lineColor** | 'white'('black'<sup>*</sup>) | |
| **lineWidth** | 1.5 | The width of line|
| **showLine** | true | Show/hide line |
| **showPoint** | true | Show/hide data point |
| **pointColor** | "#69b3a2" | The color of data point |
| **pointBorderColor** | #69b3a2 | The border color of data point |
| **pointBorderWidth** | 0 | The border width of data point |
| **pointSize** | 3 | The size of data point |
| **allowInspectData** | true | Show data value aside data point |
| **fillGap** | false | Connect points over missing data |

## Summary Related Parameters
These key-value pairs should be placed under the key '**summary**'.

| **template** | Empty string | Text template (you may embed [template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) |
| **style** | Empty string | css style for the rendered text block |