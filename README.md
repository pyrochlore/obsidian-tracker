# Obsidian Tracker Plugin
![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

<img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/screenshot_v1.3.png" width="800">

This is an [Obsidian](https://obsidian.md/) plugin that helps you do tracking in daily notes and represent the data comprehensively. Here are examples showing what you can track:

| From↓ | Track Targets↓  | by Tracker↓ | Get (O)ccurrence/(V)alue |
|:--------|:-------|:---------|:--:|
| content | #meditation | searchType: tag<br>searchTarget: meditation | O |
| frontmatter | ---<br>tags: meditation<br>--- | searchType: tag<br>searchTarget: meditation | O |
| content | #weight:60.5kg | searchType: tag<br>searchTarget: weight | V |
| content | #finance/bank1/transfer:100USD | searchType: tag<br>searchTarget: finance/bank1/transfer | V |
| content | #finance/bank1/transfer:100USD<br>#finance/bank1/income:80USD<br>#finance/bank1/outcome:-120USD | searchType: tag<br>searchTarget: finance/bank1 | V |
| content | #blood-pressure:180/120 | searchType: tag<br>searchTarget: blood-pressure[0], blood-pressure[1] | V |
| content | dvTarget:: 20.5 | searchType: dvField<br>searchTarget: dvTarget | V |
| content | dvTarget:: 20.5/30.5 | searchType: dvField<br>searchTarget: dvTarget[0], dvTarget[1] | V |
| content | dvTarget:: 20.5, 30.5 | searchType: dvField<br>searchTarget: dvTarget[0], dvTarget[1]<br>separator: ',' | V |
| frontmatter | ---<br>mood: 10<br>--- | searchType: frontmatter<br>searchTarget: mood | V |
| frontmatter | ---<br>bp: 184.4/118.8<br>--- | searchType: frontmatter<br>searchTarget: bp[0], bp[1] | V |
| frontmatter | ---<br>bp: 184.4, 118.8<br>--- | searchType: frontmatter<br>searchTarget: bp[0], bp[1]<br>separator: ',' | V |
| frontmatter | ---<br>bp: [184.4, 118.8]<br>--- | searchType: frontmatter<br>searchTarget: bp[0], bp[1] | V |
| content | [[journal]] | searchType: wiki<br>searchTarget: journal | O |
| content | ⭐ | searchType: text<br>searchTarget: ⭐ | O |
| content | love | searchType: text<br>searchTarget: love | O |
| content | test@gmail.com<br>test@hotmail.com | searchType: text<br>serchTarget: '.+\\@.+\\..+' | O |
| content | #weightlifting: 50 | searchType: text<br>searchTarget: 'weightlifting: (?\<value\>[\\-]?[0-9]+[\\.][0-9]+\|[\\-]?[0-9]+)' | V |
| content | I walked 10000 steps today. | searchType: text<br>searchTarget: 'walked\\s+(?\<value\>[0-9]+)\\s+steps' | V |
| content | myvalues 1/2/3 | searchType: text<br>searchTarget: 'myvalues\\s+(?\<value\>[0-9]+)/([0-9]+)/([0-9]+), myvalues\\s+([0-9]+)/(?\<value\>[0-9]+)/([0-9]+), myvalues\\s+([0-9]+)/([0-9]+)/(?\<value\>[0-9]+)' | V |
| content | { a table filled with dates and values }<br>[example table](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/data/Tables.md) | searchType: table<br>searchTarget: filePath[0][0], filePath[0][1] | V |
| content | { a table filled with dates and values }<br>[example table](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/data/Tables.md) | searchType: table<br>searchTarget: filePath[1][0], filePath[1][1][0], filePath[1][1][1] | V |

## Installation
### Install from Obsidian Settings Panel
1. From Settings Panel (the icon at the bottom left corner) -> Options -> Community plugins, set 'safe mode' to off.
2. In the 'Community plugins' section, click 'Browse' and find the obsidian-tracker plugin by the name 'Tracker'.
3. Press the button 'Install' and wait for the completion of the install.
4. In the section 'Installed plugins', find and enable the plugin just installed.
5. Enjoy tracking.

### Manual Installation
Download the latest [release](https://github.com/pyrochlore/obsidian-tracker/releases). Extract and put the three files (main.js, manifest.json, styles.css) to folder '{{obsidian_vault}}/.obsidian/plugins/obsidian-tracker'.

## Usage
1. Have some targets you want to track in daily notes. Take a look at [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md) for what you can track and how targets are evaluated as numbers.
2. Add a new note for displaying the tracker.
3. Add tracker code blocks manually or using commands. See [Commands](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Commands.md) for more detail.
4. Switch the document view mode to 'Preview', then the code block will get rendered.

    <img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/usage_v1.3.gif" width="400">

For more use cases, please open the [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples) folder in obsidian with this plugin installed and enabled.

## Concepts
This plugin was designed to read code blocks in [YAML format](https://en.wikipedia.org/wiki/YAML). The key-value pairs in the code blocks tell the plugin what data to collect and how to represent the result.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md) are all the parameters (key-value pairs) defined in this plugin. They are used for collecting data, evaluating targets, data preprocessing, and rendering output.

### Collecting Data
Providing parameters '**searchType**' and '**searchTarget**' is the minimum requirement for a successful data collection. The value of the key '**searchType**' can be '**tag**', '**frontmatter**', '**wiki**', '**dvField**', '**table**', or '**text**' and the cooresponding '**searchTarget**' should be provided according to the specified type.

#### Multiple Targets
From version 1.3, you can provide multiple search targets by entering an array of targets separated by a comma. Each of the targets will be identified then the corresponding value will be evaluated and form a dataset indexed by the order in the array (zero-based indexing).

```
searchTarget: target0, target1, target2, ...... 
searchType: type0, type1, type2, .....
line:
    lineColor: red, blue, yello
```
Above is an example of multiple target searching. Multiple targets are provided and separated by a comma. If they have a different searchType, provide the same number of types in the same order. In this case, the second search target 'target1' with index 1 has type 'type1'. Other parameters that accept multiple values (e.g. lineColor) can also be provided and will be applied to the corresponding dataset.

#### Multiple Values
Multiple values under a target (value tuple) separated by a slash, e.g. #bloodpressure:180/120mmHg, are also got supported in version 1.3.0. To identify a specific value as a target, use an accessor with bracket notation where the value in the bracket is the index by the order of values. In this case, they are bloodpressure[0] and bloodpressure[1]. You can find the example of this [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/BloodPressureTracker.md). You can also use a custom separator by using the parameter '**separator**'.

### Target Evaluation
Depends on the '**searchType**' and the '**searchTarget**' you provided, the evaluation of a target would be different. Simply speaking, you can track the occurrences of a target or the value attached/embedded in it.

To see the detail about the target evaluation, please check the document [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md).

### Rendering Output
Currently, obsidian-tracker provides three kinds of rendering output, the default one 'line' for a line chart, 'bar' for a bar chart, and 'summary' for a text block. 

For 'line' or 'bar' output, the plugin will generate a customizable chart. For 'summary' output, a text block based on your '**template**' parameter will be generated. You can also use [pre-defined template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) in the template.

Description for the chart and summary related paremeters can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md#parameters-for-common-chart) and [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md#parameters-for-summary) respectively.

### Plugin Settings
You can set the default folder location and date format in the plugin's settings panel. You can also override them by key '**folder**' and '**dateFormat**' in the code block respectively.

| Setting Item | Description | Default | 
|:--------|:-------|:---------|
| Default folder location | The folder your daily notes reside | Root of the vault |
| Default date format | The date format of your daily note title | 'YYYY-MM-DD' | 

For more information about the dateFormat settings, check the [TestDateFormats example](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TestDateFormats.md) and [moment.js string format](https://momentjs.com/docs/#/parsing/string-format/). 

## Release Notes
### v1.5.1
- Fixed labels not shown in light theme
- Enhanced error handling for searchType 'table'

### v1.5.0
- New searchType 'table', searching records from a given table
- New searchType 'dvField', searching the inline fields used with Dataview plugin
- Enhance multiple values extraction
    - Allow using multiple values in searchType 'text'
    - Allow using array values in searchType 'frontmatter'
    - Allow using multiple values in searchType 'dvField'
    - Allow using multiple values in searchType 'table'
    - Allow using custom separator for multiple values extraction
- Improve performance
- Reduce package size

### v1.4.1
- Enhanced error handling

### v1.4.0
- Add a new parameter (fixedScale) for the scaling of the output chart
- Add a new parameter (fitPanelWidth) to enable/disable the auto-scaling of the output chart
- Add a new parameter (margin) to help to position the chart
- Tested in Obsidian mobile app on iPhone and iPad
- Fixed bugs

### v1.3.0
- Support reading and rendering multiple targets
- Support reading and rendering multiple values (a tuple of values) under a target
- New output type 'bar', rendering bar chart
- Add a legend for the chart output
- Fixed bugs

### v1.2.1
- Fixed files with the specified dateFormat are not recognized
- Restored the plugin's settings panel for dateFormat and folder

### v1.2.0
- Enable using regular expression in text searching
- New search type 'frontmatter', searching for key-value pairs in the front matter
- New search type 'wiki', searching for wiki links
- Reduced package size

### v1.1.0
- New output type 'summary'
- Add commands help create Tracker code blocks
- Relaxed the regex for searching tags, allowing tags embedded in sentences
- Fixed issues

### v1.0.2
- Fixed the searching of nested tag in frontmatter
- Reduced the package size by using the module from Obsidian

### v1.0.1
- Remove dependencies to Node.js modules
- Add example markdown files

### v1.0.0
First version released at 2021-03-23

- Track simple tags, value-attached tags, and texts using code blocks
- Represent the tracked data in a customizable line chart
- Allow tracking in-line tags and tags in frontmatter
- Allow tracking nested tags

## Road Map
- Data Collecting
    - [x] Support tracking key-value pairs in frontmatter
    - [x] Support searching text using regular expression
    - [x] Support multiple targets and multiple values.
    - [x] Add a parameter xDataset to identify targets to be used as x values
    - [ ] Allow tracking date and time values
    - [x] Get data from a table
    - [x] Collect data from dataview plugin's inline fields
    - [ ] Allow manual data input, includes template varialbes embeded in
    - [ ] New search type 'codeblock'
- Output Type and Graph
    - [x] New output type 'summary', analyzes the input data and represents it using a user-defined text template.
    - [x] New output type 'bar', renders bar chart.
    - [x] New output type 'table', lists the search result in a formatted table.
    - [ ] New output type 'heatmap', works like Github calendar heatmap.
    - [x] Add parameters for adjusting the size of the graph.
    - [ ] Multiple outputs from one code block
    - [ ] Support graphs showing the correlation between sets of data.
    - [ ] Add a 'targetDataSet' key to graph, allow the graph drawing selected dataset.
    - [ ] Evaluate template parameters by predefined function and arithmetics.
- Helper
    - [x] Add Commands help create Tracker blocks.
    - [ ] Add an 'Explode' button to the rendered blocks, it will replace the code block with the rendered result.
    - [ ] Add a helper panel for adding frequently used tracking targets to article.
- Data Processing
    - [ ] Allow arithmetics operation on dataset and generate new datasets
    - [ ] Add data post-process function, e.g. 'moving average'
- Performance
    - [ ] Use PixiJS to do rendering

And more ...

P.S. Features may not be implemented in the order above.

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
