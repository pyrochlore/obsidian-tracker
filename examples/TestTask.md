# Test Task

## Summary
All Tasks
``` tracker
searchType: task
searchTarget: Say I love you
folder: diary
summary:
    template: "Total count: {{sum}}"
```

All tasks
``` tracker
searchType: task.all
searchTarget: Say I love you
folder: diary
summary:
    template: "Total count: {{sum}}"
```

Task done
``` tracker
searchType: task.done
searchTarget: Say I love you
folder: diary
summary:
    template: "How many days I said: {{sum}}"
```

Task not done
``` tracker
searchType: task.notdone
searchTarget: Say I love you
folder: diary
summary:
    template: "How many days I didn't say: {{sum}}"
```

## Month View
``` tracker
searchType: task.notdone
searchTarget: Say I love you
folder: diary
datasetName: Love
month:
```