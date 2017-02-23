var misc = require('../../../../../dist/js-misc');
var assert = require('assert');

describe('DateLibrary', function () {
    it('DateLibrary should be available', function () {
        assert.notEqual(misc.DateLibrary, undefined, 'DateLibrary prototype available');
    });

    it('DateLibrary createUTC should be working', function () {
        var date;
        var now = new Date();

        var nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()));
        date = misc.DateLibrary.createUTC();

        assert.equal(date.getUTCFullYear(), nowUTC.getUTCFullYear(), 'now UTC year');
        assert.equal(date.getUTCMonth(), nowUTC.getUTCMonth(), 'now UTC month');
        assert.equal(date.getUTCDate(), nowUTC.getUTCDate(), 'now UTC day');
        assert.equal(date.getUTCHours(), 0, 'default UTC hours');
        assert.equal(date.getUTCMinutes(), 0, 'default UTC minutes');
        assert.equal(date.getUTCSeconds(), 0, 'default UTC seconds');
    })
});