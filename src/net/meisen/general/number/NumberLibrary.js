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
  NumberLibrary.groupSeparator = ',';
  NumberLibrary.forcedPlace = '0';
  NumberLibrary.optionalPlace = '#';
  
  NumberLibrary.format = function(number, format, decimalPoint, groupSeparator) {
    if (typeof(format) == 'undefined' || format == null || typeof(number) == 'undefined' || number == null) {
      return null;
    }
    
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
    
    // add the group separator
    if (formatStat.groupSeparatorPos.length > 0) {    
      var isGroupSeparatorPos = function(pos) {
        var len = formatStat.groupSeparatorPos.length;
        for (var i = 0; i < len; i++) {
          var groupPos = formatStat.groupSeparatorPos[i];
          
          if (groupPos == pos) {
            return true;
          } else if (groupPos > pos) {
            return false;
          }
        }
        
        return false;
      }
      
      var groupedFormattedNumber = '';
      var len = formattedNumber.length;
      for (var i = 0; i < len; i++) {
        var value = formattedNumber[len - i - 1];
        if (isGroupSeparatorPos(i)) {
          groupedFormattedNumber = groupSeparator + groupedFormattedNumber;
        }
        groupedFormattedNumber = value + groupedFormattedNumber
      }
      
      formattedNumber = groupedFormattedNumber;
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
    var rawPreDecimal = o.substr(decimalPointPos - preDecimalPlaces, preDecimalPlaces);
    var preDecimal = rawPreDecimal.split(NumberLibrary.groupSeparator).join('');
    
    // get the grouping defined
    var len = rawPreDecimal.length;
    var groupSeparatorPos = [];
    if (len != preDecimal.length) {
      var reverseRawPreDecimal = rawPreDecimal.split('').reverse().join('');
      var amount = 0;
      for (var i = 0; i < len; i++) {
        if (reverseRawPreDecimal[i] == NumberLibrary.groupSeparator) {
          groupSeparatorPos.push(i - amount);
          amount++;
        }
      }
    }
    
    // count the 'leading' zeros
    var forcedCounter = function(o) {
      var len = o.length, counter = 0;
      for (var i = 0; i < len; i++) {
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
      decimalPlaces: decimalPlaces,
      preDecimalPlaces: preDecimalPlaces,
      fixedDecimalPlaces: fixedDecimalPlaces,
      fixedPreDecimalPlaces: fixedPreDecimalPlaces,
      groupSeparatorPos: groupSeparatorPos
    }
  }
    
  return NumberLibrary;
});