# Wiki Tracker

wiki --> Try parse the display text first, if it does not exist, parse the link text
wiki.link --> Parse the link text
wiki.display --> Parse the display text

In the example notes, we have
[[todo_family|To-Do @Family]]
[[todo_work|To-Do @Work]]

## wiki.link
``` tracker
searchType: wiki.link
searchTarget: todo_work
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
summary:
    template: '{{sum()::i}}'
```

## wiki.display
``` tracker
searchType: wiki.display
searchTarget: To
folder: diary
startDate: 2021-01-01
endDate: 2021-01-31
summary:
    template: '{{sum()::i}}'
```


Please also check those search targets in markdown files under folder 'diary'.
