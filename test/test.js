var assert = require('assert');
var FuzzyTime = require('../fuzzytime.js');

describe('FuzzyTime', function() {
    describe("static method", function() {
        describe("findFuzzyTimeUnit", function() {
            it('should enumerate correctly...', function() {
                assert.equal(FuzzyTime.Unit.YEAR, FuzzyTime.findFuzzyTimeUnit("Y"));
                assert.equal(FuzzyTime.Unit.MONTH, FuzzyTime.findFuzzyTimeUnit("M"));
                assert.equal(FuzzyTime.Unit.WEEK, FuzzyTime.findFuzzyTimeUnit("W"));
                assert.equal(FuzzyTime.Unit.DAY, FuzzyTime.findFuzzyTimeUnit("D"));
                assert.equal(FuzzyTime.Unit.HOUR, FuzzyTime.findFuzzyTimeUnit("h"));
                assert.equal(FuzzyTime.Unit.MINUTE, FuzzyTime.findFuzzyTimeUnit("m"));
                assert.equal(FuzzyTime.Unit.SECOND, FuzzyTime.findFuzzyTimeUnit("s"));
            });
        });

        describe(".parseDuration", function() {
            it('should return matching array of maps', function() {
                var x = JSON.stringify([{time: 1, unit: FuzzyTime.Unit.YEAR},
                    {time: 2, unit: FuzzyTime.Unit.WEEK},
                    {time: 2, unit: FuzzyTime.Unit.MINUTE},
                    {time: 3, unit: FuzzyTime.Unit.SECOND}]);
                assert.equal(x, JSON.stringify(FuzzyTime.parseDuration("P1Y2WT2M3S")));

                x = JSON.stringify([{time: 1, unit: FuzzyTime.Unit.YEAR}]);
                assert.equal(x ,JSON.stringify(FuzzyTime.parseDuration("P1Y")));

                x = JSON.stringify([{time: 2, unit: FuzzyTime.Unit.MINUTE}]);
                assert.equal(x, JSON.stringify(FuzzyTime.parseDuration("T2M")));

                x = JSON.stringify([{time: 2, unit: FuzzyTime.Unit.MONTH}]);
                assert.equal(x, JSON.stringify(FuzzyTime.parseDuration("2M")));

                x = JSON.stringify([{time: 2.5, unit: FuzzyTime.Unit.MONTH}]);
                assert.equal(x, JSON.stringify(FuzzyTime.parseDuration("P2.5M")));

                x = JSON.stringify([{time: 0.6, unit: FuzzyTime.Unit.DAY}]);
                assert.equal(x, JSON.stringify(FuzzyTime.parseDuration("0.6D")));
            });
        });

        describe("addTime", function() {
            it('should return "2013-01-02"', function() {
                var date = new Date('2013-01-01 00:00:00');
                var target = new Date('2013-01-02 00:00:00');
                assert.equal(FuzzyTime.addTime(date, 1, FuzzyTime.Unit.DAY).toUTCString(), target.toUTCString());
            });

            it('should return "2013-03-15 12:00"', function() {
                var date = new Date(2013, 00, 01);
                var target = new Date(2013, 02, 16, 12);
                assert.equal(FuzzyTime.addTime(date, 2.5, FuzzyTime.Unit.MONTH).toUTCString(), target.toUTCString());
            });

            it('should return "2013-01-01 12:45"', function() {
                var date = new Date(2013, 00, 01, 12, 00);
                var target = new Date(2013, 00, 01, 12, 45);
                assert.equal(FuzzyTime.addTime(date, .75, FuzzyTime.Unit.HOUR).toUTCString(), target.toUTCString());
            });
        });
    });

    describe('#at()', function() {
        var pretendNow = new Date(2013, 01, 01, 01, 01, 30);
        var thirtyAgo = new Date(2013, 01, 01, 01, 01, 00);

        it('should return "half a minute ago!"', function() {
            var fuzzy = new FuzzyTime();
            fuzzy.at("half a minute ago!", "T30S");
            var text = fuzzy.build(thirtyAgo, pretendNow);
            assert.equal("half a minute ago!", text);
        });

        it('should return string versino of "thirtyAgo"', function() {
            var fuzzy = new FuzzyTime();
            fuzzy.at("45 seconds ago", [{time: 45, unit: FuzzyTime.Unit.SECOND}]);
            var text = fuzzy.build(thirtyAgo, pretendNow);
            assert.equal(text, thirtyAgo.toLocaleString());
        });

        it('should return string version of "thirtyAgo"', function() {
            var fuzzy = new FuzzyTime();
            fuzzy.at("10 seconds ago", [{time: 10, unit: FuzzyTime.Unit.SECOND}]);
            var text = fuzzy.build(thirtyAgo, pretendNow);
            assert.equal(text, thirtyAgo.toLocaleString());
        });

        it('should return "last year"', function() {
           var fuzzy = new FuzzyTime();
           var a = new Date("10/21/2013 11:15:10 AM");
           var b = new Date("10/21/2012 11:15:10 AM");
           fuzzy.at("last year", [{time: 1, unit: FuzzyTime.Unit.YEAR}]);
           assert.equal('last year', fuzzy.build(b, a));
        });

        it('should return "last month"', function() {
           var fuzzy = new FuzzyTime();
           var a = new Date("10/21/2013 11:15:10 AM");
           var b = new Date("9/21/2013 11:15:10 AM");
           fuzzy.at("last month", [{time: 1, unit: FuzzyTime.Unit.MONTH}]);
           assert.equal('last month', fuzzy.build(b, a));
        });

        it('should return "month and a day ago"', function() {
           var fuzzy = new FuzzyTime();
           var a = new Date("10/21/2013 11:15:10 AM");
           var b = new Date("09/20/2013 11:15:10 AM");
           fuzzy.at("month and a day ago", [{time: 1, unit: FuzzyTime.Unit.MONTH}, {time: 1, unit: FuzzyTime.Unit.DAY}]);
           assert.equal('month and a day ago', fuzzy.build(b, a));
        });

        it('should return "a year ago" and then "two years ago"', function() {
           var fuzzy = new FuzzyTime();
           var a = new Date("01/21/2013 11:15:10 AM");
           var b = new Date("01/21/2014 11:15:10 AM");
           var c = new Date("01/21/2015 11:15:10 AM");
           var d = new Date("01/21/2021 11:15:10 AM");
           var e = new Date("07/22/2021 23:15:10");
           fuzzy.at("eight and a half years ago", [{time: 8, unit: FuzzyTime.Unit.YEAR}, {time: .5, unit: FuzzyTime.Unit.YEAR}]);
           fuzzy.at("two years ago", [{time: 24, unit: FuzzyTime.Unit.MONTH}]);
           fuzzy.at("a year to go", [{time: -12, unit: FuzzyTime.Unit.MONTH}]);
           fuzzy.at("eight years ago", [{time: 96, unit: FuzzyTime.Unit.MONTH}]);
           fuzzy.at("a year ago", [{time: 12, unit: FuzzyTime.Unit.MONTH}]);
           assert.equal('a year ago', fuzzy.build(a, b));
           assert.equal('two years ago', fuzzy.build(a, c));
           assert.equal('a year to go', fuzzy.build(b, a));
           assert.equal('eight years ago', fuzzy.build(a, d));
           assert.equal('eight and a half years ago', fuzzy.build(a, e));
        });
    });

    describe("#before", function() {
        it('should return "yesterday" and "2 hours ago"', function() {
           var fuzzy = new FuzzyTime();
           var a = new Date("10/22/2013 12:54:58 PM");
           var b = new Date("10/21/2013 03:00:00 PM");
           var c = new Date("10/22/2013 02:54:58 PM");
           fuzzy.before("%h hours ago", "T16H");
           fuzzy.before("yesterday", "1D");
           assert.equal('yesterday', fuzzy.build(b, a));
           assert.equal('2 hours ago', fuzzy.build(a, c));
        });
    });

    describe("#after", function() {
        it('should return "4 days ago" and then string version of "c"', function() {
            var fuzzy = new FuzzyTime();
            var a = new Date(2013, 00, 05);
            var b = new Date(2013, 00, 01);
            var c = new Date(2013, 00, 04);
            fuzzy.before("too early", "P0.5D");
            fuzzy.before("too early", "P0.99D");
            fuzzy.after("%d days ago", "P3D");
            fuzzy.after("more than a week ago", "P7D");
            assert.equal('4 days ago', fuzzy.build(b, a));
            // No template is defined that applies to a 1-day-delta
            assert.equal(c.toLocaleString(), fuzzy.build(c, a));
        });
    });

    /*describe("#parseTimeString", function() {
        it('should return [[30, "seconds"]]', function() {
            var result = FuzzyTime.parseTimeString("30 seconds");
            assert.equal(result[0].value, 30);
            assert.equal(result[0].unit, FuzzyTime.Unit.SECOND);
        });

        it('should return [[30, "s"], [45, "mins"]]', function() {
            var result = FuzzyTime.parseTimeString("30 s 45 mins");
            assert.equal(result[0].value, 30);
            assert.equal(result[0].unit, FuzzyTime.Unit.SECOND);
            assert.equal(result[1].value, 45);
            assert.equal(result[1].unit, FuzzyTime.Unit.MINUTE);
        });
    });*/

});
