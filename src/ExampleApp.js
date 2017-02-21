// define the baseUrl
requirejs.config({
    baseUrl: 'scripts'
});

/*
 * Now start the entry-point, we just require all libraries 
 * and return a single object which contains all the libraries.
 */
require([
    'net/meisen/general/Utility',
    'net/meisen/general/date/DateLibrary',
    'net/meisen/general/number/NumberLibrary',
    'net/meisen/general/interval/IntervalCollection'
], function (Utility,
             DateLibrary,
             NumberLibrary,
             IntervalCollection) {
    // nothing specific to show
});