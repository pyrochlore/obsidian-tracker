# Obsidian Tracker Plugin
![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

This is an [Obsidian](https://obsidian.md/) plugin that helps you do tracking in daily notes. You can track:
tags
track the number of occurrences of in-line tags (e.g. #meditation)
track the number of occurrences of front matter tags (e.g. tags: meditation)
track the value after a tag (e.g. #weight:60.5kg)
track the value after a nested inline tag (e.g. #finance/bank1/transfer:100000USD and the parent tag #finance/bank1)
front matter key-value pairs  
track the value of a key in the front matter (e.g. mood: 10)
wiki links 
track the number of occurrences of wiki links (e.g. [[journal]])
text
track the number of occurrences of texts (e.g.  '⭐', 'love', or any text that matches your regex expression)
track the value embedded in texts using regular expression (e.g. walk 1000 steps, weightlifting: 50)

<img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/Screenshot_v1.1.png" width="800">

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
1. Have some tags or texts you want to track in daily notes. Take a look at [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md) for what you can track and how targets are evaluated as numbers.
2. Add a new note for displaying the tracker.
3. Add tracker code blocks manually or using commands. See [Commands](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Commands.md) for more detail.
4. Switch the document view mode to 'Preview', then the code block will get rendered.

    <img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/usage_v1.1.gif" width="400">

For more use cases, please take a look at [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples).

## Concepts
This plugin was designed to read code blocks in [YAML format](https://en.wikipedia.org/wiki/YAML). The key-value pairs in the code blocks tell the plugin what data to collect and how to render the result.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md) are all the parameters (key-value pairs) defined in this plugin. They are used for collecting data, evaluating targets, data preprocessing, and rendering output.

### Collecting Data
Providing key '**searchType**' and '**searchTarget**' is the minimum requirement for a successful data collection and rendering. The value of key '**searchType**' can be '**tag**', '**frontmatter**', '**wiki**', or '**text**', and the cooresponding '**searchTarget**' is the name of a tag or a piece of text as your search target.

### Target Evaluation
Depends on the searchType and the format of your targets, the target evaluation would be different. You can simply track the occurrences of a target or track value attached or embedded in it.

For more information about the tag evaluation, please check documents for [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)

### Rendering Output
Currently, obsidian-tracker provides two kinds of rendering output, the default one 'line' for line chart and 'summary' for text description. 

For 'line' output, the plugin will generate a customizable line chart. For 'summary' output, you can use [pre-defined template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) in text template (key '**template**' under key '**summary**').

Description of keys for rendering line-chart and summary output can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md)

### Plugin Settings

Plugin settings 'default folder' and 'default date format, are removed in version 1.2.0. Now the default folder and date format align the settings in the core plugin 'Daily notes'. If the plugin isn't installed, the default values would be '/' and 'YYYY-MM-DD'. You can still override them by using the keys 'folder' and 'dateFormat' in YAML.

## Release Notes
### v1.2.0
- Enable using regular expression in text searching.
- New search type 'frontmatter', searching numerical key-value pair in the front matter.
- New search type 'wiki'.
- Reduce package size.

### v1.1.0
- New output type 'summary'.
- Add commands help create Tracker code blocks.
- Relax the regex for searching tags, allow tags embedded in sentences.
- Fix issues.

### v1.0.2
- Fix the searching of nested tag in frontmatter.
- Reduce the package size by using the module from Obsidian.

### v1.0.1
- Remove dependencies to Node.js modules.
- Add example markdown files.

### v1.0.0
First version released at 2021-03-23.

- Track simple tags, value-attached tags, and texts using code blocks.
- Represent the tracked data in a customizable line chart.
- Allow tracking in-line tags and tags in frontmatter.
- Allow tracking nested tags.

## Road Map
- [x] New output type 'summary', analyzes the input data and represents it using a user-defined text template.
- [x] Add Commands help create Tracker blocks.
- [ ] New output type 'table', lists the search result in a formatted table.
- [ ] New output type 'heatmap', works like Github calendar heatmap.
- [ ] New output type 'bar', renders bar chart.
- [ ] Support multiple targets and multiple values.
- [x] Support searching text using regular expression.
- [x] Support tracking key-value pairs in frontmatter.
- [ ] Add data post-process function, like 'moving average'.
- [ ] Add an 'Explode' button to the rendered blocks, it will replace the code block with the rendered result.
- [ ] Support graphs showing the correlation between sets of data

And more ...

P.S. Items may not be implemented in the order above.

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)