# Road Map

- Data Collecting
    - [x] Support tracking key-value pairs in frontmatter
    - [x] Support searching text using regular expression
    - [x] Support multiple targets and multiple values
    - [x] Add a parameter xDataset to identify targets to be used as x values
    - [x] Allow tracking time values
    - [ ] Allow tracking date values
    - [x] Get data from a table
    - [x] Collect data from dataview plugin's inline fields
    - [x] Collect meta information from file
    - [x] Support tracking tasks
    - [ ] Allow manual data input (x and y values) in custom datasets
    - [ ] Allow forced value types
    - [ ] Allow using non-date x values
    - [ ] Allow multiple points (different time stamp) from a single file
- Output Type and Graph
    - [x] Implement output type 'summary', analyzes the input data and represents it using a user-defined text template
    - [x] Implement output type 'bar', rendering a bar chart
    - [x] Implement output type 'bullet', rendering
    - [x] Implement output type 'month', rendering a month view
    - [ ] Implement output type 'heatmap', rendering a heatmap like Github activity chart
    - [x] Implement output type 'pie', rendering a pie chart
    - [x] Add parameters for adjusting the size of the graph
    - [ ] Multiple outputs from one code block
    - [ ] Support graphs showing the correlation between sets of data
    - [ ] Allow a graph drawing selected dataset.
    - [x] Allow expressions evaluating operators and functions
    - [x] Allow format string for evaluated expressions
- Helper
    - [x] Add Commands help create Tracker blocks.
    - [ ] Add an 'Explode' button to the rendered blocks, it will replace the code block with the rendered result
    - [ ] Add a helper panel for adding frequently used tracking targets to article.
- Data Processing
    - [ ] Allow arithmetics operation on dataset and generate custom datasets
    - [ ] Add data post-process function, e.g. 'moving average'
- Performance
    - [ ] Use PixiJS to do rendering

And more ... Feature requests are welcome.

P.S. Features may not be implemented in the order above.