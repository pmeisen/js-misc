# js-misc
JavaScript with several miscellaneous stuff. The library provides for example:

- utilities to simplify dates usage
- utilities to work with intervals
- utilities to format and work with numbers

## How to Install

The library can be used with `bower`, `nodeJs (npm)`, `requireJs` or as individual `JavaScript Import`. The following paragraphs 
explain how to use the library in the different scenarios.

### Using the Miscellanious Library with `bower`

```
bower install --save js-misc
```

The library will be added to your `bower-components`. By default the `js-misc.js` is selected as single main file, which is the
not minified version of the library (the minified/uglified version is `js-misc.min.hs`). If used within a browser, the different 
libraries are bound to the `window` instance as:

- `window.Utility`
- `window.DateLibrary`
- `window.NumberLibrary`
- `window.IntervalCollection`

Thus, they can be simple used by just using `Utility.isEventSupported('click');` or `var intervalCollection = new IntervalCollection();`. 
Further examples on how to use the different libraries can be found [here](#usage-examples).

### Using the Miscellanious Library with `nodeJs (npm)`

To use the library within a node project, simple install it using `npm`:

```
npm install --save js-misc
```

The different libraries are combined in one single object, which is exported by the module, i.e., the different libraries are
available like:

- <var>.Utility
- <var>.DateLibrary
- <var>.NumberLibrary
- <var>.IntervalCollection

For example:

```
var Misc = require('js-misc');

var Interval = Misc.IntervalCollection.Interval;
var intervalCollection = new Misc.IntervalCollection();

intervalCollection.insert(new Interval(6, 6, {id: 1}));
var overlaps = intervalCollection.overlap(new Interval(5, 8));
```

Further examples can be found [here](#usage-examples).

### Using the Miscellanious Library with `requireJs`

If you are building larger web-applications and you want to enjoy the advantage of [requireJs](http://requirejs.org/), you
need to include the sources (and not the optimized libraries). To do so, you may download the tarball or a zip-archive from 
GitHub and place it into your `scripts` folder. You can then require the needed library as following:

```
require([
    'net/meisen/general/Utility',
    'net/meisen/general/date/DateLibrary',
    'net/meisen/general/number/NumberLibrary',
    'net/meisen/general/interval/IntervalCollection',
    'net/meisen/general/interval/Interval'
], function (Utility,
             DateLibrary,
             NumberLibrary,
             IntervalCollection,
             Interval) {
    
    // do whatever needed
    
});
```

### Using the Miscellaneous Library with `JavaScript Import`

If you simple want to use the library within your web-site, you can easily do so by downloading it, deploying it on your
server and adding `<script>...</script>` tags:

```
<script src="/js/js-misc.min.js"></script>
```

The different libraries are bound to the `window` instance and thus are directly available for any other script:

```
<script src="/js/js-misc.min.js"></script>
<script type="text/javascript">
    var intervalCollection = new IntervalCollection();
    
    intervalCollection.insert(new Interval(6, 6, {id: 1}));
    var overlaps = intervalCollection.overlap(new Interval(5, 8));
</script>
```

If you'd like to have this library available through a CDN, please **Star** the project.

## Usage Examples

Currently this library offers just a couple of functions, which I needed within my dissertation project. Nevertheless, in 
the future I plan to add more and more general functions, whenever I have the chance to make code available to the public 
and or have some time to write private code, useful code-snippets. Currently, one of the main functionalities available is
the `Interval` stuff. Thus, I give a some examples on how to use this part of the library. Examples can be found also within 
the test folder, i.e., [test](/test/net/meisen.general) and [specs](/specs/net/meisen.general).

**Note (nodeJs users only):** 

Using the module within nodeJs means that the libraries and data-types cannot be accessed directly (i.e., be just typing
the libraries or data-types name). For the examples, I assume that the following code was used:

```
var Misc = require('js-misc');

var Utility = Misc.Utility;
var DateLibrary = Misc.DateLibrary;
var NumberLibrary = Misc.NumberLibrary;
var IntervalCollection = Misc.IntervalCollection;
```

### Formatting Numbers

The `NumberLibrary` offers an easy way to format numbers using the symbols `#`, `0`, `.`, and `,` 
as described, e.g., [here](https://msdn.microsoft.com/en-us/library/0c899ak8(v=vs.110).aspx).

```
console.log(NumberLibrary.format(3.54, '#'));
console.log(NumberLibrary.format(3.54, '00'));
console.log(NumberLibrary.format(2.657, '#000.00'));
console.log(NumberLibrary.format(15005, '###,###,###,###,##0.####'));
console.log(NumberLibrary.format(15005, '###,###,##0.00', ',', '.'));
```

Creates the output:

```
4
04
002.66
15,005
15.005,00
```

### Handling Intervals

The `IntervalLibrary` offers some implementations to work with intervals, e.g., to find overlapping intervals within a collection,
compare intervals within a collections, or find the position to add an interval. 

```
// find overlapping intervals
var intervalCollection = new IntervalCollection();
intervalCollection.insert(new Interval(6, 6, {id: 1}));
intervalCollection.insert(new Interval(7, 8, {id: 2}));

var result = intervalCollection.overlap(new Interval(5, 6);
console.log('Found ' + result.length + ' overlapping intervals in collection');
if (result.length > 0) {
    console.log('The id of the first overlapping interval is: ' + result[0].get('id'));
}
```

```
// find the position to insert a value, so that the collection stays sorted
var intervalCollection = new IntervalCollection();

var list = [
    new IntervalCollection.Interval(1, 5), //  0
    new IntervalCollection.Interval(1, 6), //  1
    new IntervalCollection.Interval(1, 7), //  2
    new IntervalCollection.Interval(2, 3), //  3
    new IntervalCollection.Interval(2, 4), //  4
    new IntervalCollection.Interval(2, 4), //  5
    new IntervalCollection.Interval(2, 6), //  6
    new IntervalCollection.Interval(5, 7), //  7
    new IntervalCollection.Interval(5, 7), //  8
    new IntervalCollection.Interval(5, 8), //  9
    new IntervalCollection.Interval(6, 6)  // 10
];

intervalCollection.findPosition(list, new Interval(-2, 2)); // returns 0
```