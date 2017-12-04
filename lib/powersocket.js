var Event = require('events');

module.exports = function (args) {
    var that = this;
    this.defaults = {
        duration: 100
    };
    this.options = {};
    this.event = null;
    this.driver = null;

    this.number = null;
    this.pin = null;
    this.inital = null;
    this.is = null;

    //
    this.init = function () {
        that.event = new Event();
        that.options = that.defaults;

        if (args) {
            if (typeof args.options === 'object') {
                that.options = Object.assign(that.defaults, args.options);
            }
            if (typeof args.data === 'object') {
                if (typeof args.data === 'object') {
                    that.number = args.data.number || false;
                    that.pin = args.data.pin || false;
                    that.initial = args.data.inital || false;
                    that.is = args.data.is || false;
                }
            }
            if (args.driver) {
                that.driver = args.driver;
            }
        }

        that.on('setup_pin_before', function () {
            //console.log(' BEFORE WRITE ON POWER SOCKET', that.number, 'ON PIN', that.pin);
        });
        that.on('setup_pin_complete', function () {
            console.log(' INIT POWER SOCKET SUCCESS', that.number, 'ON PIN', that.pin);
        });
        that.on('setup_pin_error', function () {
            console.log(' CAN`T WRITE ON POWER SOCKET', that.number, 'ON PIN', that.pin);
        });

    };

    this.turnOn = function () {
        that.driver.write(that.pin, false, function (err) {
            if (err) {
            }
            console.log(' TURN ON PIN', that.pin);
            that.is = true;
        });
    };

    this.turnOff = function () {
        that.driver.write(that.pin, true, function (err) {
            if (err) {
            }
            console.log(' TURN OFF PIN', that.pin);
            that.is = false;
        });
    };

    // turn it on, then off
    this.trigger = function (callback) {
        if (!that.driver)
            return;

        that.turnOn();
        setTimeout(function () {
            that.turnOff();
            if (typeof callback === 'function') {
                callback();
            }
        }, that.options.duration);
    };

    this.setup = function (callback) {
        that.emit('setup_pin_before');
        that.driver.setup(that.pin, that.initial, function (err) {
            if (err) {
                that.emit('setup_pin_error', err);
            }
            that.emit('setup_pin_complete');
            if (typeof callback === 'function') {
                callback();
            }
        });
    };

    this.toggle = function () {
        switch (that.is) {
            case true:
                that.turnOff();
                break;

            case false:
                that.turnOn();
                break;
        }
    };

    // on event wrapper
    this.on = function () {
        that.event.on.apply(that.event, Array.from(arguments));
    };

    // emit event wrapper
    this.emit = function () {
        that.event.emit.apply(that.event, Array.from(arguments));
    };

    that.init();

    return {
        setup: that.setup,
        trigger: that.trigger,
        toggle: that.toggle,
        turnOn: that.turnOn,
        turnOff: that.turnOff,
        on: that.on,
        emit: that.emit,

        number: that.number,
        pin: that.pin,
        initial: that.initial,
        is: that.is
    };
};

