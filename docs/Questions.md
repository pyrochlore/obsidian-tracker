# Frequently Asked Questions

- Does Tracker only track data in daily notes (notes named by dates)?

    No. From version 1.6.0, you can use collect date data from file meta data with search type `fileMeta` and use that dataset as `xDataset`. So any notes can be included.

- Does Tracker only track data over dates?

    Yes. The data type of x values should be in the form of date for now. This constrain might be relaxed in future.

- Why my line chart looks broken at some points?

    The plugin only connects adjacent points (by date) by default. To force it connecting points over missing data, set the parameter `fillGap` under `line` to true.

- Why the plugin shows 'No notes found under the given search condition'?

    There are few possibilities for this error messages.
    1. No files in the given folder
    2. No files or x data values matched the dateFormat you gave in the given folder
    3. No files in the date range you gave (from startDate to endDate)

- Why the plugin shows 'Error parsing YAML'?

    There are syntax errors in your code block. Please check [this document](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/YAML.md) for common mistakes.

- Why no data (points or lines) is shown in my chart?

    That means no matched data found in your notes. Please check `searchType` and `searchTarget` in your notes and the document for [target evaluation](https://github.com/pyrochlore/obsidian-tracker/blob/master/docs/TargetEvaluation.md).

    For example, if you were doing tag search (`searchType` input is `tag`), an additional space between the colon and the value will leads to data missing. If the space in between is a must, you can use `text` search with regular expression instead of `tag`. Here is an example.

    To Track '#tagName: 10' in daily notes. Use
```
searchType: text
searchTarget: 'tagName:\s(?<value>[0-9]+)'
......
```
    More cases can be found [here](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/TrackUsingRegex.md)

---

Please also check [these trackers](https://github.com/pyrochlore/obsidian-tracker/blob/master/examples/ErrorMessages.md) for more cases leading to error messages.

---

Still have problems?? You might encounter bugs.
Welcome to leave an issue [here](https://github.com/pyrochlore/obsidian-tracker/issues).