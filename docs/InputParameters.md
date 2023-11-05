# Input Parameters

Obsidian-tracker parses key-value pairs in YAML format in your code block and uses them as input parameters. The minimum requirements for parameters are `searchType`, `searchTarget` and at least one output parameter (`line`, `bar`, `summary`, `bullet`, `month`, or `pie`).

## Array Input for a Parameter

Some of the parameters can accept more than one value for each target. For those parameters accept different value for each given search target, the maximum number of values should equal to the number of search target (NT). If the number of values are less than the number of targets, Tracker will use the previously provided one in sequence or use the default value if nothing is provided.

For Y axis related parameters, like `yMin`, `yMax`, or `yAxisLabel`, they accept one value for each Y axis (`left` and `right`). If you only use one axis, or the values for the two axes are the same, only one value is required. If you need the two axes to have different values, provide two values to do the work. The first one will be used for the left Y axis and the second one for the right Y axis.

To enter array of values, we can use YAML array (e.g. ['value1', 'value2', 'value3']) or simply values separated by comma (e.g. value1, value2, value3). The second method is a syntax surgar of Tracker to simplify input process. If YAML special characters are required in the inputs, be sure to wrap the whole values by single quotes (e.g. 'value1, value2, value3'). Please also check [this](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/YAML.md) for more information about YAML in Tracker.

## List of Parameters

### Root Parameters

These key-value pairs are placed under the root of the code block.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `searchType` | Type of `searchTarget` (tag\|frontmatter\|wiki\|text\|dvField\|table\|fileMeta\|task) | 1~NT | Must be provided |
| `searchTarget` | Target to search<br>[[detail](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)] | NT (Number of Targets) | Must be provided |
| `folder` | Root path containing notes to search | 1 | Root of this vault |
| `file` | Files to include for searching | N | null |
| `specifiedFilesOnly` | Ignore files found in `folder` | 1 | false |
| `fileContainsLinkedFiles` | Include the linked files in the specified files here | N | null |
| `fileMultiplierAfterLink` | Regex string include named group 'value' <br>to search the multiplier after link | 1 | '' |
| `dateFormat` | Date format<br> Use [Moment.js](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) format or use [iso-8601](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#iso-8601-date-format) | 1 | 'YYYY-MM-DD' |
| `dateFormatPrefix` | Prefix before your dateFormat (accept regex) | 1 | '' |
| `dateFormatSuffix` | Suffix after your dateFormat (accept regex) | 1 | '' |
| `startDate` | Start date to collect data from<br>accept [relative date](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate) | 1 | Min date found |
| `endDate` | End date of to collect data<br>accept [relative date](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate) | 1 | Max date found |
| `datasetName` | Name of the dataset for a search target` | 1~NT | untitled |
| `separator` | Character used to separate multiple values appearing in the search target | 1~NT | '/' <br> ',' in front matter tags |
| `xDataset` | Index of `searchTarget` used as xDataset | 1~NT | -1 (use filename as xDataset) |
| `constValue` | Constant value of a target if no value attached | 1~NT | 1.0 |
| `ignoreAttachedValue` | Use `constValue` even if the target has a value attached on (true\|false) | 1~NT | false |
| `ignoreZeroValue` | Treat zero value as missing (true\|false) | 1~NT | false |
| `accum` | Accumulatively sum the values over time (true\|false) | 1~NT | false |
| `penalty` | Value to use if the search target is missing on the day | 1~NT | |
| `valueShift` | Amount to shift for each collected value | 1~NT | 0 |
| `shiftOnlyValueLargerThan` | Do `valueShift` only if the value is larger then the specifed one | 1~NT | null |
| `valueType` | Not implemented yet | 1~NT | |
| `textValueMap` | A container key for multiple text-value mapping | | |
| `fixedScale` | Uniform scaling factor to the graph dimensions | 1 | 1.0 |
| `fitPanelWidth` | Auto-fit the width of the chart to the container | 1 | false |
| `aspectRatio` | Change the 1:1 aspect ratio of the graph | number:number | 1:1 |
| `margin` | Four margins (top\|right\|bottom\|left) of the graph | 1~4 | 10 |
| `line` | A container key for parameters related to the line chart | | |
| `bar` | A container key for parameters related to the bar chart | | |
| `summary` | A container key for parameters related to the summary output | | |
| `bullet` | A container key for parameters related to the bullet chart | | | 
| `month` | A container key for parameters related to the month view | | |
| `pie` | A container key for parameters related to the pie chart | | |

### Parameters for Common Charts
These key-value pairs should be placed under the key `line` or `bar`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `title` | Title of this chart | 1 | '' |
| `xAxisLabel` | Label of X axis | 1 | 'Date' |
| `xAxisColor` | Color of X axis | 1 | 'white'('black'<sup>*</sup>) |
| `xAxisLabelColor` | Color of X axis label | 1 | 'white'('black'<sup>*</sup>) |
| `yAxisLabel` | Label of Y axis | 1~2 | 'Value' |
| `yAxisColor` | Color of Y axis | 1~2 | 'white'('black'<sup>*</sup>) |
| `yAxisLabelColor` | Color of Y axis label | 1~2 | 'white'('black'<sup>*</sup>) |
| `yAxisUnit` | Unit displayed aside Y axis label | 1~2 | '' | 
| `xAxisTickInterval` | X axis interval between ticks | 1~2 | null |
| `xAxisTickLabelFormat` | Format of tick label on X axis<br> | 1~2 | null |
| `yAxisTickInterval` | Y axis interval between ticks | 1~2 | null |
| `yAxisTickLabelFormat` | Format of tick label on Y axis<br> | 1~2 | null |
| `yMin` | Minimum value on Y axis | 1~2 |Minimum Y value found | 
| `yMax` | Maximum value on Y axis | 1~2 | Maximum Y value found |
| `reverseYAxis` | Flip (upside down) the Y Axis or not (true\|false) | 1~2 | false |
| `allowInspectData` | Show data value when mouse hovered (true\|false) | 1 | true |
| `showLegend` | Show/Hide legend (true\|false) | 1 | false |
| `legendPosition` | Legend position (top\|bottom\|left\|right) | 1 | bottom |
| `legendOrientation` | Legend orientation (vertical\|horizontal) | 1 | horizontal for bottom and top<br>vertical for left and right |
| `legendBgColor` | Legend background color | 1 | none |
| `legendBorderColor` | Legend border color | 1 | white |

### Parameters for a Line Chart
These key-value pairs should be placed under the key `line`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `lineColor` | Color of the lines in the chart | 1~NT | 'white'('black'<sup>*</sup>) |
| `lineWidth` | Width of the lines in the chart | 1~NT | 1.5 |
| `showLine` | Show/hide lines (true\|false) | 1~NT | true |
| `showPoint` | Show/hide data points (true\|false) | 1~NT | true |
| `pointColor` | Color of data points | 1~NT | #69b3a2 |
| `pointBorderColor` | Border color of data points | 1~NT | #69b3a2 |
| `pointBorderWidth` | Border width of data points | 1~NT | 0 |
| `pointSize` | Radius of data points | 1~NT | 3 |
| `fillGap` | Connect points over missing data (true\|false) | 1~NT | false |
| `yAxisLocation` | Corresponding Y axis for the dataset (left\|right) | 1~NT | left |

### Parameters for a Bar Chart
These key-value pairs should be placed under the key `bar`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `barColor` | Color of bars in the chart | 1~NT | #69b3a2 |
| `yAxisLocation` |  Corresponding y-axis for the dataset (left\|right) | 1~NT | left |

### Parameters for a Summary
These key-value pairs should be placed under the key `summary`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `template` | Text template (you may embed [expressions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Expressions.md) | 1 | '' |
| `style` | CSS style applied to the rendered text block | 1 | '' |

### Parameters for a Bullet Chart
These key-value pairs should be placed under the key `bullet`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `title` | Title of this chart | 1 | '' |
| `dataset` | Index of the dataset of your interest | 1 | 0 |
| `orientation` | Bar orientation (horizontal\|vertical) | 1 | 'horizontal' |
| `value` | Actual value of interest<br>(you may embed [expressions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Expressions.md) | 1 | '' |
| `valueUnit` | Unit of the Y value displayed aside | 1 | '' |
| `valueColor` | Color of the value bar | 1 | '#69b3a2' |
| `range` | Data anges of defined by series of numbers | N | [] |
| `rangeColor` | Color of the range bands | N | [] |
| `showMarker` | Show/hide the marker line (true\|false) | 1 | true |
| `markerValue` | Value of the markder | 1 | 0 |
| `markerColor` | Color of the marker | 1 | 'black' |

### Parameters for a Month View
These key-value pairs should be placed under the key `month`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `mode` | Pick one mode of the two(circle\|annotation) | 1 | 
| `dataset` | Index of the dataset of your interest | 1~NT | all indices of non-x searchTarget |
| `startWeekOn` | First day of a week ('Sun'\|'Mon') | 1 | 'Sun' |
| `threshold` | Threshold to determine showing a circle on a day or not | 1~NT | 0 |
| `yMin` | Minimum value | 1~NT | Minimum value of the dataset |
| `yMax` | Maximum value | 1~NT | Maximum value of the dataset |
| `showCircle` | Circle the day label if the collected value reach the threshold (value > `threshold`) | 1 | true |
| `color` | Main color (can be override by other color parameters) | 1 | null |
| `dimNotInMonth` | Dim the color for days not in current month | 1 | true |
| `showStreak` | Show/hide streaks between circles | 1 | true |
| `showTodayRing` | Show/hide the ring on the label today | 1 | true |
| `showSelectedValue` | Show/hide the value on the selected day | 1 | true |
| `showSelectedRing` | Show/hide a ring on the label of the selected day | 1 | true |
| `circleColor` | Color of circles | 1 | '#69b3a2' |
| `circleColorByValue` | Display circle colors based on the value | 1 | false |
| `headerYearColor` | Color of the year text in header | 1 | 'white' |
| `headerMonthColor` | Color of the month text in header | 1 | 'white' |
| `dividingLineColor` | Color of the dividing line | 1 | '#69b3a2' |
| `todayRingColor` | Color of the ring on today | 1 | 'white' |
| `selectedRingColor` | Color of the ring on the selected day | 1 | 'firebrick' |
| `initMonth` | Initial month to show (YYYY-MM) | 1 | last month found |
| `showAnnotation` | Show/hide annotation | 1 | false |
| `annotation` | Annotation for each piece of data | NT | '' |
| `showAnnotationOfAllTargets` | Show annotation of all targets at the same time | 1 | false |


### Parameters for Pie Chart
These key-value pairs should be placed under the key `pie`.

| Key | Description | Number of Values | Default |
|:--------|:-------|:-----------:|:------|
| `title` | Title of this chart | 1 | '' |
| `data` | Array of values, each represents the number or fraction of a circular sector | N | '' |
| `dataColor` | Color of each circular sector | N | '' |
| `dataName` | Name of each data shown on legend | N | |
| `label` | Labels for each data shown on circular sector | N | |
| `hideLabelLessThan` | Hide the label with its fraction number lower than | 1 | 0.03 |
| `showExtLabelOnlyIfNoLabel` | Show/hide the external label only if the correstponding label is missing or empty (true\|false) | 1 | false |
| `extLabel` | Labels for each data shown aside out of circular sector | N | |
| `ratioInnerRadius` | Ratio of donut inner radius to pie radius | 1 | 0 |
| `showLegend` | Show/hide legend (true\|false) | 1 | false |
| `legendPosition` | Legend position (top\|bottom\|left\|right) | 1 | right |
| `legendOrientation` | Legend orientation (vertical\|horizontal) | 1 | horizontal for bottom and top<br>vertical for left and right |
| `legendBgColor` | Legend background color | 1 | none |
| `legendBorderColor` | Legend border color | 1 | white |
