var chokidar = require('chokidar');
var Event = require('events');

var Blink = require('./lib/blink.js');
var Motion = require('./lib/motion.js');
var Config = require('./config/app.js');

var App = function (args) {

    var that = this;

    this.defaults = {
        movement_timeout: 2000
    };
    this.options = {};

    this.blink = null;
    this.watcher = null;
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
        that.initMotion();
    };

    this.initMotion = function () {
        that.motion = new Motion();
        that.motion.on('ready',that.initBlink);
    };

    this.initBlink = function () {
        that.blink = new Blink();
        that.blink.on('ready',that.initWatcher);
    };

    this.initWatcher = function () {
        that.watcher = chokidar.watch(that.options.watch_folder, {
            ignored: /(^|[\/\\])\../,
            persistent: true,
            ignoreInitial: true
        });

        that.watcher.on('add', function (path) {
            var now = parseInt(Date.now());
            console.log(' ADDED FILE: ', path, now, (now - that.last_move));

            if (now - that.last_move > that.options.movement_timeout || that.last_move === false) {
                that.emit('movement_start');
            }
            clearTimeout(that.timeout_movement_stop);
            that.timeout_movement_stop = setTimeout(function () {
                that.emit('movement_stop');
            }, that.options.movement_timeout);

            that.last_move = now;
            that.blink.trigger(7);
        });

        that.on('movement_start', function () {
            console.log(' MOVEMENT START');
            that.blink.turnOn(12);
        });

        that.on('movement_stop', function () {
            console.log(' MOVEMENT STOP');
            that.blink.turnOff(12);
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

