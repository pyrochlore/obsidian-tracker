# Obsidian Tracker Plugin

![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

<img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/screenshot_v1.9.png" width="800">

This is an [Obsidian](https://obsidian.md/) plugin that helps you collect data from notes and represent it comprehensively.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md) is a table containing simplified examples showing what you can track.

## What's New
Version 1.10.0
- Add annotation mode for month view ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestCalendar.md))
- Add parameters `xAxisTickInterval`, `yAxisTickInterval`, `xAxisTickLabelFormat` and `yAxisTickLabelFormat` for the line and bar chart ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestAxisIntervalAndFormat.md))
- Allow using regular expression in parameter `dateFormatPrefix` and `dateFormatSuffix` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md))
- Add parameters `file`, `specifiedFilesOnly`, `fileContainsLinkedFiles`, and `fileMultiplierAfterLink` to retrieve data from specified files ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestSpecifiedFiles.md))
- Add a parameter `textValueMap` to convert texts or emojis to specified values ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTextValueMap.md))
- Fixed bugs
- Enhanced error messages

## !!! Breaking Changes !!!

From version 1.9.0, template variables, e.g. '{{sum}}', are deprecated. Instead, Tracker provide operators (+, -, *, /, %) and functions (dataset(), sum(), maxStreak(), ......etc) to help us do data processing. For users having code blocks from previous version, please replace '{{sum}}' by '{{sum()}}' or '{{sum(1)}}' by '{{sum(dataset(1))}}'. More information about the new expressions could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Expressions.md).

## Usage

1. Have some targets you want to track in daily notes.
2. Add a new note for displaying the tracker.
3. Add tracker code blocks manually ([examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples)) or using [commands](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Commands.md).
4. Switch the document view mode to 'Preview', then the code block will get rendered.

For more use cases, please download and open the [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples) folder in obsidian with this plugin installed and enabled.

## More Details You May Want to Know
- [Installation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Installation.md): Install the plugin from Obsidian or install it manually
- [Concepts](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Concepts.md): Explain how this plugin works and what to setup
    - [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)
    - [Input Parameters](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)
    - [Expressions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Expressions.md)
- [Examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md)
- [Plugin Settings](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Settings.md)
- [Release Notes](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/ReleaseNotes.md)
- [Road Map](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/RoadMap.md)
- [Frequently Asked Questions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Questions.md)

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
