var Event = require('events');
var fs = require('fs');
var keypress = require('keypress');

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
    this.stdin = null;

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

        if (that.options.motion === true)
            that.blink.on('driver_ready', that.initMotion);

        if (that.options.motion === false)
            that.blink.on('driver_ready', function () {
                that.blink.test();
                that.initConsoleInput();
            });
    };

    this.initMotion = function () {
        that.motion = new Motion();
        that.motion.on('ready', function () {
            //that.initWatcher();
            that.blink.turnOnSocket(3);
        });

        that.motion.on('new_file', function () {
            that.blink.triggerSocket(1);
        });

        that.motion.on('movement_start', function () {
            that.blink.turnOnSocket(2);
            that.blink.turnOffSocket(3);
        });
        that.motion.on('movement_stop', function () {
            that.blink.turnOffSocket(2);
            that.blink.turnOnSocket(3);
        });
    };

    this.initWatcher = function () {
        that.watch = new Watch();
        that.watch.on('ready', function () {
            // ... dead end
        });
    };

    this.initConsoleInput = function () {
        console.log(' CONSOLE MONITORING STARTED ');
        keypress(process.stdin);
        process.stdin.on('keypress', function (ch, key) {
            if (key && key.ctrl && key.name == 'c') {
                process.exit(0);
            }
            that.blink.toggleSocket(ch);
        });
        process.stdin.setRawMode(true);
        process.stdin.resume();
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

