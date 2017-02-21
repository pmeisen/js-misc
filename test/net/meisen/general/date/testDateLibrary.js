define(['QUnit', 'net/meisen/general/date/DateLibrary'], function (QUnit, dateLibrary) {

    return function () {

        QUnit.module('testDateLibrary');

        QUnit.test('testGeneral', function () {
            QUnit.assert.notEqual(dateLibrary, undefined, 'DateLibrary prototype available');
        });

        QUnit.test('testCreateUTC', function () {
            var date;

            var now = new Date();

            // create a now UTC (day)
            var nowUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()));
            date = dateLibrary.createUTC();
            QUnit.assert.equal(date.getUTCFullYear(), nowUTC.getUTCFullYear(), 'now UTC year');
            QUnit.assert.equal(date.getUTCMonth(), nowUTC.getUTCMonth(), 'now UTC month');
            QUnit.assert.equal(date.getUTCDate(), nowUTC.getUTCDate(), 'now UTC day');
            QUnit.assert.equal(date.getUTCHours(), 0, 'default UTC hours');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'default UTC minutes');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'default UTC seconds');

            // create a specified date without time
            date = dateLibrary.createUTC(2015, 1, 15);
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'created UTC year');
            QUnit.assert.equal(date.getUTCMonth(), 0, 'created UTC month');
            QUnit.assert.equal(date.getUTCDate(), 15, 'created UTC day');
            QUnit.assert.equal(date.getUTCHours(), 0, 'default UTC hours');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'default UTC minutes');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'default UTC seconds');

            // create a specified date with time
            date = dateLibrary.createUTC(2015, 1, 15, 10, 22, 52);
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'created UTC year');
            QUnit.assert.equal(date.getUTCMonth(), 0, 'created UTC month');
            QUnit.assert.equal(date.getUTCDate(), 15, 'created UTC day');
            QUnit.assert.equal(date.getUTCHours(), 10, 'default UTC hours');
            QUnit.assert.equal(date.getUTCMinutes(), 22, 'default UTC minutes');
            QUnit.assert.equal(date.getUTCSeconds(), 52, 'default UTC seconds');
        });

        QUnit.test('testTruncateUTC', function () {
            var testDate = dateLibrary.createUTC(2015, 6, 12, 15, 43, 56);
            var date;

            date = dateLibrary.truncateUTC(testDate, 's');
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'truncate seconds');
            QUnit.assert.equal(date.getUTCMonth(), 5, 'truncate seconds');
            QUnit.assert.equal(date.getUTCDate(), 12, 'truncate seconds');
            QUnit.assert.equal(date.getUTCHours(), 15, 'truncate seconds');
            QUnit.assert.equal(date.getUTCMinutes(), 43, 'truncate seconds');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate seconds');

            date = dateLibrary.truncateUTC(testDate, 'mi');
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'truncate minutes');
            QUnit.assert.equal(date.getUTCMonth(), 5, 'truncate minutes');
            QUnit.assert.equal(date.getUTCDate(), 12, 'truncate minutes');
            QUnit.assert.equal(date.getUTCHours(), 15, 'truncate minutes');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'truncate minutes');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate minutes');

            date = dateLibrary.truncateUTC(testDate, 'h');
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'truncate hours');
            QUnit.assert.equal(date.getUTCMonth(), 5, 'truncate hours');
            QUnit.assert.equal(date.getUTCDate(), 12, 'truncate hours');
            QUnit.assert.equal(date.getUTCHours(), 0, 'truncate hours');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'truncate hours');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate hours');

            date = dateLibrary.truncateUTC(testDate, 'd');
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'truncate days');
            QUnit.assert.equal(date.getUTCMonth(), 5, 'truncate days');
            QUnit.assert.equal(date.getUTCDate(), 1, 'truncate days');
            QUnit.assert.equal(date.getUTCHours(), 0, 'truncate days');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'truncate days');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate days');

            date = dateLibrary.truncateUTC(testDate, 'm');
            QUnit.assert.equal(date.getUTCFullYear(), 2015, 'truncate months');
            QUnit.assert.equal(date.getUTCMonth(), 0, 'truncate months');
            QUnit.assert.equal(date.getUTCDate(), 1, 'truncate months');
            QUnit.assert.equal(date.getUTCHours(), 0, 'truncate months');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'truncate months');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate months');

            date = dateLibrary.truncateUTC(testDate, 'y');
            QUnit.assert.equal(date.getUTCFullYear(), 0, 'truncate years');
            QUnit.assert.equal(date.getUTCMonth(), 0, 'truncate years');
            QUnit.assert.equal(date.getUTCDate(), 1, 'truncate years');
            QUnit.assert.equal(date.getUTCHours(), 0, 'truncate years');
            QUnit.assert.equal(date.getUTCMinutes(), 0, 'truncate years');
            QUnit.assert.equal(date.getUTCSeconds(), 0, 'truncate years');
        });

        QUnit.test('testModifyUTC', function () {
            var testDate = dateLibrary.createUTC(2015, 6, 12, 15, 43, 56);

            var date, exp;

            date = dateLibrary.modifyUTC(testDate, 10, 'y');
            exp = dateLibrary.createUTC(2025, 6, 12, 15, 43, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, 13, 'm');
            exp = dateLibrary.createUTC(2016, 7, 12, 15, 43, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, 31, 'd');
            exp = dateLibrary.createUTC(2015, 7, 13, 15, 43, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, 43, 'h');
            exp = dateLibrary.createUTC(2015, 6, 14, 10, 43, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, -75, 'mi');
            exp = dateLibrary.createUTC(2015, 6, 12, 14, 28, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, -57, 's');
            exp = dateLibrary.createUTC(2015, 6, 12, 15, 42, 59);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            // ask for an exact adding
            date = dateLibrary.modifyUTC(testDate, 4.5, 'mi', true);
            exp = dateLibrary.createUTC(2015, 6, 12, 15, 48, 26);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            date = dateLibrary.modifyUTC(testDate, 4.5, 'd', true);
            exp = dateLibrary.createUTC(2015, 6, 17, 3, 43, 56);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            // add 1/30 of a month with 30 days, i.e. 1 day
            testDate = dateLibrary.createUTC(2015, 6, 1, 0, 0, 0);
            date = dateLibrary.modifyUTC(testDate, 1 / 30, 'm', true);
            exp = dateLibrary.createUTC(2015, 6, 2, 0, 0, 0);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            // add 1/24 of  a day of 1/30, i.e. 1 hour
            testDate = dateLibrary.createUTC(2015, 6, 1, 0, 0, 0);
            date = dateLibrary.modifyUTC(testDate, (1 / 24) / 30, 'm', true);
            exp = dateLibrary.createUTC(2015, 6, 1, 1, 0, 0);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            testDate = dateLibrary.createUTC(2015, 6, 1, 0, 0, 0);
            date = dateLibrary.modifyUTC(testDate, 4, 'm', true);
            exp = dateLibrary.createUTC(2015, 10, 1);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

            testDate = dateLibrary.createUTC(2015, 6, 1, 1, 0, 0);
            date = dateLibrary.modifyUTC(testDate, 3 + (23 / 24 + 29) / 30, 'm', true);
            exp = dateLibrary.createUTC(2015, 10, 1);
            QUnit.assert.equal(date.getTime(), exp.getTime(), dateLibrary.formatUTC(date, 'dd.MM.yyyy HH:mm:ss') + ' expected ' + dateLibrary.formatUTC(exp, 'dd.MM.yyyy HH:mm:ss'));

        });

        QUnit.test('testParseISO8601', function () {
            var date;

            date = dateLibrary.parseISO8601('2007-12-24T18:21:10Z');
            QUnit.assert.equal(date.getUTCFullYear(), 2007, 'parsed year');
            QUnit.assert.equal(date.getUTCMonth(), 11, 'parsed month');
            QUnit.assert.equal(date.getUTCDate(), 24, 'parsed day');
            QUnit.assert.equal(date.getUTCHours(), 18, 'parsed hours');
            QUnit.assert.equal(date.getUTCMinutes(), 21, 'parsed minutes');
            QUnit.assert.equal(date.getUTCSeconds(), 10, 'parsed seconds');
        });

        QUnit.test('testDistance', function () {
            var diff;

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2015, 1, 15, 10, 22, 52),
                dateLibrary.createUTC(2015, 1, 15, 10, 22, 52),
                's');
            QUnit.assert.equal(diff, 0);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2015, 1, 15, 10, 22, 52),
                dateLibrary.createUTC(2015, 1, 15, 10, 22, 52),
                'mi');
            QUnit.assert.equal(diff, 1);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2015, 1, 15, 8, 27, 55),
                dateLibrary.createUTC(2015, 1, 15, 11, 22, 2),
                'mi');
            QUnit.assert.equal(diff, 29 + 60 + 60 + 27);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2015, 1, 13, 8, 27, 55),
                dateLibrary.createUTC(2015, 1, 15, 11, 22, 2),
                'd');
            QUnit.assert.equal(diff, 3);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2015, 1, 13, 8, 27, 55),
                dateLibrary.createUTC(2015, 1, 15, 11, 22, 2),
                'm');
            QUnit.assert.equal(diff, 1);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2013, 11, 13, 8, 27, 55),
                dateLibrary.createUTC(2015, 3, 15, 11, 22, 2),
                'm');
            QUnit.assert.equal(diff, 17);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2014, 11, 13, 8, 27, 55),
                dateLibrary.createUTC(2014, 12, 15, 11, 22, 02),
                'm');
            QUnit.assert.equal(diff, 2);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2014, 11, 13, 8, 27, 55),
                dateLibrary.createUTC(2014, 12, 15, 11, 22, 02),
                'y');
            QUnit.assert.equal(diff, 1);

            diff = dateLibrary.distanceUTC(
                dateLibrary.createUTC(2013, 11, 13, 8, 27, 55),
                dateLibrary.createUTC(2015, 3, 15, 11, 22, 02),
                'y');
            QUnit.assert.equal(diff, 3);
        });

        QUnit.test('testExactDistance', function () {
            var levels = dateLibrary.getLevels();

            var assert = function (dateA, dateB) {
                for (var i = 0; i < levels.length; i++) {
                    var level = levels[i];

                    var diff1 = dateLibrary.distanceUTC(dateA, dateB, level, true);
                    var diff2 = dateLibrary.distanceUTC(dateB, dateA, level, true);
                    var res1 = dateLibrary.modifyUTC(dateA, diff1, level, true);
                    var res2 = dateLibrary.modifyUTC(dateB, diff2, level, true);
                    QUnit.assert.equal(res1.getTime(), dateB.getTime(), 'level: ' + level + ', diff: ' + diff1 + ', res: ' + dateLibrary.formatUTC(res1, 'dd.MM.yyyy HH:mm:ss') + ', exp: ' + dateLibrary.formatUTC(dateB, 'dd.MM.yyyy HH:mm:ss'));
                    QUnit.assert.equal(res2.getTime(), dateA.getTime(), 'level: ' + level + ', diff: ' + diff2 + ', res: ' + dateLibrary.formatUTC(res2, 'dd.MM.yyyy HH:mm:ss') + ', exp: ' + dateLibrary.formatUTC(dateA, 'dd.MM.yyyy HH:mm:ss'));
                }
            };

            // check the same date on all levels
            assert(dateLibrary.createUTC(2015, 1, 15, 10, 22, 52),
                dateLibrary.createUTC(2015, 1, 15, 10, 22, 52));

            // generate some random dates
            var start = dateLibrary.createUTC(2014, 1, 1, 0, 0, 0);
            var end = dateLibrary.createUTC(2014, 12, 31, 23, 59, 59, 999);

            // run 1000 random tests
            for (var i = 0; i < 1000; i++) {
                var dateA = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
                var dateB = new Date(dateA.getTime() + Math.random() * (end.getTime() - dateA.getTime()));
                assert(dateA, dateB);
            }
        });

        QUnit.test('testParseString', function () {
            var org = dateLibrary.createUTC(2013, 11, 13, 8, 27, 55);
            var test = function (org, format, level) {
                var formattedOrg = dateLibrary.formatUTC(org, format);
                var res = dateLibrary.parseString(formattedOrg, format);
                var exp = dateLibrary.truncateUTC(org, level);

                QUnit.assert.equal(exp.getTime(), res.getTime(), 'checked format "' + format + '" (' + formattedOrg + '/' + exp + ' -> ' + res + ')');
            };

            var format;
            test(org, 'dd.MM.yyyy HH:mm:ss', null);
            test(org, 'Hallo yyyy', 'm');
            test(org, 'yes we can: yyyy/dd/MM', 'h');
            test(org, 'does that: yyyy$dd!MM really work', 'h');
        });
    }
});