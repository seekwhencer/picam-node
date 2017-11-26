var Event = require('events');

var Blink = require('./lib/blink.js');
var Motion = require('./lib/motion.js');
var Watch = require('./lib/watch.js');

var Config = require('./config/app.js');

var App = function (args) {

    var that = this;

    this.defaults = {
        movement_timeout: 2000
    };
    this.options = {};

    this.blink = null;
    this.watch = null;
    this.event = null;
    this.motion = null;

    this.last_move = null;
    this.timeout_movement_stop = null;

    this.init = function () {
        that.defaults = Object.assign(that.defaults, Config);
        that.options = that.defaults;
        if (args) {
            if (typeof args.options === 'object') {
                that.options = Object.assign(that.defaults, args.options);
            }
        }
        that.event = new Event();
        that.initBlink();
    };

    this.initBlink = function () {
        that.blink = new Blink();
        that.blink.on('ready', that.initMotion);
    };

    this.initMotion = function () {
        that.motion = new Motion();
        that.motion.on('ready', function(){
            that.initWatcher();
        });

        that.motion.on('movement_start', function () {
            that.blink.turnOn(12);
        });
        that.motion.on('movement_stop', function () {
            that.blink.turnOff(12);
        });
    };

    this.initWatcher = function () {
        that.watch = new Watch();
        that.watch.on('ready', function () {
            // ... dead end
        });
        that.watch.on('new_file', function () {
            that.blink.trigger(7);
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
        on: that.on,
        emit: that.emit
    };

}(); // <-- run it instantly

