// define the baseUrl
requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'QUnit': 'qunit'
    },
    shim: {
        'QUnit': {
            exports: 'QUnit',
            init: function () {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        }
    }
});

/*
 * Now start the entry-point, we just require all libraries
 * and return a single object which contains all the libraries.
 */
require(['QUnit',
        'net/meisen/general/date/testDateLibrary',
        'net/meisen/general/interval/testIntervalCollection',
        'net/meisen/general/number/testNumberLibrary'
    ],
    function (QUnit) {
        for (var i = 0; i < arguments.length; i++) {
            var argument = arguments[i];
            if (typeof argument === 'function') {
                argument();
            }
        }

        // start QUnit.
        QUnit.load();
        QUnit.start();
    });