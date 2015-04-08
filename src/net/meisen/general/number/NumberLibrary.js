define([], function () {
    
  /*
   * Default constructor...
   */
  NumberLibrary = function() {
  };
  
  /**
   * The decimal point symbol used within the format.
   */
  NumberLibrary.decimalPoint = '.';
  NumberLibrary.forcedPlace = '0';
  NumberLibrary.optionalPlace = '#';
  
  NumberLibrary.format = function(number, format, decimalPoint, groupSeparator) {
    var formattedNumber = '';
    
    decimalPoint = typeof(decimalPoint) == 'undefined' || decimalPoint == null ? '.' : decimalPoint;
    groupSeparator  = typeof(decimalPoint) == 'undefined' || groupSeparator == null ? ',' : groupSeparator;
    
    // determine some information of the format
    var formatStat = typeof(format) == 'string' ? NumberLibrary.createStat(format) : format;
    
    // round the number, and create the stat
    var roundedNumber = number.toFixed(formatStat.decimalPlaces);
    roundedNumber = roundedNumber[0] == '0' && roundedNumber.length > 1 ? roundedNumber.substring(1) : roundedNumber;
    var numberStat = NumberLibrary.createStat(roundedNumber);
    
    // add the preDecimalPlaces
    var diffPreDecimalPlaces = formatStat.fixedPreDecimalPlaces - numberStat.preDecimalPlaces;
    if (diffPreDecimalPlaces > 0) {
      formattedNumber = Array(diffPreDecimalPlaces + 1).join('0') + numberStat.preDecimal;
    } else if (numberStat.preDecimalPlaces > 0) {
      formattedNumber = numberStat.preDecimal;
    }
    
    // add the decimal point and decimalPlaces
    if (formatStat.decimalPlaces > 0 || numberStat.decimalPlaces > 0) {
      formattedNumber += decimalPoint;
      
      var diffDecimalPlaces = formatStat.fixedDecimalPlaces - numberStat.decimalPlaces;
      if (diffDecimalPlaces > 0) {
        formattedNumber += numberStat.decimal + Array(diffPreDecimalPlaces + 1).join('0')
      } else if (numberStat.decimalPlaces > 0) {
        formattedNumber += numberStat.decimal
      }
    }
    
    return formattedNumber;
  };
  
  NumberLibrary.createStat = function(o) {
    var fullLength = o.length;
    var decimalPointPos = o.indexOf(NumberLibrary.decimalPoint);
    var decimalPlaces = decimalPointPos == -1 ? 0 : fullLength - decimalPointPos - 1;
    var preDecimalPlaces = decimalPointPos == -1 ? fullLength : fullLength - decimalPlaces - 1;
        
    // correct the decimalPoint
    decimalPointPos = decimalPointPos == -1 ? fullLength : decimalPointPos;
    
    // get the different formats
    var decimal = o.substr(decimalPointPos + 1, decimalPlaces);
    var preDecimal = o.substr(decimalPointPos - preDecimalPlaces, preDecimalPlaces);
    
    // count the 'leading' zeros
    var forcedCounter = function(o) {
      var len = -1, counter = 0;
      for (var i = 0, len = o.length; i < len; i++) {
        if (o[i] == NumberLibrary.forcedPlace) {
          counter++;
        } else {
          break;
        }
      }
      
      return counter;
    }
    var fixedDecimalPlaces = forcedCounter(decimal);    
    var fixedPreDecimalPlaces = forcedCounter(preDecimal.split('').reverse().join(''));
    
    return {
      decimal: decimal,
      preDecimal: preDecimal,
      fullLength: fullLength,
      decimalPointPos: decimalPointPos,
      decimalPlaces: decimalPlaces,
      preDecimalPlaces: preDecimalPlaces,
      fixedDecimalPlaces: fixedDecimalPlaces,
      fixedPreDecimalPlaces: fixedPreDecimalPlaces
    }
  }
    
  return NumberLibrary;
});