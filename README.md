# Obsidian Tracker Plugin
![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

<img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/screenshot_v1.7.png" width="800">

This is an [Obsidian](https://obsidian.md/) plugin that helps you do tracking in notes and represent the collected data comprehensively. 

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md) is a simplified table of examples showing what you can track.

## What's New
Version 1.8.0
- Add a new `searchType` `task`, retrieving data from tasks ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestTask.md))
- Enhancement
    - Month view ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestCalendar.md))
        - Add parameter `circleColorByValue` to show color based on the value
        - Support multiple targets (dataset), change the dataset by clicking the header 
        - Add a button to show current month
    - Accept ISO-8601 date as `dateFormat` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#iso-8601-date-format))
    - Relative date input for `startDate` and `endDate` ([examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md#relative-date-input-for-startdate-and-enddate))
- Fixed missing dvField values at the last line of files

Version 1.8.1
- Fixed bugs while using month view with parameter `xDataset`

Version 1.8.2
- Fixed tasks searching not working for multiple targets

## Usage
1. Have some targets you want to track in daily notes.
2. Add a new note for displaying the tracker.
3. Add tracker code blocks manually or using [commands](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Commands.md).
4. Switch the document view mode to 'Preview', then the code block will get rendered.

    <img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/usage_v1.3.gif" width="400">

For more use cases, please download and open the [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples) folder in obsidian with this plugin installed and enabled.

## More Details You May Want to Know
- [Installation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Installation.md): Install the plugin from Obsidian or install it manually
- [Concepts](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Concepts.md): Explain how this plugin works and what to setup
    - [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)
    - [Input Parameters](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)
    - [Template Variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md)
- [Examples](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Examples.md)
- [Plugin Settings](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Settings.md)
- [Release Notes](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/ReleaseNotes.md)
- [Road Map](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/RoadMap.md)
- [Frequently Asked Questions](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Questions.md)

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
