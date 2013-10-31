FuzzyJS [![Build Status](https://travis-ci.org/bostrt/fuzzytime.js.png?branch=master)](https://travis-ci.org/bostrt/fuzzytime.js)
=======

FuzzyJS is a JavaScript library used for generating "fuzzy" timestamps.

Sometimes it is easier to read something like "45 minutes ago" instead of "2013-05-10 11:30:38 AM", right? FuzzyJS lets
you do that. Also, FuzzyJS lets you generate those "fuzzy" timestamps using templates (a.k.a format strings) like:

  - `"%h hours ago"`
  - `"%m minute`
  - or even `"%M months in the future"`.
  
FuzzyJS supports [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Durations) Durations (e.g. "1Y15D", "T45M", etc.) for specifying time deltas.
  
Quick Start
======
```javascript
// Create new Fuzzy instance
var fuzzy = new Fuzzy();

// Setup a format string to return AFTER a day has passed
fuzzy.after('%d days ago', '1D');

// Setup a format string to return BEFORE a day has passed
fuzzy.before('%h hours ago', '1D');

// Setup a format string to return AT an hour and a half
fuzzy.at('an hour and a half', 'T1.5H');

// Generate a "fuzzy" timestamps for the difference between two dates
var result = fuzzy.build(new Date('2013-10-27'), new Date('2013-10-29'));
result == "2 days ago"; // TRUE

result = fuzzy.build(new Date('2013-10-27 13:00:00'), new Date('2013-10-27 16:00:00'));
result == "3 hours ago"; // TRUE

// If no second date is provided, the current date-time is used.
// Let's pretend the current time is exactly an hour and a half ahead of the date below
result = fuzzy.build(new Date('2013-10-27 11:45:04'));
result == "an hour and a half ago"; // TRUE

```

Documentation
========
http://bostrt.github.io/fuzzyjs/

Contribute
========
Issues: https://github.com/bostrt/fuzzyjs/issues

Test
====

`npm install`

`npm test`
