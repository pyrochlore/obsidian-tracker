# Road Map

- Data Collecting
    - [x] Support tracking key-value pairs in frontmatter
    - [x] Support searching text using regular expression
    - [x] Support multiple targets and multiple values
    - [x] Add a parameter xDataset to identify targets to be used as x values
    - [x] Allow tracking time values
    - [x] Get data from a table
    - [x] Collect data from dataview plugin's inline fields
    - [x] Collect meta information from file
    - [x] Support tracking tasks
    - [ ] Allow manual data input (x and y values)
    - [ ] Allow forced value types
    - [ ] Allow using non-date x values
- Output Type and Graph
    - [x] New output type 'summary', analyzes the input data and represents it using a user-defined text template
    - [x] New output type 'bar', rendering a bar chart
    - [x] New output type 'bullet', rendering
    - [x] New output type 'month', rendering a month view
    - [ ] New output type 'heatmap', rendering a heatmap like Github activity chart
    - [x] Add parameters for adjusting the size of the graph
    - [ ] Multiple outputs from one code block
    - [ ] Support graphs showing the correlation between sets of data.
    - [ ] Allow a graph drawing selected dataset.
    - [ ] Evaluate template variables by arithmetics and predefined functions.
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