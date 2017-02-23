var misc = require('../../../../../dist/js-misc');
var assert = require('assert');

describe('NumberLibrary', function () {

    it('NumberLibrary is available', function () {
        assert.notEqual(misc.NumberLibrary, undefined, 'NumberLibrary prototype available');
    });

    it('NumberLibrary format', function () {
        assert.equal(misc.NumberLibrary.format(3.54, '#'), '4');
        assert.equal(misc.NumberLibrary.format(0.54, '#'), '1');
        assert.equal(misc.NumberLibrary.format(0.14, '#'), '0');

        assert.equal(misc.NumberLibrary.format(3.54, '00'), '04');
        assert.equal(misc.NumberLibrary.format(102.12, '00'), '102');

        assert.equal(misc.NumberLibrary.format(0.14, '#.#'), '.1');
        assert.equal(misc.NumberLibrary.format(0.14, '0.#'), '0.1');

        assert.equal(misc.NumberLibrary.format(2.657, '#.00'), '2.66');
        assert.equal(misc.NumberLibrary.format(2.657, '#000.00'), '002.66');
        assert.equal(misc.NumberLibrary.format(2.657, '0000.00'), '0002.66');
        assert.equal(misc.NumberLibrary.format(50022.657, '#000.00'), '50022.66');

        assert.equal(misc.NumberLibrary.format(2.657, '###,###,000.00'), '002.66');
        assert.equal(misc.NumberLibrary.format(2.657, '###,##0,000.00'), '0,002.66');
        assert.equal(misc.NumberLibrary.format(50022.657, '###,###,000.00'), '50,022.66');
        assert.equal(misc.NumberLibrary.format(5000022.657, '###,###,000.00'), '5,000,022.66');
        assert.equal(misc.NumberLibrary.format(50022.657, '#,##,##,#0,00.00'), '5,00,22.66');
        assert.equal(misc.NumberLibrary.format(1002130120120.657, '#,##,##,##,##,#0,00.00#'), '1,00,21,30,12,01,20.657');

        assert.equal(misc.NumberLibrary.format(202, '###,###,###,###,##0.####'), '202');
        assert.equal(misc.NumberLibrary.format(15005, '###,###,###,###,##0.####'), '15,005');
        assert.equal(misc.NumberLibrary.format(1213213.89012312, '###,###,###,###,##0.####'), '1,213,213.8901');
        assert.equal(misc.NumberLibrary.format(1213213.00000001, '###,###,###,###,##0.####'), '1,213,213');

        assert.equal(misc.NumberLibrary.format(480, '#.00'), '480.00');
        assert.equal(misc.NumberLibrary.format(220.1, '#.00'), '220.10');
    });
});