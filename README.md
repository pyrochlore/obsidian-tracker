# Obsidian Tracker Plugin
![GitHub release](https://img.shields.io/github/v/release/pyrochlore/obsidian-tracker)

This is an [Obsidian](https://obsidian.md/) plugin that helps you track tags and/or texts in daily notes.

For example, one can track simple tag (#exercise-pushup), value-attached tag (#weight:60kg), nested tag (#finance/bank1/transfer:100000USD) or text ('⭐', 'love', '👍', or '👎') over a specified period of time. Currently, a line chart or a summary will be generated to represent the tracked result.

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
1. Have some tags or texts you want to track in daily notes. Take a look at [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md) to know what you can track.
2. Add a new note for displaying the tracker.
3. Add tracker code blocks manually or using commands. See [Commands](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/Commands.md) for more detail.
4. Switch the document view mode to 'Preview', then the code block will get rendered.

    <img src="https://raw.githubusercontent.com/pyrochlore/obsidian-tracker/master/docs/images/usage_v1.1.gif" width="400">

For more use cases, please take a look at [examples](https://github.com/pyrochlore/obsidian-tracker/tree/master/examples).

## Concepts
This plugin was designed to read code blocks in [YAML format](https://en.wikipedia.org/wiki/YAML). The key-value pairs in the code blocks tell the plugin what data to collect and how to render the result.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/KeyValuePairs.md) are all the keys defined in this plugin. They are used for collecting data, evaluating targets, data preprocessing, and rendering output.

### Collecting Data
Providing key '**searchType**' and '**searchTarget**' is the minimum requirement for a successful data collection. The value of key '**searchType**' can be '**tag**' or '**text**', while the '**searchTarget**' is the name of a tag or a piece of text you want to search.

### Target Evaluation
Depends on the searchType and the format of your targets, target evaluation can be different. Obsidian-tracker supports tracking simple tags, value-attached tags, nested tags, and text.
For more information about the tag evaluation, please check documents for [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md)

### Rendering Output
Currently, obsidian-tracker provides two kinds of rendering output, 'line chart', and 'summary'. 

The default rendering output is 'line chart'. If key '**summary**' is not found at the YAML root, the output will be always 'line chart', otherwise, it will render 'summary' as output. You can use [pre-defined template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TextExpansion.md) in text template (key '**template**' under key '**summary**').

Description of keys for rendering line-chart and summary output can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/KeyValuePairs.md)

### Plugin Settings
You can set the default folder location and date format in the plugin's settings panel. You can also override them by key '**folder**' and '**dateFormat**' in the code block respectively.

Here is the list of default settings.

| Setting Item | Default | Description |
|:--------:|:-------:|:---------:|
| Default folder location | Root of the vault | The folder your daily notes reside |
| Default date format | YYYY-MM-DD | The date format of your daily note title |

## Release Notes
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
- [ ] Support multiple targets and multiple values.
- [ ] Support searching text using regular expression.
- [ ] Support tracking keys other than tags in frontmatter.
- [ ] Add data post-process function, like 'moving average'.
- [ ] Add an 'Explode' button to the rendered blocks, it will replace the code block with the rendered result.

And more ...

P.S. Items may not be implemented in the order above.

## Support
- If you like this plugin or want to support further development, you can [Buy Me a Coffee](https://www.buymeacoffee.com/pyrochlore).
- Please report bugs and request features in [GitHub Issues](https://github.com/pyrochlore/obsidian-tracker/issues)
