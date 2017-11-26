var gpio = require('rpi-gpio');
var Event = require('events');

var Config = require('../config/blink.js');

module.exports = function (args) {

    var that = this;
    this.driver = gpio;

    this.defaults = {
        pins: [
            {
                pin: 7,
                init: that.driver.DIR_LOW
            },
            {
                pin: 12,
                init: that.driver.DIR_HIGH
            }
        ],
    };
    this.options = {};
    this.loop = {
        blink: null
    };
    this.event = null;

    //
    this.init = function () {
        that.defaults = Object.assign(that.defaults, Config);
        that.options = that.defaults;
        if (args) {
            if (typeof args.options === 'object') {
                that.options = Object.assign(that.defaults, args.options);
            }
        }
        that.event = new Event();

        that.on('setup_complete', function () {
            console.log(' SETUP COMPLETE WITH ALL PINS', that.options.pins, '\n');
        });

        that.on('setup_pin_error', function (error, pin, initial) {
            console.log(' ERROR INIT PIN', pin, 'WITH', initial, 'ERROR', error);
        });
        that.on('setup_pin_before', function (pin, initial) {
            console.log(' INIT PIN', pin, 'WITH', initial);
        });
        that.on('setup_pin_complete', function (pin, initial) {
            console.log(' INIT COMPLETE PIN', pin, 'WITH', initial);
        });

        that.setup();
    };

    // setup inherits one pin by one
    this.setup = function (index, initial) {
        if (index === undefined) {
            index = 0;
        }

        if (index === that.options.pins.length) {
            that.emit('setup_complete');
            return;
        }

        var pin = that.options.pins[index];

        if (!initial) {
            initial = that.driver.DIR_LOW;
        }

        if (pin.init) {
            initial = pin.init;
        }
        that.emit('setup_pin_before', pin.pin, initial);
        that.driver.setup(pin.pin, initial, function (err) {
            if (err) {
                that.emit('setup_pin_error', err, pin.pin, initial);
            }
            that.emit('setup_pin_complete', pin.pin, initial);
            that.setup(index + 1, initial);
        });
    };

    // blink loop
    this.blink = function (pin) {
        console.log(' STARTING BLINK ');
        that.loop.blink = setInterval(function () {
            that.trigger(pin);
        }, that.options.speed);
    };

    // stop the blink loop
    this.stopBlink = function () {
        clearInterval(that.loop.blink);
    };

    // turn it on, then off
    this.trigger = function (pin, value) {
        if (pin === undefined) {
            pin = that.options.pins[0];
        }

        if (value === undefined) {
            value = true;
        }

        if (!that.driver) {
            return;
        }

        that.driver.write(pin, value, function (err) {
            if (err) throw err;
            console.log(' TRIGGER PIN', pin, 'WITH', value);
        });

        if (value === true) {
            setTimeout(function () {
                that.trigger(pin, false);
            }, that.options.duration);
        }
    };

    //
    this.turnOn = function (pin) {
        that.driver.write(pin, false, function (err) {
            if (err) throw err;
            console.log(' TURN ON PIN', pin);
        });
    };

    this.turnOff = function (pin) {
        that.driver.write(pin, true, function (err) {
            if (err) throw err;
            console.log(' TURN OFF PIN', pin);
        });
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
        trigger: that.trigger,
        turnOn: that.turnOn,
        turnOff: that.turnOff,
        on: that.on,
        emit: that.emit
    };

};