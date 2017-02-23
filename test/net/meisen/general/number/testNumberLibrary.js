define(['QUnit', 'net/meisen/general/number/NumberLibrary'], function (QUnit, NumberLibrary) {

    QUnit.module('testNumberLibrary');

    QUnit.test('testGeneral', function () {
        QUnit.assert.notEqual(NumberLibrary, undefined, 'NumberLibrary prototype available');
    });

    QUnit.test('testFormat', function () {
        QUnit.assert.equal(NumberLibrary.format(3.54, '#'), '4');
        QUnit.assert.equal(NumberLibrary.format(0.54, '#'), '1');
        QUnit.assert.equal(NumberLibrary.format(0.14, '#'), '0');

        QUnit.assert.equal(NumberLibrary.format(3.54, '00'), '04');
        QUnit.assert.equal(NumberLibrary.format(102.12, '00'), '102');

        QUnit.assert.equal(NumberLibrary.format(0.14, '#.#'), '.1');
        QUnit.assert.equal(NumberLibrary.format(0.14, '0.#'), '0.1');

        QUnit.assert.equal(NumberLibrary.format(2.657, '#.00'), '2.66');
        QUnit.assert.equal(NumberLibrary.format(2.657, '#000.00'), '002.66');
        QUnit.assert.equal(NumberLibrary.format(2.657, '0000.00'), '0002.66');
        QUnit.assert.equal(NumberLibrary.format(50022.657, '#000.00'), '50022.66');

        QUnit.assert.equal(NumberLibrary.format(2.657, '###,###,000.00'), '002.66');
        QUnit.assert.equal(NumberLibrary.format(2.657, '###,##0,000.00'), '0,002.66');
        QUnit.assert.equal(NumberLibrary.format(50022.657, '###,###,000.00'), '50,022.66');
        QUnit.assert.equal(NumberLibrary.format(5000022.657, '###,###,000.00'), '5,000,022.66');
        QUnit.assert.equal(NumberLibrary.format(50022.657, '#,##,##,#0,00.00'), '5,00,22.66');
        QUnit.assert.equal(NumberLibrary.format(1002130120120.657, '#,##,##,##,##,#0,00.00#'), '1,00,21,30,12,01,20.657');

        QUnit.assert.equal(NumberLibrary.format(202, '###,###,###,###,##0.####'), '202');
        QUnit.assert.equal(NumberLibrary.format(15005, '###,###,###,###,##0.####'), '15,005');
        QUnit.assert.equal(NumberLibrary.format(1213213.89012312, '###,###,###,###,##0.####'), '1,213,213.8901');
        QUnit.assert.equal(NumberLibrary.format(1213213.00000001, '###,###,###,###,##0.####'), '1,213,213');
        QUnit.assert.equal(NumberLibrary.format(15005, '###,###,##0.00', ',', '.'), '15.005,00');

        QUnit.assert.equal(NumberLibrary.format(480, '#.00'), '480.00');
        QUnit.assert.equal(NumberLibrary.format(220.1, '#.00'), '220.10');
    });
});