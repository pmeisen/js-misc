module('testNumberLibrary');

test('testGeneral', function() {
  var numberLibrary = require('net/meisen/general/number/NumberLibrary');
  notEqual(numberLibrary, undefined, 'NumberLibrary prototype available');
});

test('testFormat', function() {
  var numberLibrary = require('net/meisen/general/number/NumberLibrary');
  
  equal(numberLibrary.format(3.54, '#'), '4');
  equal(numberLibrary.format(0.54, '#'), '1');
  equal(numberLibrary.format(0.14, '#'), '0');
  
  equal(numberLibrary.format(3.54, '00'), '04');
  equal(numberLibrary.format(102.12, '00'), '102');
  
  equal(numberLibrary.format(0.14, '#.#'), '.1');
  equal(numberLibrary.format(0.14, '0.#'), '0.1');
  
  equal(numberLibrary.format(2.657, '#.00'), '2.66');
  equal(numberLibrary.format(2.657, '#000.00'), '002.66');
  equal(numberLibrary.format(2.657, '0000.00'), '0002.66');
  equal(numberLibrary.format(50022.657, '#000.00'), '50022.66');
  
  equal(numberLibrary.format(2.657, '###,###,000.00'), '002.66');
  equal(numberLibrary.format(2.657, '###,##0,000.00'), '0,002.66');
  equal(numberLibrary.format(50022.657, '###,###,000.00'), '50,022.66');
  equal(numberLibrary.format(5000022.657, '###,###,000.00'), '5,000,022.66');
  equal(numberLibrary.format(50022.657, '#,##,##,#0,00.00'), '5,00,22.66');
  equal(numberLibrary.format(1002130120120.657, '#,##,##,##,##,#0,00.00#'), '1,00,21,30,12,01,20.657');
  
  equal(numberLibrary.format(202, '###,###,###,###,##0.####'), '202');
  equal(numberLibrary.format(15005, '###,###,###,###,##0.####'), '15,005');
  equal(numberLibrary.format(1213213.89012312, '###,###,###,###,##0.####'), '1,213,213.8901');
  equal(numberLibrary.format(1213213.00000001, '###,###,###,###,##0.####'), '1,213,213');
});