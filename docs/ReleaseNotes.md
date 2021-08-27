# Release Notes

## v1.10.3
- Allow using the parameter `fitPanelWidth` with the output type `month` and `pie`
- Fixed the resizing and positioning of the chart tooltip

## v1.10.2
- Fixed plugin not rendering on some macOS machines

## v1.10.1
- Fixed 'failed to load plugin' on iOS

## v1.10.0
- Add annotation mode for month view ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestCalendar.md))
- Add parameters `xAxisTickInterval`, `yAxisTickInterval`, `xAxisTickLabelFormat` and `yAxisTickLabelFormat` for the line and bar chart ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestAxisIntervalAndFormat.md))
- Allow using regular expression in parameter `dateFormatPrefix` and `dateFormatSuffix` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md))
- Add parameters `file`, `specifiedFilesOnly`, `fileContainsLinkedFiles`, and `fileMultiplierAfterLink` to retrieve data from specified files ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestSpecifiedFiles.md))
- Add a parameter `textValueMap` to convert texts or emojis to specified values ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTextValueMap.md))
- Fixed bugs
- Enhanced error messages

## v1.9.2
- Allow using seconds in time values
- Fixed error parsing `dvField`

## v1.9.1
- Fixed errors on collecting time values from `dvField`
- Fixed errors on collecting wiki while fileCache.links is undefined

## v1.9.0
- Add a new output type `pie`, rendering a pie chart ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestPieChart.md))
- Allow expressions (operators and functions) as data inputs for output type `summary`, `bullet`, and `pie` (examples: [expression](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md), [summary](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestSummary.md), [bullet](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestBullet.md), [pie](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestPieChart.md))
- Allow formatting evaluated expressions by a follwing format string ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md))

## v1.8.2
- Fixed tasks searching not working for multiple targets

## v1.8.1
- Fixed bugs while using month view with parameter `xDataset`

## v1.8.0
- Add a new `searchType` `task`, retrieving data from tasks ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTask.md))
- Enhancement
    - Month view ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestCalendar.md))
        - Add parameter `circleColorByValue` to show color based on the value
        - Support multiple targets (dataset), change the dataset by clicking the header 
        - Add a button (◦) to show current month
    - Accept ISO-8601 date as `dateFormat` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#iso-8601-date-format))
    - Relative date input for `startDate` and `endDate` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate))
- Fixed missing dvField values at the last line of files

## v1.7.0
- Add a new output type 'month', rendering a month view for a given dataset ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestCalendar.md))

## v1.6.1
- Add new targets 'numWords', 'numChars', and 'numSentences' for input type 'fileMeta' ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestWordCounting.md))

## v1.6.0
- Add a new input type 'fileMeta', getting meta data from a file ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestFileMeta.md))
- Add a new output type 'bullet', rendering a bullet chart ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestBullet.md))
- Enhancement
    - Accept tracking time values ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTimeValues.md))
    - Allow tracking nested values from front matter
    - Allow using dataset with date values as xDataset ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestXDataset.md))
    - Add more template variables ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTemplateVariables.md))
    - Allow parsing date in wiki brackets
- Fixed bugs

## v1.5.1
- Fixed labels not shown in light theme
- Enhanced error handling for searchType 'table'

## v1.5.0
- New searchType 'table', searching records from a given table
- New searchType 'dvField', searching the inline fields used with Dataview plugin
- Enhance multiple values extraction
    - Allow using multiple values in searchType 'text'
    - Allow using array values in searchType 'frontmatter'
    - Allow using multiple values in searchType 'dvField'
    - Allow using multiple values in searchType 'table'
    - Allow using custom separator for multiple values extraction
- Improved performance
- Reduced package size

## v1.4.1
- Enhanced error handling

## v1.4.0
- Add a new parameter (fixedScale) for the scaling of the output chart
- Add a new parameter (fitPanelWidth) to enable/disable the auto-scaling of the output chart
- Add a new parameter (margin) to help to position the chart
- Tested in Obsidian mobile app on iPhone and iPad
- Fixed bugs

## v1.3.0
- Support reading and rendering multiple targets
- Support reading and rendering multiple values (a tuple of values) under a target
- New output type 'bar', rendering a bar chart
- Add a legend for the chart output
- Fixed bugs

## v1.2.1
- Fixed files with the specified dateFormat are not recognized
- Restored the plugin's settings panel for dateFormat and folder

## v1.2.0
- Enable using regular expression in text searching
- New search type 'frontmatter', searching for key-value pairs in the front matter
- New search type 'wiki', searching for wiki links
- Reduced package size

## v1.1.0
- New output type 'summary'
- Add commands help create Tracker code blocks
- Relaxed the regex for searching tags, allowing tags embedded in sentences
- Fixed issues

## v1.0.2
- Fixed the searching of nested tag in frontmatter
- Reduced the package size by using the module from Obsidian

## v1.0.1
- Remove dependencies to Node.js modules
- Add example markdown files

## v1.0.0
First version released at 2021-03-23

- Track simple tags, value-attached tags, and texts using code blocks
- Represent the tracked data in a customizable line chart
- Allow tracking in-line tags and tags in frontmatter
- Allow tracking nested tags