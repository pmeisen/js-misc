define(['QUnit',
    'net/meisen/general/interval/Interval',
    'net/meisen/general/interval/IntervalCollection'
], function (QUnit, Interval, IntervalCollection) {

    QUnit.module('testIntervalCollection');

    QUnit.test('testGeneral', function () {
        QUnit.assert.notEqual(IntervalCollection, undefined, 'IntervalCollection prototype available');
    });

    QUnit.test('testCompare', function () {
        var intervalCollection = new IntervalCollection();

        QUnit.assert.equal(intervalCollection.compare(new Interval(2, 5), new Interval(2, 5)), 0);

        QUnit.assert.equal(intervalCollection.compare(new Interval(2, 5), new Interval(2, 6)), -1);
        QUnit.assert.equal(intervalCollection.compare(new Interval(2, 7), new Interval(2, 6)), 1);

        QUnit.assert.equal(intervalCollection.compare(new Interval(1, 6), new Interval(2, 6)), -1);
        QUnit.assert.equal(intervalCollection.compare(new Interval(3, 6), new Interval(2, 6)), 1);
    });

    QUnit.test('testCompareReverse', function () {
        var intervalCollection = new IntervalCollection();

        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 5)), 0);

        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(2, 5), new Interval(2, 6)), 1);
        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(2, 7), new Interval(2, 6)), -1);

        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(1, 6), new Interval(2, 6)), -1);
        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(3, 6), new Interval(2, 6)), 1);

        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(1, 6), new Interval(6, 6)), -1);
        QUnit.assert.equal(intervalCollection.compareReverse(new Interval(6, 6), new Interval(2, 6)), 1);
    });

    QUnit.test('testFindPosition', function () {
        var intervalCollection = new IntervalCollection();

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

        QUnit.assert.equal(intervalCollection.findPosition(list, new Interval(-2, 2)), 0);
        QUnit.assert.equal(intervalCollection.findPosition(list, new Interval(2, 5)), 6);
        QUnit.assert.equal(intervalCollection.findPosition(list, new Interval(5, 7)), 9);
        QUnit.assert.equal(intervalCollection.findPosition(list, new Interval(6, 6)), 11);
    });

    QUnit.test('testInsert', function () {
        var intervalCollection = new IntervalCollection();
        QUnit.assert.equal(0, intervalCollection.size());

        // add and check
        intervalCollection.insert(new Interval(5, 6, {id: 1}));
        QUnit.assert.equal(1, intervalCollection.size(), 'size ok');

        QUnit.assert.equal(1, intervalCollection.sortedStartList[0].get('id'));

        QUnit.assert.equal(1, intervalCollection.sortedEndList[0].get('id'));

        intervalCollection.insert(new Interval(1, 3, {id: 2}));
        QUnit.assert.equal(2, intervalCollection.size(), 'size ok');

        QUnit.assert.equal(2, intervalCollection.sortedStartList[0].get('id'));
        QUnit.assert.equal(1, intervalCollection.sortedStartList[1].get('id'));

        QUnit.assert.equal(1, intervalCollection.sortedEndList[0].get('id'));
        QUnit.assert.equal(2, intervalCollection.sortedEndList[1].get('id'));

        intervalCollection.insert(new Interval(6, 6, {id: 3}));
        QUnit.assert.equal(3, intervalCollection.size(), 'size ok');

        QUnit.assert.equal(2, intervalCollection.sortedStartList[0].get('id'));
        QUnit.assert.equal(1, intervalCollection.sortedStartList[1].get('id'));
        QUnit.assert.equal(3, intervalCollection.sortedStartList[2].get('id'));

        QUnit.assert.equal(1, intervalCollection.sortedEndList[0].get('id'));
        QUnit.assert.equal(3, intervalCollection.sortedEndList[1].get('id'));
        QUnit.assert.equal(2, intervalCollection.sortedEndList[2].get('id'));
    });

    QUnit.test('testOverlap', function () {
        var intervalCollection = new IntervalCollection();
        QUnit.assert.equal(0, intervalCollection.size());
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(5, 8)).length);
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(0, 100)).length);
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(3, 4)).length);

        // insert one interval
        intervalCollection.insert(new Interval(6, 6, {id: 1}));
        QUnit.assert.equal(1, intervalCollection.size(), 'size ok');

        // check some overlaps
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(5, 8)).length);
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(5, 8))[0].get('id'));
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(0, 100)).length);
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(0, 100))[0].get('id'));
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(3, 4)).length);

        // add more values
        intervalCollection.insert(new Interval(2, 6, {id: 2}));
        intervalCollection.insert(new Interval(1, 3, {id: 3}));
        QUnit.assert.equal(3, intervalCollection.size(), 'size ok');

        // check overlaps
        QUnit.assert.equal(2, intervalCollection.overlap(new Interval(5, 8)).length);
        QUnit.assert.equal(2, intervalCollection.overlap(new Interval(5, 8))[0].get('id'));
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(5, 8))[1].get('id'));
        QUnit.assert.equal(0, intervalCollection.overlap(new Interval(7, 8)).length);
        QUnit.assert.equal(2, intervalCollection.overlap(new Interval(3, 4)).length);
        QUnit.assert.equal(3, intervalCollection.overlap(new Interval(3, 4))[0].get('id'));
        QUnit.assert.equal(2, intervalCollection.overlap(new Interval(3, 4))[1].get('id'));
        QUnit.assert.equal(1, intervalCollection.overlap(new Interval(1, 1)).length);
        QUnit.assert.equal(3, intervalCollection.overlap(new Interval(1, 1))[0].get('id'));

        intervalCollection.insert(new Interval(1, 1, {id: 4}));
        QUnit.assert.equal(2, intervalCollection.overlap(new Interval(1, 1)).length);
        QUnit.assert.equal(4, intervalCollection.overlap(new Interval(1, 1))[0].get('id'));
        QUnit.assert.equal(3, intervalCollection.overlap(new Interval(1, 1))[1].get('id'));
    });

    QUnit.test('testInsertAll', function () {
        var intervalCollection = new IntervalCollection();
        intervalCollection.insertAll([
            new Interval(1, 4, {id: 1}),
            new Interval(-10, 8, {id: 2}),
            new Interval(2, 20, {id: 3}),
            new Interval(2, 2, {id: 4}),
            new Interval(-11, -10, {id: 5}),
            new Interval(6, 20, {id: 6}),
            new Interval(11, 20, {id: 6})
        ]);

        QUnit.assert.equal(7, intervalCollection.overlap(new Interval(-11, 20)).length);
        QUnit.assert.equal(3, intervalCollection.overlap(new Interval(8, 10)).length);
    });
});