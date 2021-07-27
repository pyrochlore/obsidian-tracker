# Obsidian Tracker Plugin

![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

<img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/screenshot_v1.7.png" width="800">

This is an [Obsidian](https://obsidian.md/) plugin that helps you collect data from notes and represent it comprehensively.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md) is a table containing simplified examples showing what you can track.

## !!! Breaking Changes !!!

From version 1.9.0, template variables, e.g. '{{sum}}', are deprecated. Instead, Tracker provide operators (+, -, *, /, %) and functions (dataset(), sum(), maxStreak(), ......etc) to help us do data processing. For users having code blocks from previous version, please replace '{{sum}}' by '{{sum()}}' or '{{sum(1)}}' by '{{sum(dataset(1))}}'. More information about the new expressions could be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Expressions.md).

## What's New

Version 1.9.0
- Add a new output type `pie`, rendering a pie chart ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestPieChart.md))
- Allow expressions (operators and functions) as data inputs for output type `summary`, `bullet`, and `pie` (examples: [expression](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md), [summary](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestSummary.md), [bullet](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestBullet.md), [pie](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestPieChart.md))
- Allow formatting evaluated expressions by a follwing format string ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md))

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
    - [Expressions](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestExpression.md)
- [Examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md)
- [Plugin Settings](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Settings.md)
- [Release Notes](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/ReleaseNotes.md)
- [Road Map](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/RoadMap.md)
- [Frequently Asked Questions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Questions.md)

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
