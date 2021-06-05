# Release Notes

### v1.6.0
- Add a new input type 'fileMeta', getting meta data from a file
- Add a new output type 'bullet', rendering a bullet chart
- Enhancement
    - Accept tracking time values
    - Allow tracking nested values from front matter
    - Allow using dataset with date values as xDataset
    - Add more template variables
    - Allow parsing date in wiki brackets
- Fixed bugs

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
- Improved performance
- Reduced package size

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
- New output type 'bar', rendering a bar chart
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