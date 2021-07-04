# Input Parameters
Obsidian-tracker parses key-value pairs in your code block in YAML format and uses them as input parameters. The minimum requirements for parameters are `searchType`, `searchTarget` and one output parameter (`line`, `bar`, `frontmatter`, `fileMeta`, `wiki`, `table`, `task`, or `text`).

## Array Input

Some of the parameters can accept more than one value for each target, thus the maximum number of values of the parameter equals the number of targets (NT). If the number of values is less than the number of targets, the plugin will use the previously provided value or use the default value if nothing is provided.

Also, some y-axis related parameters for chart (`line` or `bar`), like `yMin`, `yMax`, and `yAxisLabel` accept one value for each y-axis (`left` and `right`). If you only use one axis, or the values for the two axes are the same, only one value is required. If you need the two axes to have different values, assign two values to them. The first one will be used for the left axis and the second one for the right axis.

To enter array of values, Use YAML array (e.g. ['value1', 'value2', 'value3']) or simply values separated by comma (e.g. value1, value2, value3). The second method is a syntax surgar of Tracker to simplify the inputs. If YAML special characters are included, be sure to wrap the whole values by single quotes (e.g. 'value1, value2, value3'). Please also check [this](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md) for more information about YAML in Tracker.

## List of Parameters

### Root Parameters

These key-value pairs are placed under the code block root.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `searchType` | The type of `searchTarget` (tag\|frontmatter\|wiki\|text\|dvField\|table\|filemeta\|task) | 1~NT | Must be provided |
| `searchTarget` | The target to search<br>[[detail](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)] | NT (Number of Targets) | Must be provided |
| `folder` | The root path of notes to search | 1 | Root of this vault |
| `dateFormat` | The date format you are using<br> or use [iso-8601](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#iso-8601-date-format) | 1  | 'YYYY-MM-DD' |
| `dateFormatPrefix` | The prefix before your dateFormat | 1 | '' |
| `dateFormatSuffix` | The suffix after your dateFormat | 1 | '' |
| `startDate` | The start date to collect data<br>accept [relative date](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate) | 1 | Min date found |
| `endDate` | The end date of to collect data<br>accept [relative date](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate) | 1 | Max date found |
| `datasetName` | The name of the dataset for a search target` | 1~NT | untitled |
| `separator` | The character to separate multiple values appearing in the search target | 1~NT | '/' |
| `xDataset` | The `searchTarget` of this index will be used as xDataset | 1~NT | -1 (use filename as xDataset) |
| `constValue` | The constant value of a target if no value attached | 1~NT | 1.0 |
| `ignoreAttachedValue` | Use a constant value even if the target has a value attached on (true\|false) | 1~NT | false |
| `ignoreZeroValue` | Treat zero value as missing (true\|false) | 1~NT | false |
| `accum` | Accumulatively sum the values over time (true\|false) | 1~NT | false |
| `penalty` | The value to use if the search target is missing on the day | 1~NT | |
| `valueShift` | The amount to shift the collected values | 1~NT | 0 |
| `valueType` | Not implemented yet | 1~NT | |
| `fixedScale` | The scaling factor apply to the chart | 1 | 1.0 |
| `fitPanelWidth` | Auto-fit the width of the chart to the container | 1 | false |
| `margin` | The four margin (top|right|bottom|left) of the graph | 1~4 | 10 |
| `line` | A container key for parameters related to the line chart | | |
| `bar` | A container key for parameters related to the bar chart | | |
| `summary` | A container key for parameters related to the summary output | | |
| `bullet` | A container key for parameters related to the bullet chart | 

### Parameters for Common Chart
These key-value pairs should be placed under the key `line` or `bar`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `title` | The title of the chart | 1 | '' |
| `xAxisLabel` | The label of X axis | 1 | 'Date' |
| `xAxisColor` | The color of X axis | 1 | 'white'('black'<sup>*</sup>) |
| `xAxisLabelColor` | The color of X axis label | 1 | 'white'('black'<sup>*</sup>) |
| `yAxisLabel` | The label of Y axis | 1~2 | 'Value' |
| `yAxisColor` | The color of Y axis | 1~2 | 'white'('black'<sup>*</sup>) |
| `yAxisLabelColor` | The color of Y axis label | 1~2 | 'white'('black'<sup>*</sup>) |
| `yAxisUnit` | The unit displayed aside Y axis label | 1~2 | '' | 
| `yMin` | The minimum value on Y axis | 1~2 |Minimum Y value found | 
| `yMax` | The maximum value on Y axis | 1~2 | Maximum Y value found |
| `reverseYAxis` | Flip the Y Axis or not (true\|false) | 1~2 | false |
| `allowInspectData` | Show data value when mouse hovered (true\|false) | 1 | true |
| `showLegend` | Show legend (true\|false) | 1 | false |
| `legendPosition` | Legend position (top\|bottom\|left\|right) | 1 | bottom |
| `legendOrientation` | Legend orientation (vertical\|horizontal) | 1 | horizontal for bottom and top<br>vertical for left and right |
| `legendBgColor` | Legend background color | 1 | none |
| `legendBorderColor` | Legend border color | 1 | white |

### Parameters for Line Chart
These key-value pairs should be placed under the key `line`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `lineColor` | The color of the lines in chart | 1~NT | 'white'('black'<sup>*</sup>) |
| `lineWidth` | The width of the lines in chart | 1~NT | 1.5 |
| `showLine` | Show lines (true\|false) | 1~NT | true |
| `showPoint` | Show data points (true\|false) | 1~NT | true |
| `pointColor` | The color of data points | 1~NT | #69b3a2 |
| `pointBorderColor` | The border color of data points | 1~NT | #69b3a2 |
| `pointBorderWidth` | The border width of data points | 1~NT | 0 |
| `pointSize` | The size of data points | 1~NT | 3 |
| `fillGap` | Connect points over missing data (true\|false) | 1~NT | false |
| `yAxisLocation` | The corresponding Y axis for a specific dataset (left\|right) | 1~NT | left |

### Parameters for Bar Chart
These key-value pairs should be placed under the key `bar`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `barColor` | The color of bars in chart | 1~NT | #69b3a2 |
| `yAxisLocation` |  The corresponding y-axis for a specific dataset (left\|right) | 1~NT | left |

### Parameters for Summary
These key-value pairs should be placed under the key `summary`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `template` | Text template (you may embed [template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) | 1 | '' |
| `style` | CSS style applied the rendered text block | 1 | '' |

### Parameters for Bullet Chart
These key-value pairs should be placed under the key `bullet`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `title` | The title of the chart | 1 | '' |
| `dataset` | The index of the dataset of your interest | 1 | 0 |
| `orientation` | Bar orientation (horizontal\|vertical) | 1 | 'horizontal' |
| `value` | The actual value of interest<br>(you may embed [template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) | 1 | '' |
| `valueUnit` | The unit of value displayed aside | 1 | '' |
| `valueColor` | The color of the value bar | 1 | '#69b3a2' |
| `range` | The ranges of color bands in background | N | [] |
| `rangeColor` | The color of range bands | N | [] |
| `showMarker` | Show marker or not (true\|false) | 1 | true |
| `markerValue` | The value of the markder | 1 | 0 |
| `markerColor` | The color of the marker | 1 | 'black' |

### Parameters for Month View
These key-value pairs should be placed under the key `month`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `dataset` | The index of the dataset of your interest | 1~NT | all indices of non-x searchTarget |
| `startWeekOn` | First day of a week ('Sun'\|'Mon') | 1 | 'Sun' |
| `threshold` | The threshold to determine showing a circle on a day or not | 1~NT | 0 |
| `yMin` | Minimum value | 1~NT | Minimum value of the dataset |
| `yMax` | Maximum value | 1~NT | Maximum value of the dataset |
| `showCircle` | Circle the day label if the collected value reach the threshold (value > threshold) | 1 | true |
| `color` | Main color (can be override by other color parameters) | 1 | null |
| `dimNotInMonth` | Dim the color for days not in current month | 1 | true |
| `showStreak` | Show streaks between circles | 1 | true |
| `showTodayRing` | Show a ring on the label today | 1 | true |
| `showSelectedValue` | Show the value on the selected day | 1 | true |
| `showSelectedRing` | Show a ring on the label of the selected day | 1 | true |
| `circleColor` | The color of circles | 1 | '#69b3a2' |
| `circleColorByValue` | Display colors based on the value | 1 | 1 |
| `headerYearColor` | The color of year text in header | 1 | 'white' |
| `headerMonthColor` | The color of the month text in header | 1 | 'white' |
| `dividingLineColor` | The color of the dividing line | 1 | '#69b3a2' |
| `todayRingColor` | The color of the ring on today | 1 | 'white' |
| `selectedRingColor` | The color of the ring on the selected day | 1 | 'firebrick' |
| `initMonth` | Initial month to show (0~11) | 1 | last month found |