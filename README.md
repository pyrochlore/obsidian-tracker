# Obsidian Tracker Plugin

![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

This is an [Obsidian](https://obsidian.md/) plugin that helps us track tags and/or texts in daily notes.

For example, we can track simple tag (#exercise-pushup), value-attached tag (#weight:60kg), nested tag (#finance/bank1/transfer:100000USD) and/or text '⭐' over a specified period of time. Currently, a line chart or templated texts will be generated to represent the data.

<img src="images/screenshot.png" width="800">

## Usage
1. Have some tags or texts you want to track in dialy notes.
2. Add a new note for displaying the tracker.
2. Place a tracker codeblock into the note (see the illustration below)
3. Inside the tracker codeblock, add YAML key-value pairs to specify the search condition and details of the output (a line chart for now). Key '**searchType**' and '**searchTarget**' are neccesary as minimum setup for a successful render.
5. Switch the view mode to 'Preview', then the codeblock will get rendered.

    <img src="images/usage.gif" width="400">

## Search Type and Search Target
The value of key '**searchType**' can be '**tag**' or '**text**'. 

If '**tag**' is picked, tags in your dialy notes will be counted and evaluated. Use the tag name (the name after #) as the value of key '**searchTarget**' or use quoted tag (**"#tagName"**) to make it work.

Simple tag like '*#tagName*' in your dialy note will be evaluated as a constant value (default value 1.0). You can customize the value by setting key '**constValue**' in the codeblock.

For advanced usage, a provided value can be attached to any tag. For example, write your own tag in the format of '*#tagName:value*'. The value should be appended right after your tag and a extra colon without spaces. If a value is attached this way, obsidian-trakcer will use the provided value instead of the constant one. 

It's worth to note that tags in frontmatter will also be counted and act like simple tags. Moreover, nested tags are supported both on simple and valued tags.

If '**text**' is picked for '**searchTarget**', the provid text will be counted and simply evaluated by occurence.

For more information about how to use this plugin, please take a look at [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples).

## Default Settings
You can set default folder location and date format in the plugin settings paenl. You can also override them by key '**folder**' and '**dateFormat**' in codeblock respectively.

Here are the list of default settings.

| Setting Item | Default | Description |
|:--------:|:-------:|:---------:|
| Default folder location | Root of this vault | The folder your dialy notes reside |
| Default date format | YYYY-MM-DD | The date format of your dialy note title |

## List of All Available Keys

### Root Keys
These keys are placed under YAML root

| Key | Default | Description |
|:--------:|:-------:|:-----------:|
| **searchType** | 'tag' or 'text' | The type of your search target |
| **searchTarget** | empty string | The tag name or text to search |
| **folder** | Default folder location | The folder path of your daily notes |
| **dateFormat** | Default date format | The date format of your dialy note title |
| **startDate** | Min date found | The start date to count |
| **endDate** | Max date found | the end date to count |
| **constValue** | 1.0 | The constant value of all simple tags |
| **ignoreAttachedValue** | false | Use constant value event if a value attached on |
| **accum** | false | Accumulatively sum the values over time |
| **penalty** | 0.0 | The value to use if search target is missing on the day |
| **line** | | All line-related keys should be placed under this key |

### Line-related Keys
These keys should be placed under key '**line**'.

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

## Release Notes

### v1.0.2

- Fix the searching of nested tag in frontmatter
- Reduce the package size by using Obsidian internal module

### v1.0.1

- Remove dependencies to Node.js modules
- Add example markdown files

### v1.0.0

First version released at 2021-03-23

- Track simple tags, value-attached tags, and texts using codeblock
- Represent the tracked data in a customizable line chart
- Allow tracking in-line tags and tags in frontmatter
- Allow tracking nested tags

## Features in Development

- [ ] New output type 'text', represent the analyzed data using user-defined template
- [ ] New output type 'heatmap' like Github calendar heatmap
- [ ] Support multiple tags or texts

And more ...

## Support

- If you like this plugin or want to support the further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
