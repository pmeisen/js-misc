// define the baseUrl
requirejs.config({
    baseUrl: 'scripts'
});

// make sure the different instances are loaded
require(['net/meisen/general/Utility']);
require(['net/meisen/general/date/DateLibrary']);
require(['net/meisen/general/number/NumberLibrary']);
require(['net/meisen/general/interval/IntervalCollection']);

// actually retrieve the loaded instances
var instance = {
    Utility: require('net/meisen/general/Utility'),
    DateLibrary: require('net/meisen/general/date/DateLibrary'),
    NumberLibrary: require('net/meisen/general/number/NumberLibrary'),
    IntervalCollection: require('net/meisen/general/interval/IntervalCollection')
};

// we are using the system within a browser
if (typeof window !== 'undefined') {
    for (var property in instance) {
        if (instance.hasOwnProperty(property)) {
            window[property] = instance[property];
        }
    }
}

// we are using the system as a nodeJs module
if (typeof module !== 'undefined') {
    module.exports = instance;
}