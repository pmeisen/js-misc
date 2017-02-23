var misc = require('../../../../../dist/js-misc');
var assert = require('assert');

describe('IntervalCollection', function () {
    it('IntervalCollection should be available', function () {
        assert.notEqual(misc.IntervalCollection, undefined, 'IntervalCollection prototype available');
    });


    it('IntervalCollection compare', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        assert.equal(intervalCollection.compare(new Interval(2, 5), new Interval(2, 5)), 0);

        assert.equal(intervalCollection.compare(new Interval(2, 5), new Interval(2, 6)), -1);
        assert.equal(intervalCollection.compare(new Interval(2, 7), new Interval(2, 6)), 1);

        assert.equal(intervalCollection.compare(new Interval(1, 6), new Interval(2, 6)), -1);
        assert.equal(intervalCollection.compare(new Interval(3, 6), new Interval(2, 6)), 1);
    });

    it('IntervalCollection compareReverse', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        assert.equal(intervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 5)), 0);

        assert.equal(intervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 6)), 1);
        assert.equal(intervalCollection.compareReverse(new Interval(2, 7), new Interval(2, 6)), -1);

        assert.equal(intervalCollection.compareReverse(new Interval(1, 6), new Interval(2, 6)), -1);
        assert.equal(intervalCollection.compareReverse(new Interval(3, 6), new Interval(2, 6)), 1);

        assert.equal(intervalCollection.compareReverse(new Interval(1, 6), new Interval(6, 6)), -1);
        assert.equal(intervalCollection.compareReverse(new Interval(6, 6), new Interval(2, 6)), 1);
    });

    it('IntervalCollection findPosition', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        // set a sortedList
        var list = [
            new Interval(1, 5), //  0
            new Interval(1, 6), //  1
            new Interval(1, 7), //  2
            new Interval(2, 3), //  3
            new Interval(2, 4), //  4
            new Interval(2, 4), //  5
            new Interval(2, 6), //  6
            new Interval(5, 7), //  7
            new Interval(5, 7), //  8
            new Interval(5, 8), //  9
            new Interval(6, 6)  // 10
        ];

        assert.equal(intervalCollection.findPosition(list, new Interval(-2, 2)), 0);
        assert.equal(intervalCollection.findPosition(list, new Interval(2, 5)), 6);
        assert.equal(intervalCollection.findPosition(list, new Interval(5, 7)), 9);
        assert.equal(intervalCollection.findPosition(list, new Interval(6, 6)), 11);
    });

    it('IntervalCollection insert', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        assert.equal(0, intervalCollection.size());

        // add and check
        intervalCollection.insert(new Interval(5, 6, {id: 1}));
        assert.equal(1, intervalCollection.size(), 'size ok');

        assert.equal(1, intervalCollection.sortedStartList[0].get('id'));

        assert.equal(1, intervalCollection.sortedEndList[0].get('id'));

        intervalCollection.insert(new Interval(1, 3, {id: 2}));
        assert.equal(2, intervalCollection.size(), 'size ok');

        assert.equal(2, intervalCollection.sortedStartList[0].get('id'));
        assert.equal(1, intervalCollection.sortedStartList[1].get('id'));

        assert.equal(1, intervalCollection.sortedEndList[0].get('id'));
        assert.equal(2, intervalCollection.sortedEndList[1].get('id'));

        intervalCollection.insert(new Interval(6, 6, {id: 3}));
        assert.equal(3, intervalCollection.size(), 'size ok');

        assert.equal(2, intervalCollection.sortedStartList[0].get('id'));
        assert.equal(1, intervalCollection.sortedStartList[1].get('id'));
        assert.equal(3, intervalCollection.sortedStartList[2].get('id'));

        assert.equal(1, intervalCollection.sortedEndList[0].get('id'));
        assert.equal(3, intervalCollection.sortedEndList[1].get('id'));
        assert.equal(2, intervalCollection.sortedEndList[2].get('id'));
    });

    it('IntervalCollection overlap', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        assert.equal(0, intervalCollection.size());
        assert.equal(0, intervalCollection.overlap(new Interval(5, 8)).length);
        assert.equal(0, intervalCollection.overlap(new Interval(0, 100)).length);
        assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        assert.equal(0, intervalCollection.overlap(new Interval(3, 4)).length);

        // insert one interval
        intervalCollection.insert(new Interval(6, 6, {id: 1}));
        assert.equal(1, intervalCollection.size(), 'size ok');

        // check some overlaps
        assert.equal(1, intervalCollection.overlap(new Interval(5, 8)).length);
        assert.equal(1, intervalCollection.overlap(new Interval(5, 8))[0].get('id'));
        assert.equal(1, intervalCollection.overlap(new Interval(0, 100)).length);
        assert.equal(1, intervalCollection.overlap(new Interval(0, 100))[0].get('id'));
        assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        assert.equal(0, intervalCollection.overlap(new Interval(3, 4)).length);

        // add more values
        intervalCollection.insert(new Interval(2, 6, {id: 2}));
        intervalCollection.insert(new Interval(1, 3, {id: 3}));
        assert.equal(3, intervalCollection.size(), 'size ok');

        // check overlaps
        assert.equal(2, intervalCollection.overlap(new Interval(5, 8)).length);
        assert.equal(2, intervalCollection.overlap(new Interval(5, 8))[0].get('id'));
        assert.equal(1, intervalCollection.overlap(new Interval(5, 8))[1].get('id'));
        assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        assert.equal(2, intervalCollection.overlap(new Interval(3, 4)).length);
        assert.equal(3, intervalCollection.overlap(new Interval(3, 4))[0].get('id'));
        assert.equal(2, intervalCollection.overlap(new Interval(3, 4))[1].get('id'));
        assert.equal(1, intervalCollection.overlap(new Interval(1, 1)).length);
        assert.equal(3, intervalCollection.overlap(new Interval(1, 1))[0].get('id'));

        intervalCollection.insert(new Interval(1, 1, {id: 4}));
        assert.equal(2, intervalCollection.overlap(new Interval(1, 1)).length);
        assert.equal(4, intervalCollection.overlap(new Interval(1, 1))[0].get('id'));
        assert.equal(3, intervalCollection.overlap(new Interval(1, 1))[1].get('id'));
    });

    it('IntervalCollection insert all', function () {
        var intervalCollection = new misc.IntervalCollection();
        var Interval = misc.IntervalCollection.Interval;

        intervalCollection.insertAll([
            new Interval(1, 4, {id: 1}),
            new Interval(-10, 8, {id: 2}),
            new Interval(2, 20, {id: 3}),
            new Interval(2, 2, {id: 4}),
            new Interval(-11, -10, {id: 5}),
            new Interval(6, 20, {id: 6}),
            new Interval(11, 20, {id: 6})
        ]);

        assert.equal(7, intervalCollection.overlap(new Interval(-11, 20)).length);
        assert.equal(3, intervalCollection.overlap(new Interval(8, 10)).length);
    });
});