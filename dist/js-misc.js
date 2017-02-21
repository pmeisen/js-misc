(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define('net/meisen/general/Utility',[], function () {
  
  var TAGNAMES = {
    'select':'input','change':'input',
    'submit':'form','reset':'form',
    'error':'img','load':'img','abort':'img'
  };
  
  var Utility = function() {
  };
  
  Utility.isEventSupported = function(eventName) {
    var el = document.createElement(TAGNAMES[eventName] || 'div');
    
    eventName = 'on' + eventName;
    var isSupported = (eventName in el);
    if (!isSupported) {
      el.setAttribute(eventName, 'return;');
      isSupported = typeof el[eventName] == 'function';
    }
    el = null;
    
    return isSupported;
  };
  
  Utility.getSupportedEvent = function(events) {

    // get the length
    var len = events.length;
    if (typeof(len) == 'undefined') {
      len = 0;
    }
    
    for (var i = 0; i < len; i++) {
      if (Utility.isEventSupported(events[i])) {
        return events[i];
      }
    }
    
    return null;
  };
  
  return Utility;
});
define('net/meisen/general/date/DateLibrary',[], function () {

    /*
     * Default constructor...
     */
    var DateLibrary = function () {
    };

    /**
     * Static function useful to generate UTC dates. The parameters are optional,
     * i.e. can be null or undefined. If not specified the date-information will be
     * set to today, whereby the time-information will be set to 0 if not specified.
     */
    DateLibrary.createUTC = function (y, m, d, h, mi, s, ms) {
        var now = new Date();

        y = typeof(y) == 'undefined' || y == null ? now.getFullYear() : y;
        m = typeof(m) == 'undefined' || m == null ? now.getMonth() : m - 1;
        d = typeof(d) == 'undefined' || d == null ? now.getDate() : d;

        h = typeof(h) == 'undefined' || h == null ? 0 : h;
        mi = typeof(mi) == 'undefined' || mi == null ? 0 : mi;
        s = typeof(s) == 'undefined' || s == null ? 0 : s;
        ms = typeof(ms) == 'undefined' || ms == null ? 0 : ms;

        return new Date(Date.UTC(y, m, d, h, mi, s, ms));
    };

    /**
     * Static function used to truncate a date on a specific level.
     */
    DateLibrary.truncateUTC = function (date, level) {
        level = DateLibrary.normalizeLevel(level);
        var res = new Date(date.getTime());
        res.setUTCMilliseconds(0);

        //noinspection FallThroughInSwitchStatementJS
        switch (level) {
            case 'y':
                res.setUTCFullYear(0);
            case 'm':
                res.setUTCMonth(0);
            case 'd':
                res.setUTCDate(1);
            case 'h':
                res.setUTCHours(0);
            case 'mi':
                res.setUTCMinutes(0);
            case 's':
                res.setUTCSeconds(0);
                break;
        }

        return res;
    };

    DateLibrary.modifyUTC = function (date, amount, level, exact) {

        if (amount == 0) {
            return date;
        }

        exact = typeof(exact) == 'undefined' || exact == null ? false : exact;
        level = DateLibrary.normalizeLevel(level);

        var res;
        if (exact) {
            var sign = amount < 0 ? -1 : 1;

            if (level == 'y') {
                /*
                 * Instead of using a multiplier like:
                 *   multiplier *= DateLibrary.numberOfDays(res.getUTCFullYear());
                 * we use the month implementation. This ensures that 0.5 adds 6 months,
                 * instead of the half amount of days. This is more intuitive, someone
                 * will expect the middle of the year to be after 6 months and not after
                 * 182.5 (or 183) days.
                 */
                return DateLibrary.modifyUTC(date, amount * 12, 'm', true);
            } else if (level == 'm') {
                /*
                 * This is more or less the most complicated part of the distance.
                 * We cannot just add the month, the month depends on the current
                 * amount of days within the month, i.e. January +1 means +31 days
                 * on February +1 means +28 days (or even +29). Therefore the distance
                 * depends on the date and the distance to the edge of the month.
                 * Additionally the target month must be especially handled.
                 */
                var edgeDate = DateLibrary.getEdgeDate(date, sign);
                var orgMonthDays = DateLibrary.numberOfDays(date.getUTCFullYear(), date.getUTCMonth() + 1);
                var normDistToEdge = DateLibrary.getDistanceToEdge(date, edgeDate) / orgMonthDays;

                // there is not enough amount to move, so just move within the month
                if (Math.abs(amount) < Math.abs(normDistToEdge)) {
                    return DateLibrary.modifyUTC(date, amount * orgMonthDays, 'd', true);
                }
                // change the amount to be still moved, sign determines the direction
                else {
                    amount -= normDistToEdge;
                }

                date = edgeDate;
            }

            // get the base and the remainder
            var base = Math.floor(amount);
            var remainder = amount - base;

            // calculate the date based on the base
            res = DateLibrary.modifyUTC(date, base, level, false);

            // determine the multiplier
            var multiplier = 1;

            //noinspection FallThroughInSwitchStatementJS
            switch (level) {
                case 'm':
                    var destMonthDays = DateLibrary.numberOfDays(res.getUTCFullYear(), res.getUTCMonth() + 1);
                    multiplier *= destMonthDays;
                case 'd':
                    multiplier *= 24;
                case 'h':
                    multiplier *= 60;
                case 'mi':
                    multiplier *= 60;
                case 's':
                    multiplier *= 1000;
                    break;
            }

            // use the multiplier and calculate the date on milliseconds
            res = new Date(res.getTime() + remainder * multiplier);
        } else {
            res = new Date(date.getTime());

            switch (level) {
                case 'y':
                    res.setUTCFullYear(date.getUTCFullYear() + amount);
                    break;
                case 'm':
                    res.setUTCMonth(date.getUTCMonth() + amount);
                    break;
                case 'd':
                    res.setUTCDate(date.getUTCDate() + amount);
                    break;
                case 'h':
                    res.setUTCHours(date.getUTCHours() + amount);
                    break;
                case 'mi':
                    res.setUTCMinutes(date.getUTCMinutes() + amount);
                    break;
                case 's':
                    res.setUTCSeconds(date.getUTCSeconds() + amount);
                    break;
            }
        }

        return res;
    };

    DateLibrary.getEdgeDate = function (date, sign) {

        if (sign == 1) {
            return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 1);
            //return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 2, 0, 23, 59, 59, 999);
        } else {
            return DateLibrary.createUTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
        }
    };

    DateLibrary.getDistanceToEdge = function (date, edgeDate) {

        // calculate the distance to the edge (01 or end) of the month
        edgeDate = typeof(edgeDate) == 'number' ? DateLibrary.getEdgeDate(date, edgeDate) : edgeDate;
        return DateLibrary.distanceUTC(date, edgeDate, 'd', true);
    };

    DateLibrary.numberOfDays = function (year, month) {

        if (typeof(month) == 'undefined' || month == null) {
            var d1 = Date.UTC(year + 1, 0, 0);
            var d2 = Date.UTC(year, 0, 0);

            return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
        } else {

            /*
             * Getting the 0-day of the next month (month is zero based),
             * is the last day of the requested month.
             */
            return new Date(Date.UTC(year, month, 0)).getUTCDate();
        }
    };

    DateLibrary.formatUTC = function (date, format) {
        var p = DateLibrary.pad;

        var res = format;

        res = res.replace('yyyy', p(date.getUTCFullYear(), 4));
        res = res.replace('MM', p(date.getUTCMonth() + 1));
        res = res.replace('dd', p(date.getUTCDate()));
        res = res.replace('HH', p(date.getUTCHours()));
        res = res.replace('mm', p(date.getUTCMinutes()));
        res = res.replace('ss', p(date.getUTCSeconds()));

        return res;
    };

    DateLibrary.pad = function (nr, max) {
        var str = '' + nr;
        max = typeof(max) == 'undefined' || max == null ? 2 : max;

        return str.length < max ? DateLibrary.pad('0' + str, max) : str;
    };

    DateLibrary.normalizeLevel = function (level) {

        if (level == null || typeof(level) == 'undefined') {
            return null;
        }

        // first do some lower-case matching
        switch (level.toLowerCase()) {
            case 'y':
            case 'year':
            case 'years':
                return 'y';
            case 'm':
            case 'month':
            case 'months':
                return 'm';
            case 'd':
            case 'day':
            case 'days':
                return 'd';
            case 'h':
            case 'hour':
            case 'hours':
                return 'h';
            case 'mi':
            case 'minute':
            case 'minutes':
                return 'mi';
            case 's':
            case 'second':
            case 'seconds':
                return 's';
        }

        // add the formatting level as well
        switch (level) {
            case 'yyyy':
                return 'y';
            case 'MM':
                return 'm';
            case 'dd':
                return 'd';
            case 'HH':
                return 'h';
            case 'mm':
                return 'mi';
            case 'ss':
                return 's';
        }

        // fallback
        return null;
    };

    DateLibrary.getPreviousLevel = function (level) {
        level = DateLibrary.normalizeLevel(level);
        switch (level) {
            case 'y':
                return 'm';
            case 'm':
                return 'd';
            case 'd':
                return 'h';
            case 'h':
                return 'mi';
            case 'mi':
                return 's';
            case 's':
                return null;
        }
    };

    DateLibrary.getLevels = function () {
        return ['y', 'm', 'd', 'h', 'mi', 's'];
    };

    DateLibrary.distanceUTC = function (date1, date2, level, exact) {
        exact = typeof(exact) == 'undefined' || exact == null ? false : exact;
        level = DateLibrary.normalizeLevel(level);

        var fraction = 1;
        if (exact) {
            if (date1.getTime() == date2.getTime()) {
                return 0;
            }

            /*
             * The exact calculation is quiet complicated, it has to be following
             * the rules defined by DateLibrary.modifyUTC. It must apply that
             *
             *  dateB == DateLibrary.modifyUTC(dateA, DateLibrary.distanceUTC(dateA, dateB, l, true), l, true)
             */

            //noinspection FallThroughInSwitchStatementJS
            switch (level) {
                case 'y':
                    return DateLibrary.distanceUTC(date1, date2, 'm', true) / 12;
                    break;
                case 'm':
                    var ord = date1.getTime() < date2.getTime() ? 1 : -1;

                    // get the distance of each month within itself
                    var dist1Edge = DateLibrary.getEdgeDate(date1, ord);
                    var dist2Edge = DateLibrary.getEdgeDate(date2, -1 * ord);
                    var dist1 = DateLibrary.getDistanceToEdge(date1, dist1Edge) / DateLibrary.numberOfDays(date1.getUTCFullYear(), date1.getUTCMonth() + 1);
                    var dist2 = DateLibrary.getDistanceToEdge(date2, dist2Edge) / DateLibrary.numberOfDays(date2.getUTCFullYear(), date2.getUTCMonth() + 1);

                    // get the base, i.e. the full month between
                    var base = DateLibrary.distanceUTC(dist1Edge, dist2Edge, 'm', false);
                    return dist1 + -1 * dist2 + base;
                    break;
                case 'd':
                    fraction *= 24;
                case 'h':
                    fraction *= 60;
                case 'mi':
                    fraction *= 60;
                case 's':
                    fraction *= 1000;
                    break;
            }

            return (date2.getTime() - date1.getTime()) / fraction;
        } else {
            var prevLevel = DateLibrary.getPreviousLevel(level);

            var truncDate1 = prevLevel == null ? date1 : DateLibrary.truncateUTC(date1, prevLevel);
            var truncDate2 = prevLevel == null ? date2 : DateLibrary.truncateUTC(date2, prevLevel);

            // if the truncation modified the end, we increase it by 1
            if (level != 's' && date2.getTime() != truncDate2.getTime()) {
                truncDate2 = DateLibrary.modifyUTC(truncDate2, 1, level);
            }

            var diff = 0;

            //noinspection FallThroughInSwitchStatementJS
            switch (level) {
                case 'd':
                    fraction *= 24;
                case 'h':
                    fraction *= 60;
                case 'mi':
                    fraction *= 60;
                case 's':
                    diff = Math.ceil((truncDate2.getTime() - truncDate1.getTime()) / 1000);
                    diff /= fraction;
                    // nothing to do
                    break;
                case 'y':
                    diff = truncDate2.getFullYear() - truncDate1.getFullYear();
                    break;
                case 'm':
                    diff = (truncDate2.getFullYear() - truncDate1.getFullYear()) * 12;
                    diff -= truncDate1.getMonth() + 1;
                    diff += truncDate2.getMonth() + 1;
                    break;
            }

            return Math.ceil(diff);
        }
    };

    DateLibrary.parseString = function (value, format) {

        // check null
        if (value == null || typeof(value) == 'undefined') {
            return null;
        }

        // check if we have a Date
        if (value instanceof Date) {
            return value;
        }

        // change the defined format to a regular expression
        var regEx = format;

        // quote special characters
        regEx = regEx.replace(/(\.|\\|\+|\*|\?|\[|\^|\]|\$|\(|\)|\{|\}|\=|\!|\<|\>|\||\:|\-)/g, function (v) {
            return '\\' + v;
        });

        // replace the different markers
        regEx = regEx.replace('yyyy', '(\\d{4})');
        regEx = regEx.replace('MM', '(\\d{2})');
        regEx = regEx.replace('dd', '(\\d{2})');
        regEx = regEx.replace('HH', '(\\d{2})');
        regEx = regEx.replace('mm', '(\\d{2})');
        regEx = regEx.replace('ss', '(\\d{2})');

        var regex = new RegExp('^' + regEx + '$');
        var matches = regex.exec(value);
        if (matches != null) {

            // define the different group numbers
            var yyyy, MM, dd, HH, mm, ss;
            yyyy = MM = dd = HH = mm = ss = -1;

            var groupNr = 1;
            for (var i = 0, len = format.length; i < len;) {
                var token = format.substr(i, 2);
                if (token == 'MM') {
                    MM = groupNr;
                    i += 2;
                } else if (token == 'dd') {
                    dd = groupNr;
                    i += 2;
                } else if (token == 'HH') {
                    HH = groupNr;
                    i += 2;
                } else if (token == 'mm') {
                    mm = groupNr;
                    i += 2;
                } else if (token == 'ss') {
                    ss = groupNr;
                    i += 2;
                } else if (token == 'yy' && format.substr(i, 4) == 'yyyy') {
                    yyyy = groupNr;
                    i += 4;
                } else {
                    i++;
                    continue;
                }

                groupNr++;
            }

            var year = yyyy > -1 ? parseInt(matches[yyyy], 10) : 0;
            var month = MM > -1 ? parseInt(matches[MM], 10) : 1;
            var day = dd > -1 ? parseInt(matches[dd], 10) : 1;
            var hour = HH > -1 ? parseInt(matches[HH], 10) : 0;
            var minute = mm > -1 ? parseInt(matches[mm], 10) : 0;
            var second = ss > -1 ? parseInt(matches[ss], 10) : 0;

            return DateLibrary.createUTC(year, month, day, hour, minute, second);
        }

        // fallback
        return null;
    };

    DateLibrary.parseISO8601 = function (value) {

        // check null
        if (value == null || typeof(value) == 'undefined') {
            return null;
        }

        // check if we have a Date
        if (value instanceof Date) {
            return value;
        }

        // check ISO8601
        var regex = new RegExp('^([\\d]{4})\\-([\\d]{2})\\-([\\d]{2})T([\\d]{2}):([\\d]{2}):([\\d]{2})(\\.([\\d]{3}))?Z$');
        var matches = regex.exec(value);
        if (matches != null) {

            return DateLibrary.createUTC(
                parseInt(matches[1], 10),
                parseInt(matches[2], 10),
                parseInt(matches[3], 10),
                parseInt(matches[4], 10),
                parseInt(matches[5], 10),
                parseInt(matches[6], 10)
            );
        }

        // fallback
        return null;
    };

    return DateLibrary;
});
define('net/meisen/general/number/NumberLibrary',[], function () {

    /*
     * Default constructor...
     */
    var NumberLibrary = function () {
    };

    /**
     * The decimal point symbol used within the format.
     */
    NumberLibrary.decimalPoint = '.';
    NumberLibrary.groupSeparator = ',';
    NumberLibrary.forcedPlace = '0';
    NumberLibrary.optionalPlace = '#';

    /**
     *
     * @param {number} number the number to be formatted
     * @param {string} format the format to apply
     * @param {string} [decimalPoint=.] the decimal point, e.g., in the US "." and in Germany ","
     * @param {string} [groupSeparator=,] the group separator to be used, e.g., in the US "," and in Germany "."
     * @returns {*}
     */
    NumberLibrary.format = function (number, format, decimalPoint, groupSeparator) {
        if (typeof(format) == 'undefined' || format == null || typeof(number) == 'undefined' || number == null) {
            return null;
        }

        var formattedNumber = '';

        decimalPoint = typeof(decimalPoint) == 'undefined' || decimalPoint == null ? '.' : decimalPoint;
        groupSeparator = typeof(decimalPoint) == 'undefined' || groupSeparator == null ? ',' : groupSeparator;

        // determine some information of the format
        var formatStat = typeof(format) == 'string' ? NumberLibrary.createStat(format) : format;

        // round the number, and create the stat
        var roundedNumber = number.toFixed(formatStat.decimalPlaces);

        // removing leading & trailing zeros, and create the stats
        roundedNumber = roundedNumber[0] == '0' && roundedNumber.length > 1 ? roundedNumber.substring(1) : roundedNumber;
        roundedNumber = roundedNumber.indexOf('.') > -1 ? roundedNumber.replace(/0*$/, '') : roundedNumber;
        var numberStat = NumberLibrary.createStat(roundedNumber);

        // add the preDecimalPlaces
        var diffPreDecimalPlaces = formatStat.fixedPreDecimalPlaces - numberStat.preDecimalPlaces;
        if (diffPreDecimalPlaces > 0) {
            formattedNumber = new Array(diffPreDecimalPlaces + 1).join('0') + numberStat.preDecimal;
        } else if (numberStat.preDecimalPlaces > 0) {
            formattedNumber = numberStat.preDecimal;
        }

        // add the group separator
        if (formatStat.groupSeparatorPos.length > 0) {
            var isGroupSeparatorPos = function (pos) {
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
            };

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
        if (formatStat.fixedDecimalPlaces > 0 || numberStat.decimalPlaces > 0) {
            formattedNumber += decimalPoint;

            var diffDecimalPlaces = formatStat.fixedDecimalPlaces - numberStat.decimalPlaces;
            if (diffDecimalPlaces > 0) {
                formattedNumber += numberStat.decimal + new Array(diffDecimalPlaces + 1).join('0')
            } else if (numberStat.decimalPlaces > 0) {
                formattedNumber += numberStat.decimal;
            }
        }

        return formattedNumber;
    };

    NumberLibrary.createStat = function (o) {
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
        var forcedCounter = function (o) {
            var len = o.length, counter = 0;
            for (var i = 0; i < len; i++) {
                if (o[i] == NumberLibrary.forcedPlace) {
                    counter++;
                } else {
                    break;
                }
            }

            return counter;
        };
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
    };

    return NumberLibrary;
});
define('net/meisen/general/interval/Interval',['net/meisen/general/date/DateLibrary'], function (datelib) {
  
  var determineType = function(val) {
    switch (typeof(val)) {
      case 'number':
        return 'number';
        break;
      case 'object':
        if (val instanceof Date) {
          return 'date';
        } else {
          return null;
        }
        break;
      default:
        return null;
    }
  };
  
  var compare = function(type, val1, val2) {
    
    // null is handled as MAX_VALUE
    if (val1 == Interval.MAX_VALUE && val2 == Interval.MAX_VALUE) {
      return 0;
    } else if (val1 == Interval.MAX_VALUE) {
      return 1;
    } else if (val2 == Interval.MAX_VALUE) {
      return -1;
    }
    
    // handle a type if we have one
    if (type == 'number') {
      return val1 < val2 ? -1 : (val1 > val2 ? 1 : 0);
    } else if (type == 'date') {
      var dist = datelib.distanceUTC(val1, val2, 's');
      return dist > 0 ? -1 : (dist < 0 ? 1 : 0);
    }
  };
  
  /**
   * Constructor specifying the start and end as well 
   * as additional meta-information.
   */
  Interval = function(start, end, data) {

    // get the type
    if (start == Interval.MAX_VALUE) {
      this.type = determineType(end);
    } else if (end == Interval.MAX_VALUE) {
      this.type = determineType(start);
    } else if (!((this.type = determineType(start)) == determineType(end))) {
      throw new Error('Invalid type "' + this.type + '" (' + start + ', ' + end + ').');
    }
    
    // make sure we have a type
    if (this.type == null) {
      throw new Error('Type cannot be determined, both values are Interval.MAX_VALUE ("' + start + ', "' + end + '").');
    }
    
    this.start = start;
    this.end = end;
    this.data = typeof(data) == 'undefined' ? null : data;
  };
  
  /**
   * Static value representing the MAX_VALUE, independent of the type.
   */
  Interval.MAX_VALUE = {};
  
  /**
   * Extended prototype
   */
  Interval.prototype = {
    
    get: function(value) {
      if (this.data == null) {
        return null;
      } else {
        return this.data[value];
      }
    },
    
    /**
     * Method used to set a meta-information for the this.
     */
    set: function(attribute, value) {
      if (this.data == null) {
        this.data = {};
      }
      this.data[attribute] = value;
    },
    
    /**
     * Compares this interval with the specified interval and
     * returns an int which tells if this is 
     * - less than (i.e. this < interval => -1), 
     * - equal (i.e. this == interval => 0), or 
     * - greater (i.e. this > interval => 1) than.
     */
    compare: function(interval) {
      var startCmp = compare(this.type, this.start, interval.start);

      if (startCmp == 0) {
        return compare(this.type, this.end, interval.end);
      } else {
        return startCmp;
      }
    },
    
    /**
     * Compares this interval with the specified interval and
     * returns an int which tells if this is 
     * - less than (i.e. this < interval => -1), 
     * - equal (i.e. this == interval => 0), or 
     * - greater (i.e. this > interval => 1) than.
     *
     * Compare reverse checks for the end first of equality and 
     * than of the start.
     */
    compareReverse: function(interval) {
      var endCmp = -1 * compare(this.type, this.end, interval.end);

      if (endCmp == 0) {
        return compare(this.type, this.start, interval.start);
      } else {
        return endCmp;
      }
    },
    
    /**
     * Compares the start value of this with the specified value.
     */
    compareStart: function(value) {
      return compare(this.type, this.start, value);
    },
    
    /**
     * Compares the end value of this with the specified value.
     */
    compareEnd: function(value) {
      return compare(this.type, this.end, value);
    },
    
    toString: function() {
      return '[' + this.start + ',' + this.end + ']';
    }
  };
  
  return Interval;
});
define('net/meisen/general/interval/IntervalCollection',['net/meisen/general/interval/Interval'], function (Interval) {
    
  /**
   * Default constructor...
   */
  var IntervalCollection = function() {
    this.sortedStartList = [];
    this.sortedEndList = [];
  };
  
  /**
   * Extended prototype:
   *
   * The implementation is not based on any typical IntervalTree
   * definition, instead a SortedList (maybe close to an AugmentedTree)
   * is used. Nevertheless, we just use a sorted array, which contains
   * the intervals in a sorted manner (see compare method).
   */
  IntervalCollection.prototype = {
    
    /**
     * Adds all the elements of the specified array.
     */
    insertAll: function(intervals) {
      
      // add all the values
      this.sortedStartList = this.sortedStartList.concat(intervals);
      this.sortedEndList = this.sortedEndList.concat(intervals);

      // sort the list afterwards
      this.sortedStartList.sort(this.compare);
      this.sortedEndList.sort(this.compareReverse);
    },
        
    insert: function(interval) {   
      var posStart = this.findPosition(this.sortedStartList, interval, null, null, this.compare);
      var posEnd = this.findPosition(this.sortedEndList, interval, null, null, this.compareReverse);
      
      // add the element to the list
      this.sortedStartList.splice(posStart, 0, interval);
      this.sortedEndList.splice(posEnd, 0, interval);
    },
    
    overlap: function(start, end) {
      
      // check if we have an interval
      if (start instanceof Interval) {
        end = start.end;
        start = start.start;
      }
      
      var posStart = this.findPosition(this.sortedStartList, new Interval(end, Interval.MAX_VALUE), null, null, this.compare);
      var posEnd = this.findPosition(this.sortedEndList, new Interval(Interval.MAX_VALUE, start), null, null, this.compareReverse);

      // make sure if everything is selected to do a fast path
      if (posStart == posEnd && posStart == this.sortedStartList.length) {
        return this.sortedStartList;
      }
      
      // get the shorter list of both
      var list;
      var cmpFunc;
      if (posStart < posEnd) {
        
        // we select start, i.e. all sel.start <= end
        list = this.sortedStartList.slice(0, posStart);
        cmpFunc = function(entry) {
          
          // compare the end value to make sure its >= start
          return entry.compareEnd(start) != -1;
        }
      } else {
        
        // we select end, i.e. all sel.end >= start
        list = this.sortedEndList.slice(0, posEnd);
        cmpFunc = function(entry) {
          
          // compare the start value to make sure its <= end
          return entry.compareStart(end) != 1;
        }
      }
      
      // filter the results
      var res = [];
      while(list.length > 0) {
        var entry = list.shift();
        if (cmpFunc(entry)) {       
          res.push(entry);
        }
      }
      return res;
    },
    
    size: function() {
      return this.sortedStartList.length;
    },
    
    clear: function() {
      this.sortedStartList = [];
      this.sortedEndList = [];
    },
    
    /**
     * Finds the position the interval has to be added to 
     * within the sortedList.
     */
    findPosition: function(arr, interval, start, end, cmpFunc) {
      cmpFunc = cmpFunc == null || typeof(cmpFunc) !== 'function' ? this.compare : cmpFunc;
      
      var len = arr.length;
      
      // just quit if there is no element, the position is always 0
      if (len == 0) {
        return 0;
      }
      
      start = typeof(start) == 'undefined' || start == null ? 0 : start;
      end = typeof(end) == 'undefined' || end == null ? len : end;

      var pivotPos = Math.floor(start + (end - start) / 2);
      var pivotElement = arr[pivotPos];
      
      var cmp = cmpFunc(pivotElement, interval);
      if (cmp == 0) {
        return pivotPos + 1;
      } else if (end - start <= 1) {
        return cmp == 1 ? pivotPos : pivotPos + 1;
      } else if (cmp == -1) {
        return this.findPosition(arr, interval, pivotPos, end, cmpFunc);
      } else {
        return this.findPosition(arr, interval, start, pivotPos, cmpFunc);
      }
    },
    
    /**
     * Compares two intervals returns an int which tells if the values compare 
     * - less than (i.e. interval1 < interval2 => -1), 
     * - equal (i.e. interval1 == interval2 => 0), or 
     * - greater (i.e. interval1 > interval2 => 1) than.
     */
    compare: function(interval1, interval2) {
      return interval1.compare(interval2);
    },
    
    /**
     * Compares two intervals returns an int which tells if the values compare 
     * - less than (i.e. interval1 < interval2 => -1), 
     * - equal (i.e. interval1 == interval2 => 0), or 
     * - greater (i.e. interval1 > interval2 => 1) than.
     *
     * Compare reverse checks for the end first of equality and than of the start.
     */
    compareReverse: function(interval1, interval2) {
      return interval1.compareReverse(interval2);
    }
  };
  
  return IntervalCollection;
});
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
    window.Utility = Utility;
    window.DateLibrary = DateLibrary;
    window.NumberLibrary = NumberLibrary;
    window.IntervalCollection = IntervalCollection;
});
define("Optimizer", function(){});

}());