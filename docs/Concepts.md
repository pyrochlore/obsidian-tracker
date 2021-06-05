# Concepts

This plugin was designed to read code blocks in [YAML format](https://en.wikipedia.org/wiki/YAML). The key-value pairs in the code blocks tell the plugin what data to collect and how to represent the result.

[Here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md) are all the parameters (key-value pairs) defined in this plugin. They are used for collecting data, evaluating targets, data preprocessing, and rendering output.

### Collecting Data
Providing parameters `searchType` and `searchTarget` is the minimum requirement for a successful data collection. `searchType` can be `tag`, `frontmatter`, `wiki`, `dvField`, `table`, `fileMeta`,or `text`. Then the cooresponding `searchTarget` should be provided according to the specified type.

### Target Evaluation
Depends on the `searchType` and the `searchTarget` you provided, the evaluation of a target would be different. Simply speaking, you can track the occurrences of a target or the value attached/embedded in it.

To see the detail about the target evaluation, please check the document [Target Evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md).

### Rendering Output
Currently, obsidian-tracker provides three kinds of rendering output, the default one 'line' for a line chart, 'bar' for a bar chart, and 'summary' for a text block. 

For 'line' or 'bar' output, the plugin will generate a customizable chart. For 'summary' output, a text block based on your '**template**' parameter will be generated. You can also use [pre-defined template variables](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TemplateVariables.md) in the template.

Description for the chart and summary related paremeters can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md#parameters-for-common-chart) and [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/InputParameters.md#parameters-for-summary) respectively.