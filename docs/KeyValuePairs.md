# Key-Value Pairs

## Key-Value Pairs for Data Collection, Target Evaluation, and Data Preprocessing
These keys are placed under the YAML root

| Key | Default | Description |
|:--------:|:-------:|:-----------:|
| **searchType** | 'tag' or 'text' | The type of your search target |
| **searchTarget** | Empty string | The tag name or text to search |
| **folder** | Default folder location | The folder path of your daily notes |
| **dateFormat** | Default date format | The date format of your dialy note title |
| **startDate** | Min date found | The start date to count |
| **endDate** | Max date found | The end date to count |
| **constValue** | 1.0 | The constant value of all simple tags |
| **ignoreAttachedValue** | false | Use constant value event if the tag has a value attached on |
| **ignoreZeroValue** | false | Treat zero value as missing value |
| **accum** | false | Accumulatively sum the values over time |
| **penalty** | null | The value to use if search target is missing on the day |
| **line** | | All line-chart related keys should be placed under this key |
| **summary** | | All summary keys should be placed under this key |

### Line Chart Related Keys
These keys should be placed under the root key '**line**'.

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

### Summary Related Keys
These keys should be placed under the root key '**summary**'.

| **template** | Empty string | Text template (May include [template variables](docs/TextExpansion.md)) |
| **style** | Empty string | css style for the rendered text block |