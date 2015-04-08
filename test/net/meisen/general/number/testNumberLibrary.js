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
  equal(numberLibrary.format(50022.657, '#000.00'), '50022.66');
});