(function(root) {
    'use strict';

    /**
     * Constructs a new FuzzyTime instance.
     * @global
     * @class FuzzyTime
     * @author Robert Bost <bostrt at gmail dot com>
     */
    var FuzzyTime = function(){
        this.ats = [];
        this.befores = [];
        this.afters = [];
    };

    /**
     * Enumeration of time units supported by FuzzyTimeJS.
     * @memberOf FuzzyTime
     * @enum {number}
     * @readonly
     */
    FuzzyTime.Unit = {
        YEAR : 0,
        MONTH: 1,
        WEEK: 2,
        DAY: 3,
        HOUR: 4,
        MINUTE: 5,
        SECOND: 6
    };

    /**
     * Table storing conversion between IS0 8601 abbreviations, {@link FuzzyTime.Unit}s,
     * string format variables, and the time period/unit in seconds.
     * @private
     */
    FuzzyTime.conversions = [
        {argument : '%y', multiplier: 31536000, unit: FuzzyTime.Unit.YEAR, abbrev: 'Y'},
        {argument : '%M', multiplier: 2592000, unit: FuzzyTime.Unit.MONTH, abbrev: 'M'},
        {argument : '%w', multiplier: 604800, unit: FuzzyTime.Unit.WEEK, abbrev: 'W'},
        {argument : '%d', multiplier: 86400, unit: FuzzyTime.Unit.DAY, abbrev: 'D'},
        {argument : '%h', multiplier: 3600, unit: FuzzyTime.Unit.HOUR, abbrev: 'h'},
        {argument : '%m', multiplier: 60, unit: FuzzyTime.Unit.MINUTE, abbrev: 'm'},
        {argument : '%s', multiplier: 1, unit: FuzzyTime.Unit.SECOND, abbrev: 's'}
    ];

    /**
     * Get the days in the month of the given date.
     * @memberOf FuzzyTime
     * @param {Date} date The date that you want to count the days in the month of.
     * @returns {number} days in the month in the given date
     */
    FuzzyTime.getDaysInMonth = function(date) {
        switch(date.getMonth()) {
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return 31;
            case 3:
            case 5:
            case 8:
            case 10:
                return 30;
            case 1:
                return isLeapYear(date) ? 29 : 28;
        }
    };

    /**
     * Check if the given date is a leap year.
     * @memberOf FuzzyTime
     * @param {Date} date The date that you want to check for a leap year.
     * @returns {boolean} True if date is a leap year. False otherwise.
     */
     FuzzyTime.isLeapYear = function(date) {
        var year = date.getFullYear();
        if (year % 400 === 0) {
            return true;
        } else if (year % 100 === 0) {
            return false;
        } else if (year % 4 === 0) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Get the {@link FuzzyTime.Unit} enum of a given ISO 8601 duration unit.
     * @memberOf FuzzyTime
     * @param {string} string The ISO 8601 Duration unit (e.g. "Y", "M", "S", etc)
     * {@link FuzzyTime.Unit} of.
     * @returns {FuzzyTime.Unit} time unit enum
     * @private
     */
    FuzzyTime.findFuzzyTimeUnit = function(string) {
        for (var i in FuzzyTime.conversions) {
            if (FuzzyTime.conversions[i].abbrev === string) {
                return FuzzyTime.conversions[i].unit;
            }
        }
    };

    /**
     * Convert an IS0 8601 Duration into something the FuzzyTimeJS library can work
     * with a little easier.
     *
     * @memberOf FuzzyTime
     * @param {string} delta An IS0 8601 Duration
     * @returns {list} The duration in an array of
     * maps like:
     * <pre>[
     *   {time: 1, unit: FuzzyTime.Unit.MINUTE},
     *   {time: 30, unit: FuzzyTime.Unit.SECOND},
     *   ...
     * ]</pre>
     */
    FuzzyTime.parseDuration = function(delta) {
        var lowerDelta = delta.toLowerCase().trim();
        var period, time, value = "";
        delta = [];
        time = lowerDelta.split("t")[1];
        period = lowerDelta.split("t")[0].split("p").join("");

        if (period != null && period.length > 0) {
            for (var i = 0; i < period.length; i++) {
                if (/[a-z]/.test(period[i])) {
                    // We've hit the Unit part
                    delta.push({time: parseFloat(value), unit: FuzzyTime.findFuzzyTimeUnit(period[i].toUpperCase())});
                    value = "";
                } else {
                    value += period[i];
                }
            }
        }
        
        if (time != null && time.length > 0) {
            for (var i = 0; i < time.length; i++) {
                if (/[a-z]/.test(time[i])) {
                    // We've hit the Unit part
                    delta.push({time: parseFloat(value), unit: FuzzyTime.findFuzzyTimeUnit(time[i])});
                    value = "";
                } else {
                    value += time[i];
                }
            }
        }
        
        return delta;
    };


    /**
     * Adds the given time value to the given date. The time value's unit is
     * specified by the fuzzyTimeUnit parameter.
     * @param {Date} date - A date you want to add time to
     * @param {float} timeValue - The time value you want to add to the given date
     * @param {FuzzyTime.Unit} fuzzyTimeUnit - The unit of time you want to add to given date
     * @returns {Date} A date with all given time added to it.
     */
    FuzzyTime.addTime = function(date, timeValue, fuzzyTimeUnit) {
        var dateCopy = new Date(date);
        var timeValueInt = Math.floor(timeValue);
        var decimal = 0;

        //console.log("addTimeString ( " + date + ", " + timeValue + ", " + fuzzyTimeUnit);

        if (timeValueInt < timeValue) {
            // The Math.floor call we did earlier caused the decimal place to be dropped...making
            // the timeValueInt variable be smaller than original timeValue.
            // Add the remaining decimal part of timestring.
            decimal = timeValue - timeValueInt;
        }

        switch(fuzzyTimeUnit) {
            case FuzzyTime.Unit.YEAR:
                dateCopy.setYear(dateCopy.getFullYear() + timeValueInt);
                if (decimal > 0) {
                    // Take the new current year and add some days!
                    var daysInYear = FuzzyTime.isLeapYear(dateCopy) ? 366 : 365;
                    decimal = Math.round(decimal*1000)/1000;
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * daysInYear, FuzzyTime.Unit.DAY);
                }
                break;
            case FuzzyTime.Unit.MONTH:
                dateCopy.setMonth(dateCopy.getMonth() + timeValueInt);
                if (decimal > 0) {
                    // Add some dayzzeee
                    var daysInMonth = FuzzyTime.getDaysInMonth(dateCopy);
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * daysInMonth, FuzzyTime.Unit.DAY);
                }
                break;
            case FuzzyTime.Unit.WEEK:
                dateCopy.setDate(dateCopy.getDate() + (timeValueInt * 7));
                if (decimal > 0) {
                    // Add some days.
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * 7, FuzzyTime.Unit.DAY);
                }
                break;
            case FuzzyTime.Unit.DAY:
                dateCopy.setDate(dateCopy.getDate() + timeValueInt);
                if (decimal > 0) {
                    // Add some hours
                    decimal = Math.round(decimal*1000)/1000;
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * 24, FuzzyTime.Unit.HOUR);
                }
                break;
            case FuzzyTime.Unit.HOUR:
                dateCopy.setHours(dateCopy.getHours() + timeValueInt);
                if (decimal > 0) {
                    // Add some minutes
                    decimal = Math.round(decimal*1000)/1000;
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * 60, FuzzyTime.Unit.MINUTE);
                }
                break;
            case FuzzyTime.Unit.MINUTE:
                dateCopy.setMinutes(dateCopy.getMinutes() + timeValueInt);
                if (decimal > 0) {
                    // Add some minutes
                    decimal = Math.round(decimal*1000)/1000;
                    dateCopy = FuzzyTime.addTime(dateCopy, decimal * 60, FuzzyTime.Unit.SECOND);
                }
                break;
            case FuzzyTime.Unit.SECOND:
                dateCopy.setSeconds(dateCopy.getSeconds() + Math.round(timeValueInt));
                break;
        }

        return dateCopy;
    };

    /**
     * Configure this FuzzyTime to return the given string format (with values plugged
     * in) when {@link FuzzyTime#build} is called and the given time delta has been
     * reached.
     * @param {string} format The string format
     * @param {(string|list)} delta The time delta at which to display. This can be either
     * an ISO 8601 Duration (string) or a list of maps like:
     * <pre>[
     *   {time: 1, unit: FuzzyTime.Unit.MINUTE},
     *   {time: 30, unit: FuzzyTime.Unit.SECOND},
     *   ...
     * ]</pre>
     * @instance
     * @memberOf FuzzyTime
     */
    FuzzyTime.prototype.at = function(format, delta) {
        if (typeof delta === 'string') {
            // Parse string as ISO 8601 duration
            this.ats.push({format: format, delta: FuzzyTime.parseDuration(delta)});
        } else {
            this.ats.push({format: format, delta: delta});
        }
    };

    /**
     * Configures this FuzzyTime instance to return the given string format (with
     * values plugged in) any time {@link FuzzyTime#build} is called and
     * <b>before</b> the given time delta has passed.
     * @param {string} format The string format
     * @param {(string|list)} delta The time delta at which to display. This can be either
     * an ISO 8601 Duration (string) or a list of maps like:
     * <pre>[
     *   {time: 1, unit: FuzzyTime.Unit.MINUTE},
     *   {time: 30, unit: FuzzyTime.Unit.SECOND},
     *   ...
     * ]</pre>
     * @instance
     * @memberOf FuzzyTime
     */
    FuzzyTime.prototype.before = function(format, delta) {
        if (typeof delta === 'string') {
            // Parse string as ISO 8601 duration
            this.befores.push({format: format, delta: FuzzyTime.parseDuration(delta)});
        } else {
            this.befores.push({format: format, delta: delta});
        }
    };

    /**
     * Configures this FuzzyTime instance to return the given string format (with
     * values plugged in) any time that {@link FuzzyTime#build} is called and
     * <b>after</b> the given time delta has passed
     *
     * @param {string} format The string format
     * @param {(string|list)} delta The time delta at which to display. This can be either
     * an ISO 8601 Duration (string) or a list of maps like:
     * <pre>[
     *   {time: 1, unit: FuzzyTime.Unit.MINUTE},
     *   {time: 30, unit: FuzzyTime.Unit.SECOND},
     *   ...
     * ]</pre>
     * @memberOf FuzzyTime
     * @instance
     */
    FuzzyTime.prototype.after = function(format, delta) {
        if (typeof delta === 'string') {
            // Parse string as ISO 8601 duration
            this.afters.push({format: format, delta: FuzzyTime.parseDuration(delta)});
        } else {
            this.afters.push({format: format, delta: delta});
        }
    };

    /**
     * Populates the variables in a string template/format.
     * @param {number} seconds - The time delta in seconds
     * @param {string} format - The format that needs to have variables populated
     */
    FuzzyTime.prototype.buildString = function(seconds, format) {
        // Loop over all possible template arguments
        for (var idx in FuzzyTime.conversions) {
            var curr = FuzzyTime.conversions[idx];
            // Check if the string format contains the current argument we are
            // looping over
            if (format.search(curr.argument) >= 0) {
                // The format contains the argument we're looping over.
                // Convert the remaining seconds to the argument's unit (year, min, etc.)
                var argVal = Math.floor(seconds / curr.multiplier);
                seconds = seconds - argVal * curr.multiplier;
                format = format.replace(curr.argument, argVal);
                // Recurse, need to continue replacing argument.
                return this.buildString(seconds, format);
            }
        }

        return format;
    };

    /**
     * Build a "fuzzy" interpretation of the difference between the provided dates
     * based on previous configurations (using {@link FuzzyTime#at}, {@link FuzzyTime#before}, and
     * {@link FuzzyTime#after}).
     * @param {date} date - The starting date
     * @param {date=} referenceDate - The ending date. If nothing is provided
     * for this parameter, it defaults to <b>now</b> (i.e. <tt>new Date()</tt>).
     * @memberOf FuzzyTime
     * @returns {string} The "fuzzy" timestamp for the differene between the two
     * provided dates (if only one date is provided, <i>now</i> is used for 
     * second date). If there is no "at", "before", or "after" configuration
     * that applies to the difference between the dates provided, the locale
     * string of the <b>date</b> parameter is provided.
     */
    FuzzyTime.prototype.build = function(date, referenceDate) {
        if (typeof referenceDate === 'undefined' || referenceDate === null) {
            referenceDate = new Date();
        }
        
        var delta = Math.round((referenceDate - date)/1000);

        // Check "at"
        for (var atIdx in this.ats) {
            var xDate = new Date(date);
            var at = this.ats[atIdx];
            
            for (var i in at.delta) {
                xDate = FuzzyTime.addTime(xDate, at.delta[i].time, at.delta[i].unit);
            }

            // Is the difference between the two provided dates equal
            // to the "at" configuration we're looping on?
            if (xDate.toUTCString() === referenceDate.toUTCString()) {
                return this.buildString(delta, at.format);
            }
        }
        
        if (delta > 0) {
            // Check "before"
            for (var beforeIdx in this.befores) {
                var xDate = new Date(date);
                var before = this.befores[beforeIdx];

                for (var i in before.delta) {
                    xDate = FuzzyTime.addTime(xDate, before.delta[i].time, before.delta[i].unit);
                }

                // Is the difference between the two provided dates less than
                // the "before" configuration we're looping on?
                if (!(date > referenceDate) && xDate >= referenceDate) {
                    return this.buildString(delta, before.format);
                }
            }
            
            // Check "after"
            for (var afterIdx in this.afters) {
                var xDate = new Date(date);
                var after = this.afters[afterIdx];
                
                for (var i in after.delta) {
                    xDate = FuzzyTime.addTime(date, after.delta[i].time, after.delta[i].unit);
                }

                // Is the difference between the two provided dates greater than
                // the "after" configuration we're looping on?
                if (!(date > referenceDate) && xDate <= referenceDate) {
                    return this.buildString(delta, after.format);
                }
            }
        }

        // There were not any "at", "before", or "after" configurations
        // that apply to the date difference. Return the exact date...
        return date.toLocaleString();
    };

    // Export the FuzzyTime class to the world
    if (typeof define !== 'undefined' && define.amd) {
        define(FuzzyTime);
    } else if (typeof exports === 'object') {
        module.exports = FuzzyTime;
    } else {
        root.FuzzyTime = FuzzyTime;
    }
    
})(this);