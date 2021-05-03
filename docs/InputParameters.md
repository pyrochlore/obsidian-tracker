# Input Parameters
Obsidian-tracker parses key-value pairs in YAML format as input parameters. The following sections show a complete list of all the input parameters. 

Notice that some of the parameters can accept one value for each target, thus the maximum number of values of the parameters equals the number of targets (NT). If the number of values is less than the number of targets, the plugin will use the previously provided value or use the default value if nothing is provided.

Also, some y-axis related parameters like yMin, yMax, and yAxisLabel accept one value for each y-axis (left and right). If you only use one axis, or the settings for the two axes are the same, only one value is required. If you need the two axes to have different settings, assign two values to them. The first one will be used for the left axis and the second one for the right axis.

## Root Parameters
These key-value pairs are placed under the YAML root.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| **searchType** | The type of searchTarget (tag\|frontmatter\|wiki\|text) | 1~NT | Must provided |
| **searchTarget** | The target to search<br>[[detail](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)] | NT (Number of Targets) | Must provided |
| **folder** | The folder path of your daily notes | 1 | Root of this vault |
| **dateFormat** | The date format of your file names | 1  | 'YYYY-MM-DD' |
| **dateFormatPrefix** | A prefix before your dateFormat | 1 | '' |
| **dateFormatSuffix** | A suffix after your dateFormat | 1 | '' |
| **startDate** | The start date of collected dataset | 1 | Min date found |
| **endDate** | The end date of collected dataset | 1 | Max date found |
| **datasetName** | The name of the dataset collected from the search target | 1~NT | untitled |
| **constValue** | The constant value of a target if no value attached | 1~NT | 1.0 |
| **ignoreAttachedValue** | Use a constant value even if the target has a value attached on (true\|false) | 1~NT | false |
| **ignoreZeroValue** | Treat zero value as missing value (true\|false) | 1~NT | false |
| **accum** | Accumulatively sum the values over time (true\|false) | 1~NT | false |
| **penalty** | The value to use if the search target is missing on the day | 1~NT | |
| **line** | A container key for parameters related to line-chart | | |
| **bar** | A container key for parameters related to bar-chart | | |
| **summary** | A container key for parameters related to summary output | | |

## Parameters for Common Chart
These key-value pairs should be placed under the key '**line**' or '**bar**'.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| **title** | The title of the chart| 1 | '' |
| **xAxisLabel** | X axis label | 1 | 'Date' |
| **xAxisColor** | X axis color | 1 | 'white'('black'<sup>*</sup>) |
| **xAxisLabelColor** | X axis label color | 1 | 'white'('black'<sup>*</sup>) |
| **yAxisLabel** | Y axis label | 1~2 | 'Value' |
| **yAxisColor** | Y axis color | 1~2 | 'white'('black'<sup>*</sup>) |
| **yAxisLabelColor** | The color of labels | 1~2 | 'white'('black'<sup>*</sup>) |
| **yAxisUnit** | The unit displayed aside y axis label | 1~2 | '' | 
| **yMin** | The minimum value shown on Y axis | 1~2 |Minimum Y value found | 
| **yMax** | The maximum value shown on Y axis | 1~2 | Maximum Y value found |
| **allowInspectData** | Show data value when mouse hovered (true\|false) | 1 | true |
| **showLegend** | Show legend (true\|false) | 1 | false |
| **legendPosition** | Legend position (top\|bottom\|left\|right) | 1 | bottom |
| **legendOrientation** | Legend Orientation (vertical\|horizontal) | 1 | horizontal for bottom and top<br>vertical for left and right |
| **legendBgColor** | Legend Background Color | 1 | none |
| **legendBorderColor** | Legend Border Color | 1 | white |

## Parameters for Line Chart
These key-value pairs should be placed under the key '**line**'.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| **lineColor** | The color of line | 1~NT | 'white'('black'<sup>*</sup>) |
| **lineWidth** | The width of line| 1~NT | 1.5 |
| **showLine** |Show/hide line (true\|false) | 1~NT | true |
| **showPoint** | Show/hide data point (true\|false) | 1~NT | true |
| **pointColor** | The color of data point | 1~NT | #69b3a2 |
| **pointBorderColor** | The border color of data point | 1~NT | #69b3a2 |
| **pointBorderWidth** | The border width of data point | 1~NT | 0 |
| **pointSize** | The size of data point | 1~NT | 3 |
| **fillGap** | Connect points over missing data (true\|false) | 1~NT | false |
| **yAxisLocation** | The corresponding y-axis for a specific dataset (left\|right) | 1~NT | left |

## Parameters for Bar Chart
These key-value pairs should be placed under the key '**bar**'.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| **barColor** | 'white'('black'<sup>*</sup>) | 1~NT | #69b3a2 |
| **yAxisLocation** |  The corresponding y-axis for a specific dataset (left\|right) | 1~NT | left |

## Parameters for Summary
These key-value pairs should be placed under the key '**summary**'.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| **template** | Text template (you may embed [template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) | 1 | '' |
| **style** | CSS style applied the rendered text block | 1 | '' |